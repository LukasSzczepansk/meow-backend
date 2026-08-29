import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookEntries } from "@/db/schema";
import { and, desc, eq, or } from "drizzle-orm";
import { getCurrentMember } from "@/lib/server/session";
import { isBookCategoryKey } from "@/lib/content/book";

export async function GET() {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const entries = await db
    .select()
    .from(bookEntries)
    .where(and(
      eq(bookEntries.coupleId, member.coupleId),
      or(eq(bookEntries.aboutMemberId, member.memberId), eq(bookEntries.visibility, "shared")),
    ))
    .orderBy(desc(bookEntries.createdAt));

  return NextResponse.json({ entries, myMemberId: member.memberId });
}

export async function POST(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const body = await request.json();
  const content = typeof body?.content === "string" ? body.content.trim().slice(0, 500) : "";
  const category = typeof body?.category === "string" && isBookCategoryKey(body.category) ? body.category : null;
  const visibility = body?.visibility === "private" ? "private" : "shared";
  if (!content || !category) return NextResponse.json({ error: "Dodaj treść i wybierz kategorię." }, { status: 400 });

  const [entry] = await db.insert(bookEntries).values({
    coupleId: member.coupleId,
    aboutMemberId: member.memberId,
    category,
    content,
    visibility,
    sourceType: "manual",
  }).returning();

  return NextResponse.json({ ok: true, entry });
}

export async function PATCH(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const body = await request.json();
  const id = typeof body?.id === "string" ? body.id : "";
  const content = typeof body?.content === "string" ? body.content.trim().slice(0, 500) : undefined;
  const visibility = body?.visibility === "private" || body?.visibility === "shared" ? body.visibility : undefined;
  if (!id || (!content && !visibility)) return NextResponse.json({ error: "Brak zmian." }, { status: 400 });

  const [owned] = await db.select().from(bookEntries).where(and(eq(bookEntries.id, id), eq(bookEntries.aboutMemberId, member.memberId))).limit(1);
  if (!owned) return NextResponse.json({ error: "Możesz edytować tylko swoje wpisy." }, { status: 403 });

  const [entry] = await db.update(bookEntries).set({
    ...(content ? { content } : {}),
    ...(visibility ? { visibility } : {}),
    updatedAt: new Date(),
  }).where(eq(bookEntries.id, id)).returning();

  return NextResponse.json({ ok: true, entry });
}

export async function DELETE(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });
  const body = await request.json();
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "Brak wpisu." }, { status: 400 });

  const [owned] = await db.select().from(bookEntries).where(and(eq(bookEntries.id, id), eq(bookEntries.aboutMemberId, member.memberId))).limit(1);
  if (!owned) return NextResponse.json({ error: "Możesz usuwać tylko swoje wpisy." }, { status: 403 });
  await db.delete(bookEntries).where(eq(bookEntries.id, id));
  return NextResponse.json({ ok: true });
}
