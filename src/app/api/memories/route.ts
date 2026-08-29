import { NextResponse } from "next/server";
import { db } from "@/db";
import { memories, memoryFavorites } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { getCurrentMember } from "@/lib/server/session";
import { awardPaws } from "@/lib/server/rewards";
import { evaluateAchievements } from "@/lib/server/achievements";
import { createCoupleEvent } from "@/lib/server/events";

export async function GET(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const url = new URL(request.url);
  const onThisDay = url.searchParams.get("onThisDay") === "1";

  const rows = await db.select().from(memories).where(eq(memories.coupleId, member.coupleId)).orderBy(desc(memories.entryDate));
  const favorites = await db
    .select({ memoryId: memoryFavorites.memoryId, memberId: memoryFavorites.memberId })
    .from(memoryFavorites)
    .innerJoin(memories, eq(memories.id, memoryFavorites.memoryId))
    .where(eq(memories.coupleId, member.coupleId));
  const favoriteMap = new Map<string, string[]>();
  for (const favorite of favorites) {
    const list = favoriteMap.get(favorite.memoryId) ?? [];
    list.push(favorite.memberId);
    favoriteMap.set(favorite.memoryId, list);
  }

  const now = new Date();
  const enriched = rows.map((memory) => {
    const memberIds = favoriteMap.get(memory.id) ?? [];
    return {
      ...memory,
      favoriteCount: memberIds.length,
      mineFavorite: memberIds.includes(member.memberId),
    };
  });

  if (onThisDay) {
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const candidates = enriched.filter((memory) => {
      if (memory.entryDate.slice(5) !== `${month}-${day}`) return false;
      const year = Number(memory.entryDate.slice(0, 4));
      return year < now.getFullYear();
    });
    return NextResponse.json({ memory: candidates[0] ?? null });
  }

  return NextResponse.json({ memories: enriched });
}

export async function POST(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const body = await request.json();
  const title = typeof body?.title === "string" ? body.title.trim().slice(0, 120) : "";
  const entryDate = typeof body?.date === "string" ? body.date : "";
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 800) || null : null;
  const photoUrl = typeof body?.photoUrl === "string" && body.photoUrl.startsWith("data:image/") && body.photoUrl.length < 1_800_000 ? body.photoUrl : null;

  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(entryDate)) {
    return NextResponse.json({ error: "Podaj tytuł i poprawną datę wspomnienia." }, { status: 400 });
  }

  const [memory] = await db.insert(memories).values({
    coupleId: member.coupleId,
    title,
    entryDate,
    note,
    photoUrl,
    createdByMemberId: member.memberId,
  }).returning();

  await awardPaws(member.coupleId, 3, "Nowe wspomnienie", {
    memberId: member.memberId,
    sourceId: memory.id,
    idempotencyKey: `memory:${memory.id}:created`,
  });
  await createCoupleEvent({
    coupleId: member.coupleId,
    actorMemberId: member.memberId,
    type: "memory_added",
    payload: { memoryId: memory.id, title: memory.title },
  });
  await evaluateAchievements(member.coupleId);

  return NextResponse.json({ ok: true, memory });
}
