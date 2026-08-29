import "server-only";
import { db } from "@/db";
import {
  achievementUnlocks,
  answers,
  bookEntries,
  calmSessions,
  couples,
  dateIdeas,
  gameSessions,
  memories,
  meows,
  relationshipEvents,
  roomItems,
} from "@/db/schema";
import { and, count, eq } from "drizzle-orm";
import { ACHIEVEMENTS } from "@/lib/content/achievements";
import { createCoupleEvent } from "@/lib/server/events";

export interface AchievementStatus {
  key: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt: string | null;
}


export async function evaluateAchievements(coupleId: string): Promise<void> {
  const [{ value: answersCount = 0 } = { value: 0 }] = await db.select({ value: count() }).from(answers).where(eq(answers.coupleId, coupleId));
  const [{ value: gamesCount = 0 } = { value: 0 }] = await db.select({ value: count() }).from(gameSessions).where(and(eq(gameSessions.coupleId, coupleId), eq(gameSessions.status, "completed")));
  const [{ value: calmCount = 0 } = { value: 0 }] = await db.select({ value: count() }).from(calmSessions).where(eq(calmSessions.coupleId, coupleId));
  const [{ value: memoriesCount = 0 } = { value: 0 }] = await db.select({ value: count() }).from(memories).where(eq(memories.coupleId, coupleId));
  const [{ value: meowsCount = 0 } = { value: 0 }] = await db.select({ value: count() }).from(meows).where(eq(meows.coupleId, coupleId));
  const [{ value: dateIdeasCount = 0 } = { value: 0 }] = await db.select({ value: count() }).from(dateIdeas).where(eq(dateIdeas.coupleId, coupleId));
  const [{ value: timelineCount = 0 } = { value: 0 }] = await db.select({ value: count() }).from(relationshipEvents).where(eq(relationshipEvents.coupleId, coupleId));
  const [{ value: bookCount = 0 } = { value: 0 }] = await db.select({ value: count() }).from(bookEntries).where(eq(bookEntries.coupleId, coupleId));
  const [{ value: roomItemsCount = 0 } = { value: 0 }] = await db.select({ value: count() }).from(roomItems).where(eq(roomItems.coupleId, coupleId));

  const [couple] = await db.select().from(couples).where(eq(couples.id, coupleId)).limit(1);
  const roomLevel = couple?.roomLevel ?? 1;
  const totalActivity = Number(answersCount) + Number(gamesCount) + Number(calmCount);

  const toUnlock: string[] = [];
  if (totalActivity >= 1) toUnlock.push("first_paw");
  if (Number(meowsCount) >= 1) toUnlock.push("first_meow");
  if (Number(meowsCount) >= 10) toUnlock.push("meow_10");
  if (Number(meowsCount) >= 50) toUnlock.push("meow_50");
  if (Number(answersCount) >= 10) toUnlock.push("good_start");
  if (Number(answersCount) >= 25) toUnlock.push("getting_to_know");
  if (Number(answersCount) >= 50) toUnlock.push("questions_50");
  if (Number(answersCount) >= 100) toUnlock.push("questions_100");
  if (Number(gamesCount) >= 10) toUnlock.push("playful_duo");
  if (Number(gamesCount) >= 25) toUnlock.push("games_25");
  if (Number(calmCount) >= 5) toUnlock.push("calmer");
  if (Number(calmCount) >= 15) toUnlock.push("calm_15");
  if (Number(memoriesCount) >= 1) toUnlock.push("first_memory");
  if (Number(memoriesCount) >= 5) toUnlock.push("memory_keepers");
  if (Number(memoriesCount) >= 15) toUnlock.push("memories_15");
  if (Number(dateIdeasCount) >= 1) toUnlock.push("first_date_idea");
  if (Number(dateIdeasCount) >= 10) toUnlock.push("date_ideas_10");
  if (Number(timelineCount) >= 1) toUnlock.push("first_timeline");
  if (Number(timelineCount) >= 5) toUnlock.push("timeline_5");
  if (Number(bookCount) >= 5) toUnlock.push("book_5");
  if (Number(bookCount) >= 20) toUnlock.push("book_20");
  if (Number(roomItemsCount) >= 5) toUnlock.push("home_5");
  if (Number(roomItemsCount) >= 15) toUnlock.push("home_15");
  if (roomLevel >= 2) toUnlock.push("more_ours");
  if (roomLevel >= 4) toUnlock.push("room_4");

  for (const key of toUnlock) {
    const inserted = await db.insert(achievementUnlocks).values({ coupleId, achievementKey: key }).onConflictDoNothing().returning({ key: achievementUnlocks.achievementKey });
    if (inserted[0]) {
      await createCoupleEvent({ coupleId, type: "achievement_unlocked", payload: { achievementKey: key } });
    }
  }
}

export async function getAchievementStatuses(coupleId: string): Promise<AchievementStatus[]> {
  await evaluateAchievements(coupleId);
  const unlocked = await db.select().from(achievementUnlocks).where(eq(achievementUnlocks.coupleId, coupleId));
  const unlockedMap = new Map<string, Date>(unlocked.map((row) => [row.achievementKey, row.unlockedAt]));

  return ACHIEVEMENTS.map((achievement) => ({
    key: achievement.key,
    title: achievement.title,
    description: achievement.description,
    unlocked: unlockedMap.has(achievement.key),
    unlockedAt: unlockedMap.get(achievement.key)?.toISOString() ?? null,
  }));
}
