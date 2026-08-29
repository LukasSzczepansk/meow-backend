import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getCurrentMember, getPartnerMember } from "@/lib/server/session";
import { isCoupleComplete } from "@/lib/server/onboarding";

export async function GET() {
  const member = await getCurrentMember();
  if (!member) {
    const headerStore = await headers();
    if (headerStore.get("x-meow-client") === "native") {
      return NextResponse.json({ error: "Sesja wygasła." }, { status: 401 });
    }
    return NextResponse.json({ member: null });
  }

  const partner = await getPartnerMember(member.coupleId, member.memberId);
  const complete = await isCoupleComplete(member.coupleId);

  return NextResponse.json({ member, partner, coupleComplete: complete });
}
