import "server-only";
import { db } from "@/db";
import { afterFightEntries, afterFightSessions } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { awardPaws } from "@/lib/server/rewards";
import { evaluateAchievements } from "@/lib/server/achievements";

export async function getOrCreateActiveSession(coupleId: string) {
  const [existing] = await db.select().from(afterFightSessions)
    .where(and(eq(afterFightSessions.coupleId, coupleId), eq(afterFightSessions.status, "in_progress")))
    .orderBy(desc(afterFightSessions.createdAt)).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(afterFightSessions).values({ coupleId }).returning();
  return created;
}

export async function getEntry(sessionId: string, memberId: string) {
  const [row] = await db.select().from(afterFightEntries)
    .where(and(eq(afterFightEntries.sessionId, sessionId), eq(afterFightEntries.memberId, memberId))).limit(1);
  return row ?? null;
}

function isEntryComplete(entry: {
  emotions: string[] | null;
  needs: string[] | null;
  conversationMode: string | null;
  improve: string | null;
  finalThought: string | null;
} | null) {
  if (!entry) return false;
  return Boolean(entry.emotions?.length && entry.needs?.length && entry.conversationMode && entry.improve?.trim() && entry.finalThought?.trim());
}

type FightField = "readyState" | "calmChoice" | "emotions" | "difficult" | "needs" | "conversationMode" | "improve" | "finalThought";

export async function upsertStep(params: {
  sessionId: string;
  coupleId: string;
  memberId: string;
  field: FightField;
  value: string | string[];
}) {
  const [session] = await db.select({ id: afterFightSessions.id })
    .from(afterFightSessions)
    .where(and(eq(afterFightSessions.id, params.sessionId), eq(afterFightSessions.coupleId, params.coupleId), eq(afterFightSessions.status, "in_progress")))
    .limit(1);
  if (!session) return false;

  const existing = await getEntry(params.sessionId, params.memberId);
  const patch: Record<string, unknown> = { [params.field]: params.value };
  if (existing) await db.update(afterFightEntries).set(patch).where(eq(afterFightEntries.id, existing.id));
  else await db.insert(afterFightEntries).values({ sessionId: params.sessionId, memberId: params.memberId, ...patch });
  return true;
}

export async function getSessionStatus(sessionId: string, coupleId: string, memberId: string, partnerMemberId: string | null) {
  const [session] = await db.select().from(afterFightSessions).where(eq(afterFightSessions.id, sessionId)).limit(1);
  if (!session || session.coupleId !== coupleId) return null;

  const myEntry = await getEntry(sessionId, memberId);
  const partnerEntry = partnerMemberId ? await getEntry(sessionId, partnerMemberId) : null;
  const myDone = isEntryComplete(myEntry);
  const partnerDone = isEntryComplete(partnerEntry);

  return {
    session,
    myEntry,
    myDone,
    partnerDone,
    bothDone: myDone && partnerDone,
    revealed: session.status === "completed",
    partnerEntry: session.status === "completed" ? partnerEntry : null,
  };
}

export async function revealSession(sessionId: string, coupleId: string): Promise<boolean> {
  const [updated] = await db.update(afterFightSessions)
    .set({ status: "completed", completedAt: new Date() })
    .where(and(eq(afterFightSessions.id, sessionId), eq(afterFightSessions.coupleId, coupleId), eq(afterFightSessions.status, "in_progress")))
    .returning({ id: afterFightSessions.id });

  if (!updated) return false;
  await awardPaws(coupleId, 3, "Spokojna rozmowa", {
    sourceId: sessionId,
    idempotencyKey: `after-fight:${sessionId}:revealed`,
  });
  await evaluateAchievements(coupleId);
  return true;
}
