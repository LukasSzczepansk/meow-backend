import { NextResponse } from "next/server";
import { db } from "@/db";
import { dateIdeas } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { getCurrentMember } from "@/lib/server/session";
import { isDateIdeaCategory } from "@/lib/content/dateJar";
import { createCoupleEvent } from "@/lib/server/events";

export async function GET() {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const ideas = await db.select().from(dateIdeas).where(eq(dateIdeas.coupleId, member.coupleId)).orderBy(desc(dateIdeas.createdAt));
  return NextResponse.json({ ideas, myMemberId: member.memberId });
}

export async function POST(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const body = await request.json();
  const title = typeof body?.title === "string" ? body.title.trim().slice(0, 120) : "";
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 300) || null : null;
  const category = typeof body?.category === "string" && isDateIdeaCategory(body.category) ? body.category : "spontaniczne";
  if (!title) return NextResponse.json({ error: "Dodaj krótki pomysł." }, { status: 400 });

  const [idea] = await db.insert(dateIdeas).values({
    coupleId: member.coupleId,
    createdByMemberId: member.memberId,
    title,
    note,
    category,
  }).returning();

  await createCoupleEvent({
    coupleId: member.coupleId,
    actorMemberId: member.memberId,
    type: "date_added",
    payload: { ideaId: idea.id, title: idea.title, category: idea.category },
  });

  return NextResponse.json({ ok: true, idea });
}

export async function PATCH(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const body = await request.json();
  const id = typeof body?.id === "string" ? body.id : "";
  const status = body?.status === "idea" || body?.status === "planned" || body?.status === "completed" ? body.status : null;
  if (!id || !status) return NextResponse.json({ error: "Nieprawidłowa zmiana." }, { status: 400 });

  const [updated] = await db.update(dateIdeas).set({
    status,
    completedAt: status === "completed" ? new Date() : null,
  }).where(and(eq(dateIdeas.id, id), eq(dateIdeas.coupleId, member.coupleId))).returning();

  if (!updated) return NextResponse.json({ error: "Nie znaleziono pomysłu." }, { status: 404 });

  if (status === "planned") {
    await createCoupleEvent({
      coupleId: member.coupleId,
      actorMemberId: member.memberId,
      type: "date_selected",
      payload: { ideaId: updated.id, title: updated.title },
    });
  }

  return NextResponse.json({ ok: true, idea: updated });
}
