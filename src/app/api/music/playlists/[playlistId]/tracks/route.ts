import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { coupleTracks, musicPlaylists, musicPlaylistTracks } from "@/db/schema";
import { getCurrentMember } from "@/lib/server/session";

export async function POST(request: Request, { params }: { params: Promise<{ playlistId: string }> }) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });
  const { playlistId } = await params;
  const body = asRecord(await request.json());
  const trackId = shortString(body?.trackId, 80);
  if (!trackId) return NextResponse.json({ error: "Brak utworu." }, { status: 400 });

  const [playlist] = await db
    .select({ id: musicPlaylists.id })
    .from(musicPlaylists)
    .where(and(eq(musicPlaylists.id, playlistId), eq(musicPlaylists.coupleId, member.coupleId)))
    .limit(1);
  if (!playlist) return NextResponse.json({ error: "Nie znaleziono playlisty." }, { status: 404 });

  const [track] = await db
    .select({ id: coupleTracks.id })
    .from(coupleTracks)
    .where(and(eq(coupleTracks.id, trackId), eq(coupleTracks.coupleId, member.coupleId)))
    .limit(1);
  if (!track) return NextResponse.json({ error: "Ten utwór nie należy do Waszej biblioteki." }, { status: 404 });

  const [last] = await db
    .select({ position: musicPlaylistTracks.position })
    .from(musicPlaylistTracks)
    .where(eq(musicPlaylistTracks.playlistId, playlistId))
    .orderBy(desc(musicPlaylistTracks.position))
    .limit(1);

  const [created] = await db
    .insert(musicPlaylistTracks)
    .values({
      playlistId,
      trackId,
      addedByMemberId: member.memberId,
      position: (last?.position ?? -1) + 1,
    })
    .onConflictDoNothing({ target: [musicPlaylistTracks.playlistId, musicPlaylistTracks.trackId] })
    .returning();

  await db.update(musicPlaylists).set({ updatedAt: new Date() }).where(eq(musicPlaylists.id, playlistId));
  return NextResponse.json({ ok: true, alreadyAdded: !created });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ playlistId: string }> }) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });
  const { playlistId } = await params;
  const body = asRecord(await request.json());
  const trackIds = Array.isArray(body?.trackIds)
    ? body.trackIds.filter((value): value is string => typeof value === "string" && value.trim().length > 0).slice(0, 100)
    : [];
  if (!trackIds.length) return NextResponse.json({ error: "Brak kolejności." }, { status: 400 });

  const [playlist] = await db
    .select({ id: musicPlaylists.id })
    .from(musicPlaylists)
    .where(and(eq(musicPlaylists.id, playlistId), eq(musicPlaylists.coupleId, member.coupleId)))
    .limit(1);
  if (!playlist) return NextResponse.json({ error: "Nie znaleziono playlisty." }, { status: 404 });

  const current = await db
    .select({ trackId: musicPlaylistTracks.trackId })
    .from(musicPlaylistTracks)
    .where(eq(musicPlaylistTracks.playlistId, playlistId));
  const currentSet = new Set(current.map((row) => row.trackId));
  if (trackIds.length !== currentSet.size || trackIds.some((id) => !currentSet.has(id))) {
    return NextResponse.json({ error: "Nieprawidłowa kolejność utworów." }, { status: 400 });
  }

  await db.transaction(async (tx) => {
    for (const [position, trackId] of trackIds.entries()) {
      await tx
        .update(musicPlaylistTracks)
        .set({ position })
        .where(and(eq(musicPlaylistTracks.playlistId, playlistId), eq(musicPlaylistTracks.trackId, trackId)));
    }
    await tx.update(musicPlaylists).set({ updatedAt: new Date() }).where(eq(musicPlaylists.id, playlistId));
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ playlistId: string }> }) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });
  const { playlistId } = await params;
  const trackId = new URL(request.url).searchParams.get("trackId")?.trim();
  if (!trackId) return NextResponse.json({ error: "Brak utworu." }, { status: 400 });

  const [playlist] = await db
    .select({ id: musicPlaylists.id })
    .from(musicPlaylists)
    .where(and(eq(musicPlaylists.id, playlistId), eq(musicPlaylists.coupleId, member.coupleId)))
    .limit(1);
  if (!playlist) return NextResponse.json({ error: "Nie znaleziono playlisty." }, { status: 404 });

  const [deleted] = await db
    .delete(musicPlaylistTracks)
    .where(and(eq(musicPlaylistTracks.playlistId, playlistId), eq(musicPlaylistTracks.trackId, trackId)))
    .returning({ id: musicPlaylistTracks.id });

  if (!deleted) return NextResponse.json({ error: "Utworu nie ma na tej playliście." }, { status: 404 });
  await db.update(musicPlaylists).set({ updatedAt: new Date() }).where(eq(musicPlaylists.id, playlistId));
  return NextResponse.json({ ok: true });
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : null;
}

function shortString(value: unknown, max: number): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}
