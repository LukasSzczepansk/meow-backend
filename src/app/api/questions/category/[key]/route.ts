import { NextResponse } from "next/server";
import { getCurrentMember } from "@/lib/server/session";
import { questionsInCategory } from "@/lib/server/questions";
import { getAnsweredQuestionIds, getRevealedQuestionIds } from "@/lib/server/questions";
import type { QuestionCategoryKey } from "@/lib/content/questions";

export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const questions = questionsInCategory(key as QuestionCategoryKey);
  const answered = await getAnsweredQuestionIds(member.coupleId, member.memberId);
  const revealed = await getRevealedQuestionIds(member.coupleId);

  const items = questions.map((q) => ({
    id: q.id,
    text: q.text,
    answeredByMe: answered.has(q.id),
    revealed: revealed.has(q.id),
  }));

  return NextResponse.json({ items });
}
