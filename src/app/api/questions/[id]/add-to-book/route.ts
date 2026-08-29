import { NextResponse } from "next/server";
import { db } from "@/db";
import { answers, bookEntries } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentMember } from "@/lib/server/session";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const body = await request.json();
  const category = body?.category as string | undefined;
  if (!category) return NextResponse.json({ error: "Wybierz kategorię." }, { status: 400 });

  const [mine] = await db
    .select()
    .from(answers)
    .where(and(eq(answers.coupleId, member.coupleId), eq(answers.memberId, member.memberId), eq(answers.questionId, id)))
    .limit(1);

  if (!mine) return NextResponse.json({ error: "Najpierw odpowiedz na pytanie." }, { status: 400 });

  await db.insert(bookEntries).values({
    coupleId: member.coupleId,
    aboutMemberId: member.memberId,
    category,
    content: mine.answerText,
    sourceType: "question",
    sourceId: id,
    visibility: "shared",
  });

  await db.update(answers).set({ addedToBook: true }).where(eq(answers.id, mine.id));

  return NextResponse.json({ ok: true });
}
