import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
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

  // The mobile app currently asks to prepare only YouTube fallback tracks.
  // This endpoint ONLY records a preparation request. It does not extract,
  // download or convert YouTube media.
  if (input.provider !== "youtube") {
    return NextResponse.json({ accepted: false, status: "not_needed" });
  }

  const now = new Date();
  await db
    .insert(coupleTracks)
    .values({
      coupleId: member.coupleId,
      addedByMemberId: member.memberId,
      ...input,
      audioStatus: "requested",
      preparationRequestedAt: now,
    })
    .onConflictDoNothing({
      target: [coupleTracks.coupleId, coupleTracks.provider, coupleTracks.providerTrackId],
    });

  const whereTrack = and(
    eq(coupleTracks.coupleId, member.coupleId),
    eq(coupleTracks.provider, input.provider),
    eq(coupleTracks.providerTrackId, input.providerTrackId),
  );

  const [existing] = await db.select().from(coupleTracks).where(whereTrack).limit(1);
  if (!existing) return NextResponse.json({ error: "Nie udało się przygotować rekordu." }, { status: 500 });

  if (existing.audioUrl) {
    if (existing.audioStatus !== "ready") {
      const [ready] = await db
        .update(coupleTracks)
        .set({ audioStatus: "ready", audioUpdatedAt: now })
        .where(whereTrack)
        .returning();
      return NextResponse.json({ accepted: true, status: "ready", track: ready ?? existing });
    }
    return NextResponse.json({ accepted: true, status: "ready", track: existing });
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
      audioStatus: "requested",
      preparationRequestedAt: now,
    })
    .where(whereTrack)
    .returning();

  return NextResponse.json({
    accepted: true,
    status: "requested",
    track: track ?? existing,
    note: "Waiting for an authorized audio file/source to be attached.",
  });
}
