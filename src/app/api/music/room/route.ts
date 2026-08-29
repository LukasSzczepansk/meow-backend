import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { musicRooms } from "@/db/schema";
import { getCurrentMember } from "@/lib/server/session";
import { createCoupleEvent } from "@/lib/server/events";
import type { MusicProviderName } from "@/lib/music/types";

export async function GET() {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const [room] = await db
    .select()
    .from(musicRooms)
    .where(eq(musicRooms.coupleId, member.coupleId))
    .limit(1);

  return NextResponse.json({ room: room?.providerTrackId ? serializeRoom(room, member.memberId) : null });
}

export async function PATCH(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const body = asRecord(await request.json());
  const action = typeof body?.action === "string" ? body.action : "";
  const now = new Date();

  if (action === "setTrack") {
    const track = parsePlayableTrack(body?.track);
    if (!track) return NextResponse.json({ error: "Ten utwór nie może być odtworzony w pokoju." }, { status: 400 });
    const shouldPlay = body?.play !== false;

    const [room] = await db
      .insert(musicRooms)
      .values({
        coupleId: member.coupleId,
        provider: track.provider,
        providerTrackId: track.providerTrackId,
        title: track.title,
        artist: track.artist,
        artworkUrl: track.artworkUrl,
        durationMs: track.durationMs,
        sourcePermalink: track.sourcePermalink,
        isPlaying: shouldPlay,
        positionMs: 0,
        stateChangedAt: now,
        updatedByMemberId: member.memberId,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: musicRooms.coupleId,
        set: {
          provider: track.provider,
          providerTrackId: track.providerTrackId,
          title: track.title,
          artist: track.artist,
          artworkUrl: track.artworkUrl,
          durationMs: track.durationMs,
          sourcePermalink: track.sourcePermalink,
          isPlaying: shouldPlay,
          positionMs: 0,
          stateChangedAt: now,
          updatedByMemberId: member.memberId,
          updatedAt: now,
        },
      })
      .returning();

    await createCoupleEvent({
      coupleId: member.coupleId,
      actorMemberId: member.memberId,
      type: "music_room_started",
      payload: { title: track.title, artist: track.artist, provider: track.provider },
    });

    return NextResponse.json({ ok: true, room: serializeRoom(room, member.memberId) });
  }

  const [current] = await db
    .select()
    .from(musicRooms)
    .where(eq(musicRooms.coupleId, member.coupleId))
    .limit(1);

  if (!current?.providerTrackId) return NextResponse.json({ error: "Pokój muzyczny jest pusty." }, { status: 404 });

  const currentPosition = computePositionMs(current);
  const requestedPosition = clampPosition(body?.positionMs, current.durationMs, currentPosition);

  if (action === "play" || action === "pause" || action === "seek") {
    const nextPlaying = action === "play" ? true : action === "pause" ? false : current.isPlaying;
    const [updated] = await db
      .update(musicRooms)
      .set({
        isPlaying: nextPlaying,
        positionMs: requestedPosition,
        stateChangedAt: now,
        updatedByMemberId: member.memberId,
        updatedAt: now,
      })
      .where(eq(musicRooms.coupleId, member.coupleId))
      .returning();

    return NextResponse.json({ ok: true, room: serializeRoom(updated, member.memberId) });
  }

  if (action === "stop") {
    const [updated] = await db
      .update(musicRooms)
      .set({
        isPlaying: false,
        positionMs: 0,
        stateChangedAt: now,
        updatedByMemberId: member.memberId,
        updatedAt: now,
      })
      .where(eq(musicRooms.coupleId, member.coupleId))
      .returning();
    return NextResponse.json({ ok: true, room: serializeRoom(updated, member.memberId) });
  }

  return NextResponse.json({ error: "Nieznana akcja odtwarzacza." }, { status: 400 });
}

function serializeRoom(room: typeof musicRooms.$inferSelect, memberId: string) {
  return {
    provider: room.provider as MusicProviderName,
    providerTrackId: room.providerTrackId,
    title: room.title,
    artist: room.artist,
    artworkUrl: room.artworkUrl,
    durationMs: room.durationMs,
    sourcePermalink: room.sourcePermalink,
    isPlaying: room.isPlaying,
    positionMs: room.positionMs,
    computedPositionMs: computePositionMs(room),
    stateChangedAt: room.stateChangedAt.toISOString(),
    updatedAt: room.updatedAt.toISOString(),
    updatedByMemberId: room.updatedByMemberId,
    updatedByMe: room.updatedByMemberId === memberId,
  };
}

function computePositionMs(room: typeof musicRooms.$inferSelect) {
  const elapsed = room.isPlaying ? Math.max(0, Date.now() - room.stateChangedAt.getTime()) : 0;
  const raw = Math.max(0, room.positionMs + elapsed);
  return room.durationMs ? Math.min(room.durationMs, raw) : raw;
}

function clampPosition(value: unknown, durationMs: number | null, fallback: number) {
  const numeric = typeof value === "number" && Number.isFinite(value) ? Math.round(value) : Math.round(fallback);
  const nonNegative = Math.max(0, numeric);
  return durationMs ? Math.min(durationMs, nonNegative) : nonNegative;
}

function parsePlayableTrack(value: unknown) {
  const row = asRecord(value);
  const provider = row?.provider === "youtube" || row?.provider === "audius" || row?.provider === "jamendo" ? row.provider : null;
  if (!row || !provider) return null;
  const providerTrackId = shortString(row.providerTrackId, 180);
  const title = shortString(row.title, 240);
  const artist = shortString(row.artist, 240);
  if (!providerTrackId || !title || !artist) return null;
  const durationMs = typeof row.durationMs === "number" && Number.isFinite(row.durationMs)
    ? Math.max(0, Math.min(24 * 60 * 60 * 1000, Math.round(row.durationMs)))
    : null;
  return {
    provider,
    providerTrackId,
    title,
    artist,
    artworkUrl: safeHttpsUrl(row.artworkUrl),
    durationMs,
    sourcePermalink: safeHttpsUrl(row.sourcePermalink),
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : null;
}

function shortString(value: unknown, max: number) {
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
