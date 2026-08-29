import { NextResponse } from "next/server";
import { getCurrentMember, getPartnerMember } from "@/lib/server/session";
import { isCoupleComplete } from "@/lib/server/onboarding";

export async function GET() {
  const member = await getCurrentMember();
  if (!member) {
    return NextResponse.json({ member: null });
  }

  const partner = await getPartnerMember(member.coupleId, member.memberId);
  const complete = await isCoupleComplete(member.coupleId);

  return NextResponse.json({ member, partner, coupleComplete: complete });
}
