import { NextResponse } from "next/server";
import { getCurrentMember, getPartnerMember } from "@/lib/server/session";
import { getOrCreateSession } from "@/lib/server/games";
import type { GameType } from "@/lib/content/games";

const VALID_TYPES: GameType[] = ["know_me", "who_more", "match", "agree", "choose"];

export async function GET(_req: Request, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type as GameType)) {
    return NextResponse.json({ error: "Nieznana gra." }, { status: 404 });
  }
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const partner = await getPartnerMember(member.coupleId, member.memberId);
  const session = await getOrCreateSession(member.coupleId, type as GameType);

  return NextResponse.json({ session, me: member.memberId, partner });
}
