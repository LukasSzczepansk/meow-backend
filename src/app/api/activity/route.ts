import { NextResponse } from "next/server";
import { db } from "@/db";
import { coupleEvents, members } from "@/db/schema";
import { and, desc, eq, gte } from "drizzle-orm";
import { getCurrentMember } from "@/lib/server/session";

export async function GET(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const url = new URL(request.url);
  const requestedLimit = Number(url.searchParams.get("limit") ?? 40);
  const limit = Number.isFinite(requestedLimit) ? Math.min(200, Math.max(1, Math.round(requestedLimit))) : 40;
  const requestedDays = Number(url.searchParams.get("days") ?? 0);
  const days = Number.isFinite(requestedDays) ? Math.min(90, Math.max(0, Math.round(requestedDays))) : 0;
  const where = days > 0
    ? and(eq(coupleEvents.coupleId, member.coupleId), gte(coupleEvents.createdAt, new Date(Date.now() - days * 24 * 60 * 60 * 1000)))
    : eq(coupleEvents.coupleId, member.coupleId);

  const rows = await db
    .select({
      id: coupleEvents.id,
      type: coupleEvents.type,
      payload: coupleEvents.payload,
      createdAt: coupleEvents.createdAt,
      actorMemberId: coupleEvents.actorMemberId,
      actorNickname: members.nickname,
    })
    .from(coupleEvents)
    .leftJoin(members, eq(members.id, coupleEvents.actorMemberId))
    .where(where)
    .orderBy(desc(coupleEvents.createdAt))
    .limit(limit);

  return NextResponse.json({ events: rows.map((row) => ({ ...row, mine: row.actorMemberId === member.memberId })) });
}
