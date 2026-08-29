import { NextResponse } from "next/server";
import { getCurrentMember } from "@/lib/server/session";
import { getRoomState } from "@/lib/server/room";
import { SHOP_ITEMS } from "@/lib/content/shop";

export async function GET() {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const room = await getRoomState(member.coupleId);
  const unlockedRoomTypes = new Set(room.unlockedRooms.map((r) => r.type));

  const items = SHOP_ITEMS.map((item) => ({
    ...item,
    owned: room.purchasedItemKeys.includes(item.key),
    roomUnlocked: unlockedRoomTypes.has(item.room),
  }));

  return NextResponse.json({ items, pawPoints: room.pawPoints });
}
