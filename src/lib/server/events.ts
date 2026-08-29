import "server-only";
import { db } from "@/db";
import { coupleEvents } from "@/db/schema";

export type CoupleEventType =
  | "meow_sent"
  | "question_answered"
  | "question_ready"
  | "memory_added"
  | "challenge_completed"
  | "date_added"
  | "date_selected"
  | "room_item_unlocked"
  | "room_item_equipped"
  | "achievement_unlocked"
  | "checkin_shared"
  | "relationship_event_added"
  | "music_added"
  | "music_our_song"
  | "music_room_started";

export async function createCoupleEvent(input: {
  coupleId: string;
  actorMemberId?: string | null;
  recipientMemberId?: string | null;
  type: CoupleEventType;
  payload?: Record<string, string | number | boolean | null>;
}) {
  await db.insert(coupleEvents).values({
    coupleId: input.coupleId,
    actorMemberId: input.actorMemberId ?? null,
    recipientMemberId: input.recipientMemberId ?? null,
    type: input.type,
    payload: input.payload ?? {},
  });
}
