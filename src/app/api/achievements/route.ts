import { NextResponse } from "next/server";
import { getCurrentMember } from "@/lib/server/session";
import { getAchievementStatuses } from "@/lib/server/achievements";

export async function GET() {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const achievements = await getAchievementStatuses(member.coupleId);
  return NextResponse.json({ achievements });
}
