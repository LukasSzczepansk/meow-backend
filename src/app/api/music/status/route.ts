import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { coupleTracks } from "@/db/schema";
import { getCurrentMember } from "@/lib/server/session";
import { asMusicProvider, asShortString } from "@/lib/server/music-track-input";

export async function GET(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const url = new URL(request.url);
  const provider = asMusicProvider(url.searchParams.get("provider"));
  const providerTrackId = asShortString(url.searchParams.get("providerTrackId"), 180);
  if (!provider || !providerTrackId) {
    return NextResponse.json({ error: "Nieprawidłowy utwór." }, { status: 400 });
  }

  const [track] = await db
    .select()
    .from(coupleTracks)
    .where(and(
      eq(coupleTracks.coupleId, member.coupleId),
      eq(coupleTracks.provider, provider),
      eq(coupleTracks.providerTrackId, providerTrackId),
    ))
    .limit(1);

  return NextResponse.json({ track: track ?? null });
}
