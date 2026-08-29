import { NextResponse } from "next/server";
import { db } from "@/db";
import { meows, members } from "@/db/schema";
import { and, desc, eq, gte, ne } from "drizzle-orm";
import { getCurrentMember, getPartnerMember } from "@/lib/server/session";
import { getMeowType } from "@/lib/content/meows";
import { createCoupleEvent } from "@/lib/server/events";

export async function GET(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });
  const url = new URL(request.url);
  const history = url.searchParams.get("history") === "1";

  if (history) {
    const rows = await db
      .select({
        id: meows.id,
        type: meows.meowType,
        createdAt: meows.createdAt,
        senderMemberId: meows.senderMemberId,
        senderNickname: members.nickname,
      })
      .from(meows)
      .innerJoin(members, eq(members.id, meows.senderMemberId))
      .where(eq(meows.coupleId, member.coupleId))
      .orderBy(desc(meows.createdAt))
      .limit(40);

    return NextResponse.json({
      meows: rows.map((row) => ({ ...row, mine: row.senderMemberId === member.memberId })),
    });
  }

  const [latest] = await db
    .select()
    .from(meows)
    .where(
      and(
        eq(meows.coupleId, member.coupleId),
        ne(meows.senderMemberId, member.memberId),
        gte(meows.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000)),
      ),
    )
    .orderBy(desc(meows.createdAt))
    .limit(1);

  if (!latest) return NextResponse.json({ latest: null });
  const partner = await getPartnerMember(member.coupleId, member.memberId);
  return NextResponse.json({
    latest: {
      id: latest.id,
      type: latest.meowType,
      createdAt: latest.createdAt,
      nickname: partner?.nickname ?? "Partner",
    },
  });
}

export async function POST(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });
  const partner = await getPartnerMember(member.coupleId, member.memberId);
  if (!partner) return NextResponse.json({ error: "Najpierw połączcie oba telefony." }, { status: 400 });

  const body = await request.json();
  const type = typeof body?.type === "string" ? getMeowType(body.type) : null;
  if (!type) return NextResponse.json({ error: "Nieznany rodzaj Miau." }, { status: 400 });

  const [lastSent] = await db
    .select({ createdAt: meows.createdAt })
    .from(meows)
    .where(and(eq(meows.coupleId, member.coupleId), eq(meows.senderMemberId, member.memberId)))
    .orderBy(desc(meows.createdAt))
    .limit(1);

  if (lastSent && Date.now() - lastSent.createdAt.getTime() < 5_000) {
    return NextResponse.json({ error: "Daj Miau chwilkę odpocząć." }, { status: 429 });
  }

  const recent = await db
    .select({ id: meows.id })
    .from(meows)
    .where(and(
      eq(meows.coupleId, member.coupleId),
      eq(meows.senderMemberId, member.memberId),
      gte(meows.createdAt, new Date(Date.now() - 10 * 60 * 1000)),
    ))
    .limit(20);
  if (recent.length >= 20) {
    return NextResponse.json({ error: "Za dużo Miau naraz. Wróć do nich za chwilę." }, { status: 429 });
  }

  const [created] = await db
    .insert(meows)
    .values({ coupleId: member.coupleId, senderMemberId: member.memberId, meowType: type.key })
    .returning();

  await createCoupleEvent({
    coupleId: member.coupleId,
    actorMemberId: member.memberId,
    recipientMemberId: partner.memberId,
    type: "meow_sent",
    payload: { type: type.key, label: type.label },
  });

  return NextResponse.json({ ok: true, meow: created });
}
