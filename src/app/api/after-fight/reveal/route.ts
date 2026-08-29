import { NextResponse } from "next/server";
import { getCurrentMember, getPartnerMember } from "@/lib/server/session";
import { getSessionStatus, revealSession } from "@/lib/server/afterFight";

export async function POST(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const body = await request.json();
  const sessionId = body?.sessionId as string | undefined;
  if (!sessionId) return NextResponse.json({ error: "Brak identyfikatora sesji." }, { status: 400 });

  const partner = await getPartnerMember(member.coupleId, member.memberId);
  const status = await getSessionStatus(sessionId, member.coupleId, member.memberId, partner?.memberId ?? null);
  if (!status) return NextResponse.json({ error: "Nie znaleziono rozmowy." }, { status: 404 });
  if (status.revealed) return NextResponse.json({ ok: true, alreadyRevealed: true });
  if (!status.bothDone) return NextResponse.json({ error: "Jeszcze nie oboje skończyliście." }, { status: 400 });

  const rewarded = await revealSession(sessionId, member.coupleId);
  return NextResponse.json({ ok: true, alreadyRevealed: !rewarded });
}
