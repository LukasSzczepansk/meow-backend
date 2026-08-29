import "server-only";
import { db } from "@/db";
import { couples, roomItems, roomSlots } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getNextRoom, getRoomForLevel, getShopItem, getUnlockedRooms, ROOMS, type RoomSlotKey, type RoomType } from "@/lib/content/shop";
import { createCoupleEvent } from "@/lib/server/events";

export async function getRoomState(coupleId: string) {
  const [couple] = await db.select().from(couples).where(eq(couples.id, coupleId)).limit(1);
  const lifetimePoints = couple?.lifetimePoints ?? 0;
  const unlockedRooms = getUnlockedRooms(lifetimePoints);
  const nextRoom = getNextRoom(lifetimePoints);
  const currentLevel = unlockedRooms[unlockedRooms.length - 1]?.level ?? 1;

  if (couple && couple.roomLevel !== currentLevel) {
    await db.update(couples).set({ roomLevel: currentLevel }).where(eq(couples.id, coupleId));
  }

  const [items, slots] = await Promise.all([
    db.select().from(roomItems).where(eq(roomItems.coupleId, coupleId)),
    db.select().from(roomSlots).where(eq(roomSlots.coupleId, coupleId)),
  ]);

  const equippedByRoom = slots.reduce<Record<string, Record<string, string>>>((acc, slot) => {
    acc[slot.roomType] ??= {};
    acc[slot.roomType][slot.slotKey] = slot.itemKey;
    return acc;
  }, {});

  return {
    pawPoints: couple?.pawPoints ?? 0,
    lifetimePoints,
    currentRoom: getRoomForLevel(currentLevel),
    unlockedRooms,
    nextRoom,
    allRooms: ROOMS,
    purchasedItemKeys: items.map((item) => item.itemKey),
    equippedByRoom,
  };
}

export async function equipRoomItem(params: {
  coupleId: string;
  memberId: string;
  itemKey: string;
}) {
  const item = getShopItem(params.itemKey);
  if (!item) throw new Error("Nie znaleziono przedmiotu.");

  const owned = await db
    .select({ id: roomItems.id })
    .from(roomItems)
    .where(and(eq(roomItems.coupleId, params.coupleId), eq(roomItems.itemKey, item.key)))
    .limit(1);
  if (!owned[0]) throw new Error("Najpierw odblokujcie ten przedmiot.");

  const [couple] = await db.select({ lifetimePoints: couples.lifetimePoints }).from(couples).where(eq(couples.id, params.coupleId)).limit(1);
  const unlocked = getUnlockedRooms(couple?.lifetimePoints ?? 0).some((room) => room.type === item.room);
  if (!unlocked) throw new Error("Ten pokój nie jest jeszcze odblokowany.");

  await db
    .insert(roomSlots)
    .values({
      coupleId: params.coupleId,
      roomType: item.room,
      slotKey: item.slot,
      itemKey: item.key,
    })
    .onConflictDoUpdate({
      target: [roomSlots.coupleId, roomSlots.roomType, roomSlots.slotKey],
      set: { itemKey: item.key, updatedAt: new Date() },
    });

  await createCoupleEvent({
    coupleId: params.coupleId,
    actorMemberId: params.memberId,
    type: "room_item_equipped",
    payload: { itemKey: item.key, room: item.room, slot: item.slot },
  });

  return { roomType: item.room as RoomType, slotKey: item.slot as RoomSlotKey, itemKey: item.key };
}
