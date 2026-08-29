import { NextResponse } from "next/server";
import { db } from "@/db";
import { couples, rewardTransactions, roomItems, roomSlots } from "@/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";
import { getCurrentMember } from "@/lib/server/session";
import { SHOP_ITEMS } from "@/lib/content/shop";
import { createCoupleEvent } from "@/lib/server/events";

class PurchaseError extends Error {
  constructor(public readonly kind: "insufficient") {
    super(kind);
  }
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "23505";
}

export async function POST(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const body = await request.json();
  const itemKey = body?.itemKey as string | undefined;
  const item = SHOP_ITEMS.find((i) => i.key === itemKey);
  if (!item) return NextResponse.json({ error: "Nie znaleziono przedmiotu." }, { status: 404 });

  try {
    const result = await db.transaction(async (tx) => {
      const [updatedCouple] = await tx
        .update(couples)
        .set({ pawPoints: sql`${couples.pawPoints} - ${item.cost}` })
        .where(and(eq(couples.id, member.coupleId), gte(couples.pawPoints, item.cost)))
        .returning({ pawPoints: couples.pawPoints });

      if (!updatedCouple) throw new PurchaseError("insufficient");

      await tx.insert(roomItems).values({
        coupleId: member.coupleId,
        itemKey: item.key,
        roomType: item.room,
        category: item.category,
      });

      await tx.insert(rewardTransactions).values({
        coupleId: member.coupleId,
        memberId: member.memberId,
        amount: -item.cost,
        reason: `Zakup: ${item.name}`,
        sourceId: item.key,
        idempotencyKey: `purchase:${member.coupleId}:${item.key}`,
      });

      await tx.insert(roomSlots).values({
        coupleId: member.coupleId,
        roomType: item.room,
        slotKey: item.slot,
        itemKey: item.key,
      }).onConflictDoNothing();

      return updatedCouple;
    });

    await createCoupleEvent({
      coupleId: member.coupleId,
      actorMemberId: member.memberId,
      type: "room_item_unlocked",
      payload: { itemKey: item.key, name: item.name, room: item.room },
    });

    return NextResponse.json({ ok: true, pawPoints: result.pawPoints });
  } catch (error) {
    if (error instanceof PurchaseError) {
      return NextResponse.json({ error: "Za mało Łapek na ten przedmiot." }, { status: 400 });
    }
    if (isUniqueViolation(error)) {
      return NextResponse.json({ error: "Ten przedmiot już macie." }, { status: 400 });
    }
    console.error("shop/buy", error);
    return NextResponse.json({ error: "Nie udało się dokończyć zakupu." }, { status: 500 });
  }
}
