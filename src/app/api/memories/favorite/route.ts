import { NextResponse } from "next/server";
import { db } from "@/db";
import { memories, memoryFavorites } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentMember } from "@/lib/server/session";

export async function POST(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });
  const body = await request.json();
  const memoryId = typeof body?.memoryId === "string" ? body.memoryId : "";
  if (!memoryId) return NextResponse.json({ error: "Brak wspomnienia." }, { status: 400 });

  const [memory] = await db.select().from(memories).where(and(eq(memories.id, memoryId), eq(memories.coupleId, member.coupleId))).limit(1);
  if (!memory) return NextResponse.json({ error: "Nie znaleziono wspomnienia." }, { status: 404 });

  const [existing] = await db.select().from(memoryFavorites).where(and(eq(memoryFavorites.memoryId, memoryId), eq(memoryFavorites.memberId, member.memberId))).limit(1);
  if (existing) {
    await db.delete(memoryFavorites).where(eq(memoryFavorites.id, existing.id));
    return NextResponse.json({ ok: true, favorite: false });
  }

  await db.insert(memoryFavorites).values({ memoryId, memberId: member.memberId });
  return NextResponse.json({ ok: true, favorite: true });
}
