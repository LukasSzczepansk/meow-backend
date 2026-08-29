import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  date,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Para (Couple) + Członkowie (Members) + Koty (Cats)
// ---------------------------------------------------------------------------

export const couples = pgTable("couples", {
  id: uuid("id").primaryKey().defaultRandom(),
  inviteCode: text("invite_code").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  pawPoints: integer("paw_points").notNull().default(0),
  lifetimePoints: integer("lifetime_points").notNull().default(0),
  roomLevel: integer("room_level").notNull().default(1),
});

export const members = pgTable("members", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id")
    .notNull()
    .references(() => couples.id, { onDelete: "cascade" }),
  nickname: text("nickname").notNull(),
  deviceToken: text("device_token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cats = pgTable("cats", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id")
    .notNull()
    .unique()
    .references(() => members.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  colorVariant: text("color_variant").notNull(),
  furLength: text("fur_length").notNull().default("short"),
  personality: text("personality").notNull().default("ciekawski"),
  accessory: text("accessory"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const couplesRelations = relations(couples, ({ many }) => ({
  members: many(members),
}));

export const membersRelations = relations(members, ({ one }) => ({
  couple: one(couples, { fields: [members.coupleId], references: [couples.id] }),
  cat: one(cats, { fields: [members.id], references: [cats.memberId] }),
}));

export const catsRelations = relations(cats, ({ one }) => ({
  member: one(members, { fields: [cats.memberId], references: [members.id] }),
}));

// ---------------------------------------------------------------------------
// Koci Domek: pokoje i przedmioty
// ---------------------------------------------------------------------------

export const roomItems = pgTable(
  "room_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    itemKey: text("item_key").notNull(),
    roomType: text("room_type").notNull(),
    category: text("category").notNull(),
    purchasedAt: timestamp("purchased_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.coupleId, table.itemKey)],
);


export const roomSlots = pgTable(
  "room_slots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    roomType: text("room_type").notNull(),
    slotKey: text("slot_key").notNull(),
    itemKey: text("item_key").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.coupleId, table.roomType, table.slotKey)],
);

// ---------------------------------------------------------------------------
// Check-iny (Dziś)
// ---------------------------------------------------------------------------

export const checkIns = pgTable(
  "check_ins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    memberId: uuid("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    entryDate: date("entry_date").notNull(),
    mood: text("mood"),
    need: text("need"),
    visibility: text("visibility").notNull().default("private"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.memberId, table.entryDate)],
);

// ---------------------------------------------------------------------------
// Szybkie sygnały między partnerami (Miau)
// ---------------------------------------------------------------------------

export const meows = pgTable("meows", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id")
    .notNull()
    .references(() => couples.id, { onDelete: "cascade" }),
  senderMemberId: uuid("sender_member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  meowType: text("meow_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Porozmawiajmy: pytania i odpowiedzi
// ---------------------------------------------------------------------------

export const answers = pgTable(
  "answers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    questionId: text("question_id").notNull(),
    answerText: text("answer_text").notNull(),
    addedToBook: boolean("added_to_book").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.coupleId, table.memberId, table.questionId)],
);

// ---------------------------------------------------------------------------
// Księga Nas
// ---------------------------------------------------------------------------

export const bookEntries = pgTable("book_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id")
    .notNull()
    .references(() => couples.id, { onDelete: "cascade" }),
  aboutMemberId: uuid("about_member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  content: text("content").notNull(),
  sourceType: text("source_type").notNull().default("manual"),
  sourceId: text("source_id"),
  visibility: text("visibility").notNull().default("shared"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Wyzwania
// ---------------------------------------------------------------------------

export const challengeCompletions = pgTable(
  "challenge_completions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    challengeId: text("challenge_id").notNull(),
    entryDate: date("entry_date").notNull(),
    completedByMemberId: uuid("completed_by_member_id").references(() => members.id),
    rewardPaws: integer("reward_paws").notNull().default(5),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.coupleId, table.entryDate)],
);

// ---------------------------------------------------------------------------
// Gry: Jak dobrze mnie znasz / Kto bardziej / Dopasowanie
// ---------------------------------------------------------------------------

export const gameSessions = pgTable("game_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id")
    .notNull()
    .references(() => couples.id, { onDelete: "cascade" }),
  gameType: text("game_type").notNull(),
  promptId: text("prompt_id").notNull(),
  initiatorMemberId: uuid("initiator_member_id").references(() => members.id),
  initiatorAnswer: text("initiator_answer"),
  guesserMemberId: uuid("guesser_member_id").references(() => members.id),
  guesserAnswer: text("guesser_answer"),
  responses: jsonb("responses").$type<Record<string, string>>(),
  status: text("status").notNull().default("awaiting_initiator"),
  result: text("result"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

// ---------------------------------------------------------------------------
// Wspomnienia
// ---------------------------------------------------------------------------

export const memories = pgTable("memories", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id")
    .notNull()
    .references(() => couples.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  entryDate: date("entry_date").notNull(),
  note: text("note"),
  photoUrl: text("photo_url"),
  createdByMemberId: uuid("created_by_member_id").references(() => members.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Łapki: transakcje nagród
// ---------------------------------------------------------------------------

export const rewardTransactions = pgTable("reward_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id")
    .notNull()
    .references(() => couples.id, { onDelete: "cascade" }),
  memberId: uuid("member_id").references(() => members.id, { onDelete: "set null" }),
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(),
  sourceId: text("source_id"),
  idempotencyKey: text("idempotency_key").unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Osiągnięcia
// ---------------------------------------------------------------------------

export const achievementUnlocks = pgTable(
  "achievement_unlocks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    achievementKey: text("achievement_key").notNull(),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.coupleId, table.achievementKey)],
);

// ---------------------------------------------------------------------------
// Moduł uspokojenia
// ---------------------------------------------------------------------------

export const calmSessions = pgTable("calm_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id")
    .notNull()
    .references(() => couples.id, { onDelete: "cascade" }),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  activityType: text("activity_type").notNull(),
  durationSeconds: integer("duration_seconds"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Tryb „Po kłótni”
// ---------------------------------------------------------------------------

export const afterFightSessions = pgTable("after_fight_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id")
    .notNull()
    .references(() => couples.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("in_progress"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const afterFightEntries = pgTable(
  "after_fight_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => afterFightSessions.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    calmChoice: text("calm_choice"),
    emotions: jsonb("emotions").$type<string[]>(),
    difficult: text("difficult"),
    needs: jsonb("needs").$type<string[]>(),
    conversationMode: text("conversation_mode"),
    improve: text("improve"),
    finalThought: text("final_thought"),
    readyState: text("ready_state").notNull().default("ready"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
  },
  (table) => [unique().on(table.sessionId, table.memberId)],
);


// ---------------------------------------------------------------------------
// Meow Core 2.0: słoik randek, historia, aktywność i ulubione
// ---------------------------------------------------------------------------

export const dateIdeas = pgTable("date_ideas", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id")
    .notNull()
    .references(() => couples.id, { onDelete: "cascade" }),
  createdByMemberId: uuid("created_by_member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  note: text("note"),
  category: text("category").notNull().default("spontaniczne"),
  status: text("status").notNull().default("idea"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const relationshipEvents = pgTable("relationship_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id")
    .notNull()
    .references(() => couples.id, { onDelete: "cascade" }),
  createdByMemberId: uuid("created_by_member_id")
    .references(() => members.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  eventDate: date("event_date").notNull(),
  description: text("description"),
  photoUrl: text("photo_url"),
  eventType: text("event_type").notNull().default("custom"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const memoryFavorites = pgTable(
  "memory_favorites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    memoryId: uuid("memory_id")
      .notNull()
      .references(() => memories.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.memoryId, table.memberId)],
);

export const coupleEvents = pgTable("couple_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id")
    .notNull()
    .references(() => couples.id, { onDelete: "cascade" }),
  actorMemberId: uuid("actor_member_id")
    .references(() => members.id, { onDelete: "set null" }),
  recipientMemberId: uuid("recipient_member_id")
    .references(() => members.id, { onDelete: "set null" }),
  type: text("type").notNull(),
  payload: jsonb("payload").$type<Record<string, string | number | boolean | null>>(),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// MEOW 5.0 Music Engine: wspólna biblioteka + zsynchronizowany pokój muzyczny
// ---------------------------------------------------------------------------

export const coupleTracks = pgTable(
  "couple_tracks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    addedByMemberId: uuid("added_by_member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerTrackId: text("provider_track_id").notNull(),
    title: text("title").notNull(),
    artist: text("artist").notNull(),
    album: text("album"),
    artworkUrl: text("artwork_url"),
    durationMs: integer("duration_ms"),
    sourcePermalink: text("source_permalink"),
    isOurSong: boolean("is_our_song").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.coupleId, table.provider, table.providerTrackId)],
);

export const musicPlaylists = pgTable(
  "music_playlists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    createdByMemberId: uuid("created_by_member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    vibe: text("vibe"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
);

export const musicPlaylistTracks = pgTable(
  "music_playlist_tracks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playlistId: uuid("playlist_id")
      .notNull()
      .references(() => musicPlaylists.id, { onDelete: "cascade" }),
    trackId: uuid("track_id")
      .notNull()
      .references(() => coupleTracks.id, { onDelete: "cascade" }),
    addedByMemberId: uuid("added_by_member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.playlistId, table.trackId)],
);

export const musicRooms = pgTable(
  "music_rooms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    provider: text("provider").notNull().default("audius"),
    providerTrackId: text("provider_track_id"),
    title: text("title"),
    artist: text("artist"),
    artworkUrl: text("artwork_url"),
    durationMs: integer("duration_ms"),
    sourcePermalink: text("source_permalink"),
    isPlaying: boolean("is_playing").notNull().default(false),
    positionMs: integer("position_ms").notNull().default(0),
    stateChangedAt: timestamp("state_changed_at", { withTimezone: true }).notNull().defaultNow(),
    updatedByMemberId: uuid("updated_by_member_id").references(() => members.id, { onDelete: "set null" }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.coupleId)],
);
