import { NextResponse } from "next/server";
import { db } from "@/db";
import { checkIns } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentMember, getPartnerMember } from "@/lib/server/session";
import { todayDateString } from "@/lib/server/date";
import { awardPaws } from "@/lib/server/rewards";
import { evaluateAchievements } from "@/lib/server/achievements";
import { isValidMood, isValidNeed, isValidVisibility } from "@/lib/server/validation";
import { createCoupleEvent } from "@/lib/server/events";

export async function GET() {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const today = todayDateString();
  const partner = await getPartnerMember(member.coupleId, member.memberId);

  const [mine] = await db
    .select()
    .from(checkIns)
    .where(and(eq(checkIns.memberId, member.memberId), eq(checkIns.entryDate, today)))
    .limit(1);

  let partnerShared: { mood: string | null; need: string | null; nickname: string } | null = null;
  if (partner) {
    const [theirs] = await db
      .select()
      .from(checkIns)
      .where(and(eq(checkIns.memberId, partner.memberId), eq(checkIns.entryDate, today)))
      .limit(1);
    if (theirs && theirs.visibility === "shared") {
      partnerShared = { mood: theirs.mood, need: theirs.need, nickname: partner.nickname };
    }
  }

  return NextResponse.json({ mine: mine ?? null, partnerShared, partnerNickname: partner?.nickname ?? null });
}

export async function POST(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }
  const { mood, need, visibility } = (body ?? {}) as Record<string, unknown>;
  if (!isValidMood(mood) || !isValidNeed(need) || !isValidVisibility(visibility)) {
    return NextResponse.json({ error: "Nieprawidłowy check-in." }, { status: 400 });
  }

  const today = todayDateString();
  const [existing] = await db
    .select()
    .from(checkIns)
    .where(and(eq(checkIns.memberId, member.memberId), eq(checkIns.entryDate, today)))
    .limit(1);

  let isNew = false;
  if (existing) {
    await db
      .update(checkIns)
      .set({
        mood: mood === undefined ? existing.mood : mood,
        need: need === undefined ? existing.need : need,
        visibility: visibility ?? existing.visibility,
        updatedAt: new Date(),
      })
      .where(eq(checkIns.id, existing.id));
  } else {
    isNew = true;
    await db.insert(checkIns).values({
      memberId: member.memberId,
      coupleId: member.coupleId,
      entryDate: today,
      mood: mood ?? null,
      need: need ?? null,
      visibility: visibility ?? "private",
    });
  }

  if (isNew) {
    await awardPaws(member.coupleId, 1, "Check-in dnia", {
      memberId: member.memberId,
      sourceId: today,
      idempotencyKey: `checkin:${member.memberId}:${today}`,
    });
    await evaluateAchievements(member.coupleId);
  }

  const becameShared = visibility === "shared" && (!existing || existing.visibility !== "shared");
  if (becameShared) {
    const partner = await getPartnerMember(member.coupleId, member.memberId);
    await createCoupleEvent({
      coupleId: member.coupleId,
      actorMemberId: member.memberId,
      recipientMemberId: partner?.memberId ?? null,
      type: "checkin_shared",
      payload: { date: today },
    });
  }

  return NextResponse.json({ ok: true });
}
