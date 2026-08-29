import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { coupleTracks } from "@/db/schema";
import { asMusicProvider, asRecord, asShortString, safeOwnedAudioUrl } from "@/lib/server/music-track-input";

function authorized(request: Request) {
  const expected = process.env.MUSIC_AUDIO_ADMIN_SECRET;
  if (!expected) return false;
  return request.headers.get("x-meow-music-admin") === expected;
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Brak dostępu." }, { status: 401 });

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowy JSON." }, { status: 400 });
  }
  const body = asRecord(raw);
  const provider = asMusicProvider(body?.provider);
  const providerTrackId = asShortString(body?.providerTrackId, 180);
  const audioUrl = safeOwnedAudioUrl(body?.audioUrl);
  if (!provider || !providerTrackId || !audioUrl) {
    return NextResponse.json({ error: "Nieprawidłowy provider/providerTrackId/audioUrl." }, { status: 400 });
  }

  const updatedAt = new Date();
  const rows = await db
    .update(coupleTracks)
    .set({
      audioUrl,
      audioStatus: "ready",
      audioUpdatedAt: updatedAt,
    })
    .where(and(
      eq(coupleTracks.provider, provider),
      eq(coupleTracks.providerTrackId, providerTrackId),
    ))
    .returning();

  if (!rows.length) {
    return NextResponse.json({ error: "Nie znaleziono utworu w katalogu Meow." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, updated: rows.length, tracks: rows });
}

export async function DELETE(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Brak dostępu." }, { status: 401 });

  const url = new URL(request.url);
  const provider = asMusicProvider(url.searchParams.get("provider"));
  const providerTrackId = asShortString(url.searchParams.get("providerTrackId"), 180);
  if (!provider || !providerTrackId) {
    return NextResponse.json({ error: "Nieprawidłowy utwór." }, { status: 400 });
  }

  const rows = await db
    .update(coupleTracks)
    .set({
      audioUrl: null,
      audioStatus: provider === "youtube" ? "youtube_only" : "unavailable",
      audioUpdatedAt: new Date(),
    })
    .where(and(
      eq(coupleTracks.provider, provider),
      eq(coupleTracks.providerTrackId, providerTrackId),
    ))
    .returning();

  return NextResponse.json({ ok: true, updated: rows.length });
}
