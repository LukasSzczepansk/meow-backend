import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { coupleTracks } from "@/db/schema";
import { getCurrentMember } from "@/lib/server/session";
import { parseMusicTrackInput } from "@/lib/server/music-track-input";

export async function POST(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowy JSON." }, { status: 400 });
  }

  const input = parseMusicTrackInput(body);
  if (!input) return NextResponse.json({ error: "Nieprawidłowy utwór." }, { status: 400 });

  const now = new Date();
  const [created] = await db
    .insert(coupleTracks)
    .values({
      coupleId: member.coupleId,
      addedByMemberId: member.memberId,
      ...input,
      audioStatus: input.provider === "youtube" ? "youtube_only" : "unavailable",
      listenCount: 1,
      lastPlayedAt: now,
    })
    .onConflictDoNothing({
      target: [coupleTracks.coupleId, coupleTracks.provider, coupleTracks.providerTrackId],
    })
    .returning();

  if (created) {
    return NextResponse.json({ ok: true, created: true, track: created });
  }

  const [track] = await db
    .update(coupleTracks)
    .set({
      title: input.title,
      artist: input.artist,
      album: input.album,
      artworkUrl: input.artworkUrl,
      durationMs: input.durationMs,
      sourcePermalink: input.sourcePermalink,
      listenCount: sql`${coupleTracks.listenCount} + 1`,
      lastPlayedAt: now,
    })
    .where(and(
      eq(coupleTracks.coupleId, member.coupleId),
      eq(coupleTracks.provider, input.provider),
      eq(coupleTracks.providerTrackId, input.providerTrackId),
    ))
    .returning();

  if (!track) return NextResponse.json({ error: "Nie udało się zapisać odsłuchu." }, { status: 500 });
  return NextResponse.json({ ok: true, created: false, track });
}
