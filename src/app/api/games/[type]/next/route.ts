import { NextResponse } from "next/server";
import { getCurrentMember } from "@/lib/server/session";
import { createSession, getLatestSession } from "@/lib/server/games";
import type { GameType } from "@/lib/content/games";

export async function POST(_req: Request, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const validTypes: GameType[] = ["know_me", "match", "who_more", "agree", "choose"];
  if (!validTypes.includes(type as GameType)) return NextResponse.json({ error: "Nieznana gra." }, { status: 404 });

  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const latest = await getLatestSession(member.coupleId, type as GameType);
  if (latest && latest.status !== "completed") {
    return NextResponse.json({ session: latest });
  }
  const session = await createSession(member.coupleId, type as GameType);
  return NextResponse.json({ session });
}
