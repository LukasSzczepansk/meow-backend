import { NextResponse } from "next/server";
import { getCurrentMember } from "@/lib/server/session";
import { QUESTION_CATEGORIES, QUESTIONS } from "@/lib/content/questions";
import { getAnsweredQuestionIds, getRevealedQuestionIds } from "@/lib/server/questions";

export async function GET() {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const answered = await getAnsweredQuestionIds(member.coupleId, member.memberId);
  const revealed = await getRevealedQuestionIds(member.coupleId);

  const categories = QUESTION_CATEGORIES.map((c) => {
    const questions = QUESTIONS.filter((q) => q.category === c.key);
    const revealedCount = questions.filter((q) => revealed.has(q.id)).length;
    const answeredCount = questions.filter((q) => answered.has(q.id)).length;
    return { ...c, total: questions.length, answeredCount, revealedCount };
  });

  return NextResponse.json({ categories });
}
