import { NextResponse } from "next/server";
import { db } from "@/db";
import { challengeCompletions, members } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentMember } from "@/lib/server/session";
import { todayDateString } from "@/lib/server/date";
import { pickDailyChallenge } from "@/lib/content/challenges";
import { awardPaws } from "@/lib/server/rewards";
import { evaluateAchievements } from "@/lib/server/achievements";

export async function GET() {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const today = todayDateString();
  const challenge = pickDailyChallenge(`${member.coupleId}-${today}`);

  const [completion] = await db
    .select()
    .from(challengeCompletions)
    .where(and(eq(challengeCompletions.coupleId, member.coupleId), eq(challengeCompletions.entryDate, today)))
    .limit(1);

  let completedByNickname: string | null = null;
  if (completion?.completedByMemberId) {
    const [m] = await db.select({ nickname: members.nickname }).from(members).where(eq(members.id, completion.completedByMemberId)).limit(1);
    completedByNickname = m?.nickname ?? null;
  }

  return NextResponse.json({ challenge, completed: Boolean(completion), completedByNickname });
}

export async function POST() {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const today = todayDateString();
  const challenge = pickDailyChallenge(`${member.coupleId}-${today}`);

  const [existing] = await db
    .select()
    .from(challengeCompletions)
    .where(and(eq(challengeCompletions.coupleId, member.coupleId), eq(challengeCompletions.entryDate, today)))
    .limit(1);

  if (existing) return NextResponse.json({ ok: true, alreadyDone: true });

  const [created] = await db.insert(challengeCompletions).values({
    coupleId: member.coupleId,
    challengeId: challenge.id,
    entryDate: today,
    completedByMemberId: member.memberId,
    rewardPaws: challenge.rewardPaws,
  }).onConflictDoNothing().returning({ id: challengeCompletions.id });

  if (!created) return NextResponse.json({ ok: true, alreadyDone: true });

  await awardPaws(member.coupleId, challenge.rewardPaws, "Wyzwanie dnia");
  await evaluateAchievements(member.coupleId);

  return NextResponse.json({ ok: true });
}
