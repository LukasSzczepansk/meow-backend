import { NextResponse } from "next/server";
import { db } from "@/db";
import { calmSessions } from "@/db/schema";
import { getCurrentMember } from "@/lib/server/session";
import { evaluateAchievements } from "@/lib/server/achievements";

export async function POST(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const body = await request.json();
  const activityType = (body?.activityType as string | undefined) ?? "breathing";
  const durationSeconds = (body?.durationSeconds as number | undefined) ?? null;

  await db.insert(calmSessions).values({
    coupleId: member.coupleId,
    memberId: member.memberId,
    activityType,
    durationSeconds,
  });

  await evaluateAchievements(member.coupleId);

  return NextResponse.json({ ok: true });
}
