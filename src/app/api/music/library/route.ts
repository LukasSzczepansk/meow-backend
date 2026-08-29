import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { coupleTracks, members } from "@/db/schema";
import { getCurrentMember } from "@/lib/server/session";
import { createCoupleEvent } from "@/lib/server/events";

export async function GET() {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const rows = await db
    .select({
      id: coupleTracks.id,
      provider: coupleTracks.provider,
      providerTrackId: coupleTracks.providerTrackId,
      title: coupleTracks.title,
      artist: coupleTracks.artist,
      album: coupleTracks.album,
      artworkUrl: coupleTracks.artworkUrl,
      durationMs: coupleTracks.durationMs,
      sourcePermalink: coupleTracks.sourcePermalink,
      isOurSong: coupleTracks.isOurSong,
      createdAt: coupleTracks.createdAt,
      addedByMemberId: coupleTracks.addedByMemberId,
      addedByNickname: members.nickname,
    })
    .from(coupleTracks)
    .leftJoin(members, eq(members.id, coupleTracks.addedByMemberId))
    .where(eq(coupleTracks.coupleId, member.coupleId))
    .orderBy(desc(coupleTracks.isOurSong), desc(coupleTracks.createdAt));

  return NextResponse.json({
    tracks: rows.map((row) => ({
      ...row,
      streamable: row.provider === "audius" || row.provider === "youtube",
      addedByMe: row.addedByMemberId === member.memberId,
    })),
  });
}

export async function POST(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const body: unknown = await request.json();
  const input = parseTrackInput(body);
  if (!input) return NextResponse.json({ error: "Nieprawidłowy utwór." }, { status: 400 });

  const [created] = await db
    .insert(coupleTracks)
    .values({
      coupleId: member.coupleId,
      addedByMemberId: member.memberId,
      ...input,
    })
    .onConflictDoNothing({ target: [coupleTracks.coupleId, coupleTracks.provider, coupleTracks.providerTrackId] })
    .returning();

  const track = created ?? (await db
    .select()
    .from(coupleTracks)
    .where(and(
      eq(coupleTracks.coupleId, member.coupleId),
      eq(coupleTracks.provider, input.provider),
      eq(coupleTracks.providerTrackId, input.providerTrackId),
    ))
    .limit(1))[0];

  if (!track) return NextResponse.json({ error: "Nie udało się dodać utworu." }, { status: 500 });

  if (created) {
    await createCoupleEvent({
      coupleId: member.coupleId,
      actorMemberId: member.memberId,
      type: "music_added",
      payload: { trackId: track.id, title: track.title, artist: track.artist, provider: track.provider },
    });
  }

  return NextResponse.json({ ok: true, track, alreadyAdded: !created });
}

export async function PATCH(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const body = asRecord(await request.json());
  const id = asShortString(body?.id, 80);
  const isOurSong = typeof body?.isOurSong === "boolean" ? body.isOurSong : null;
  if (!id || isOurSong === null) return NextResponse.json({ error: "Nieprawidłowa zmiana." }, { status: 400 });

  const updated = await db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(coupleTracks)
      .where(and(eq(coupleTracks.id, id), eq(coupleTracks.coupleId, member.coupleId)))
      .limit(1);
    if (!existing) return null;

    if (isOurSong) {
      await tx
        .update(coupleTracks)
        .set({ isOurSong: false })
        .where(eq(coupleTracks.coupleId, member.coupleId));
    }

    const [next] = await tx
      .update(coupleTracks)
      .set({ isOurSong })
      .where(and(eq(coupleTracks.id, id), eq(coupleTracks.coupleId, member.coupleId)))
      .returning();
    return next ?? null;
  });

  if (!updated) return NextResponse.json({ error: "Nie znaleziono utworu." }, { status: 404 });

  if (isOurSong) {
    await createCoupleEvent({
      coupleId: member.coupleId,
      actorMemberId: member.memberId,
      type: "music_our_song",
      payload: { trackId: updated.id, title: updated.title, artist: updated.artist },
    });
  }

  return NextResponse.json({ ok: true, track: updated });
}

export async function DELETE(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const url = new URL(request.url);
  const id = (url.searchParams.get("id") ?? "").trim();
  if (!id) return NextResponse.json({ error: "Brak utworu." }, { status: 400 });

  const [removed] = await db
    .delete(coupleTracks)
    .where(and(eq(coupleTracks.id, id), eq(coupleTracks.coupleId, member.coupleId)))
    .returning({ id: coupleTracks.id });

  if (!removed) return NextResponse.json({ error: "Nie znaleziono utworu." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

function parseTrackInput(value: unknown) {
  const body = asRecord(value);
  if (!body) return null;
  const provider = body.provider === "youtube" || body.provider === "audius" || body.provider === "musicbrainz" ? body.provider : null;
  const providerTrackId = asShortString(body.providerTrackId, 180);
  const title = asShortString(body.title, 240);
  const artist = asShortString(body.artist, 240);
  if (!provider || !providerTrackId || !title || !artist) return null;

  const duration = typeof body.durationMs === "number" && Number.isFinite(body.durationMs)
    ? Math.max(0, Math.min(24 * 60 * 60 * 1000, Math.round(body.durationMs)))
    : null;

  return {
    provider,
    providerTrackId,
    title,
    artist,
    album: asShortString(body.album, 300),
    artworkUrl: safeHttpsUrl(body.artworkUrl),
    durationMs: duration,
    sourcePermalink: safeHttpsUrl(body.sourcePermalink),
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : null;
}

function asShortString(value: unknown, max: number): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

function safeHttpsUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}
