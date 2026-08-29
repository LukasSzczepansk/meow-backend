import "server-only";
import { db } from "@/db";
import { answers } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getQuestionById, QUESTIONS, type QuestionCategoryKey } from "@/lib/content/questions";
import { awardPaws } from "@/lib/server/rewards";
import { evaluateAchievements } from "@/lib/server/achievements";
import { createCoupleEvent } from "@/lib/server/events";

export async function getQuestionState(coupleId: string, memberId: string, partnerMemberId: string | null, questionId: string) {
  const question = getQuestionById(questionId);
  if (!question) return null;

  const rows = await db.select().from(answers).where(and(eq(answers.coupleId, coupleId), eq(answers.questionId, questionId)));
  const mine = rows.find((row) => row.memberId === memberId) ?? null;
  const partner = partnerMemberId ? rows.find((row) => row.memberId === partnerMemberId) ?? null : null;

  return {
    question,
    myAnswer: mine?.answerText ?? null,
    myAnswerId: mine?.id ?? null,
    addedToBook: mine?.addedToBook ?? false,
    partnerAnswered: Boolean(partner),
    partnerAnswer: mine && partner ? partner.answerText : null,
    bothAnswered: Boolean(mine && partner),
  };
}

export async function getAnsweredQuestionIds(coupleId: string, memberId: string): Promise<Set<string>> {
  const rows = await db.select({ questionId: answers.questionId }).from(answers).where(and(eq(answers.coupleId, coupleId), eq(answers.memberId, memberId)));
  return new Set(rows.map((row) => row.questionId));
}

export async function getRevealedQuestionIds(coupleId: string): Promise<Set<string>> {
  const rows = await db.select({ questionId: answers.questionId, memberId: answers.memberId }).from(answers).where(eq(answers.coupleId, coupleId));
  const byQuestion = new Map<string, Set<string>>();
  for (const row of rows) {
    if (!byQuestion.has(row.questionId)) byQuestion.set(row.questionId, new Set());
    byQuestion.get(row.questionId)!.add(row.memberId);
  }
  const revealed = new Set<string>();
  for (const [questionId, members] of byQuestion) if (members.size >= 2) revealed.add(questionId);
  return revealed;
}

export async function submitAnswer(params: {
  coupleId: string;
  memberId: string;
  partnerMemberId: string | null;
  questionId: string;
  text: string;
}) {
  const question = getQuestionById(params.questionId);
  if (!question) throw new Error("Nie znaleziono pytania.");

  const existing = await db
    .select()
    .from(answers)
    .where(and(eq(answers.coupleId, params.coupleId), eq(answers.memberId, params.memberId), eq(answers.questionId, params.questionId)))
    .limit(1);

  let createdId = existing[0]?.id ?? null;
  if (existing[0]) {
    await db.update(answers).set({ answerText: params.text }).where(eq(answers.id, existing[0].id));
  } else {
    const [created] = await db.insert(answers).values({
      coupleId: params.coupleId,
      memberId: params.memberId,
      questionId: params.questionId,
      answerText: params.text,
    }).returning({ id: answers.id });
    createdId = created.id;

    await awardPaws(params.coupleId, 2, "Odpowiedź na pytanie", {
      memberId: params.memberId,
      sourceId: params.questionId,
      idempotencyKey: `question:${params.coupleId}:${params.memberId}:${params.questionId}`,
    });

    await createCoupleEvent({
      coupleId: params.coupleId,
      actorMemberId: params.memberId,
      recipientMemberId: params.partnerMemberId,
      type: "question_answered",
      payload: { questionId: params.questionId, category: question.category },
    });
  }

  if (params.partnerMemberId) {
    const partnerAnswer = await db
      .select({ id: answers.id })
      .from(answers)
      .where(and(eq(answers.coupleId, params.coupleId), eq(answers.memberId, params.partnerMemberId), eq(answers.questionId, params.questionId)))
      .limit(1);

    if (partnerAnswer[0]) {
      await awardPaws(params.coupleId, 3, "Wspólne odkrycie odpowiedzi", {
        sourceId: params.questionId,
        idempotencyKey: `question:${params.coupleId}:${params.questionId}:both`,
      });
      await createCoupleEvent({
        coupleId: params.coupleId,
        actorMemberId: params.memberId,
        recipientMemberId: params.partnerMemberId,
        type: "question_ready",
        payload: { questionId: params.questionId },
      });
    }
  }

  await evaluateAchievements(params.coupleId);
  return createdId;
}

export function questionsInCategory(category: QuestionCategoryKey) {
  return QUESTIONS.filter((question) => question.category === category);
}

export function pickDailyQuestion(coupleId: string, dateKey: string) {
  // Each couple gets a stable offset, while the calendar day advances by one.
  // This guarantees that a daily question will not repeat until the whole pool has cycled.
  let coupleHash = 2166136261;
  for (let index = 0; index < coupleId.length; index += 1) {
    coupleHash ^= coupleId.charCodeAt(index);
    coupleHash = Math.imul(coupleHash, 16777619);
  }

  const [year, month, day] = dateKey.split("-").map(Number);
  const dayNumber = Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
  const index = ((coupleHash >>> 0) + dayNumber) % QUESTIONS.length;
  return QUESTIONS[index];
}
