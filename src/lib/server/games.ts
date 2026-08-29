import "server-only";
import { db } from "@/db";
import { gameSessions } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { AGREE_PROMPTS, CHOOSE_PROMPTS, KNOW_ME_PROMPTS, MATCH_PROMPTS, WHO_MORE_PROMPTS, type GameType } from "@/lib/content/games";
import { awardPaws } from "@/lib/server/rewards";
import { evaluateAchievements } from "@/lib/server/achievements";

function catalogFor(gameType: GameType): { id: string }[] {
  if (gameType === "know_me") return KNOW_ME_PROMPTS;
  if (gameType === "match") return MATCH_PROMPTS;
  if (gameType === "agree") return AGREE_PROMPTS;
  if (gameType === "choose") return CHOOSE_PROMPTS;
  return WHO_MORE_PROMPTS;
}

async function pickNextPromptId(coupleId: string, gameType: GameType): Promise<string> {
  const catalog = catalogFor(gameType);
  const used = await db.select({ promptId: gameSessions.promptId }).from(gameSessions).where(and(eq(gameSessions.coupleId, coupleId), eq(gameSessions.gameType, gameType)));
  const lastUse = new Map<string, number>();
  used.forEach((row, index) => lastUse.set(row.promptId, index));
  const unused = catalog.find((prompt) => !lastUse.has(prompt.id));
  if (unused) return unused.id;
  return [...catalog].sort((a, b) => (lastUse.get(a.id) ?? 0) - (lastUse.get(b.id) ?? 0))[0].id;
}

export async function getLatestSession(coupleId: string, gameType: GameType) {
  const [row] = await db.select().from(gameSessions).where(and(eq(gameSessions.coupleId, coupleId), eq(gameSessions.gameType, gameType))).orderBy(desc(gameSessions.createdAt)).limit(1);
  return row ?? null;
}

export async function getOrCreateSession(coupleId: string, gameType: GameType) {
  const latest = await getLatestSession(coupleId, gameType);
  if (latest) return latest;
  return createSession(coupleId, gameType);
}

export async function createSession(coupleId: string, gameType: GameType) {
  const promptId = await pickNextPromptId(coupleId, gameType);
  const simultaneous = gameType === "who_more" || gameType === "agree" || gameType === "choose";
  const [row] = await db.insert(gameSessions).values({
    coupleId,
    gameType,
    promptId,
    status: simultaneous ? "awaiting_responses" : "awaiting_initiator",
    responses: {},
  }).returning();
  return row;
}

export async function submitGuessAnswer(params: {
  coupleId: string;
  memberId: string;
  gameType: "know_me" | "match";
  role: "initiator" | "guesser";
  value: string;
}) {
  const session = await getLatestSession(params.coupleId, params.gameType);
  if (!session) throw new Error("Brak aktywnej sesji gry.");

  if (params.role === "initiator") {
    if (session.status !== "awaiting_initiator") throw new Error("Ta runda już się rozpoczęła.");
    const [updated] = await db.update(gameSessions).set({
      initiatorMemberId: params.memberId,
      initiatorAnswer: params.value,
      status: "awaiting_guess",
    }).where(eq(gameSessions.id, session.id)).returning();
    return updated;
  }

  if (session.status !== "awaiting_guess") throw new Error("Czekamy jeszcze na pierwszą odpowiedź.");
  if (session.initiatorMemberId === params.memberId) throw new Error("Poczekaj na odpowiedź drugiej osoby.");

  const result = session.initiatorAnswer === params.value ? "correct" : "different";
  const [updated] = await db.update(gameSessions).set({
    guesserMemberId: params.memberId,
    guesserAnswer: params.value,
    status: "completed",
    result,
    completedAt: new Date(),
  }).where(eq(gameSessions.id, session.id)).returning();

  await awardPaws(params.coupleId, 2, `Gra: ${params.gameType}`, {
    memberId: params.memberId,
    sourceId: session.id,
    idempotencyKey: `game:${session.id}:complete`,
  });
  await evaluateAchievements(params.coupleId);
  return updated;
}

export async function submitSimultaneousAnswer(params: {
  coupleId: string;
  memberId: string;
  partnerMemberId: string | null;
  gameType: "who_more" | "agree" | "choose";
  value: string;
}) {
  const session = await getLatestSession(params.coupleId, params.gameType);
  if (!session) throw new Error("Brak aktywnej sesji gry.");
  if (session.status === "completed") throw new Error("Ta runda jest już zakończona.");

  const responses = { ...(session.responses ?? {}), [params.memberId]: params.value };
  const isComplete = Boolean(params.partnerMemberId) && Boolean(params.partnerMemberId && responses[params.partnerMemberId]);

  const [updated] = await db.update(gameSessions).set({
    responses,
    status: isComplete ? "completed" : "awaiting_responses",
    completedAt: isComplete ? new Date() : null,
  }).where(eq(gameSessions.id, session.id)).returning();

  if (isComplete) {
    await awardPaws(params.coupleId, 2, `Gra: ${params.gameType}`, {
      memberId: params.memberId,
      sourceId: session.id,
      idempotencyKey: `game:${session.id}:complete`,
    });
    await evaluateAchievements(params.coupleId);
  }

  return updated;
}
