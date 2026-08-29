import { NextResponse } from "next/server";
import { getCurrentMember, getPartnerMember } from "@/lib/server/session";
import { getOrCreateActiveSession, getSessionStatus } from "@/lib/server/afterFight";

export async function GET() {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const partner = await getPartnerMember(member.coupleId, member.memberId);
  const session = await getOrCreateActiveSession(member.coupleId);
  const status = await getSessionStatus(session.id, member.coupleId, member.memberId, partner?.memberId ?? null);

  return NextResponse.json({ ...status, partnerNickname: partner?.nickname ?? null });
}
