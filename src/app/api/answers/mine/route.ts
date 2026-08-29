import { NextResponse } from "next/server";
import { db } from "@/db";
import { answers } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getCurrentMember } from "@/lib/server/session";
import { getQuestionById } from "@/lib/content/questions";

export async function GET() {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const rows = await db
    .select()
    .from(answers)
    .where(eq(answers.memberId, member.memberId))
    .orderBy(desc(answers.createdAt));

  const items = rows.map((r) => ({
    id: r.id,
    questionText: getQuestionById(r.questionId)?.text ?? "Pytanie",
    answerText: r.answerText,
    createdAt: r.createdAt,
  }));

  return NextResponse.json({ items });
}
