-- MEOW CORE 2.0 — fallback SQL migration
-- Preferowane: npx drizzle-kit push
-- Ten plik jest alternatywą, jeśli chcesz wykonać zmiany ręcznie na bazie po patchu v1 / anti-AI-slop.

BEGIN;

CREATE TABLE IF NOT EXISTS room_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  room_type text NOT NULL,
  slot_key text NOT NULL,
  item_key text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (couple_id, room_type, slot_key)
);

ALTER TABLE book_entries ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'shared';
ALTER TABLE book_entries ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE reward_transactions ADD COLUMN IF NOT EXISTS member_id uuid REFERENCES members(id) ON DELETE SET NULL;
ALTER TABLE reward_transactions ADD COLUMN IF NOT EXISTS source_id text;
ALTER TABLE reward_transactions ADD COLUMN IF NOT EXISTS idempotency_key text;
CREATE UNIQUE INDEX IF NOT EXISTS reward_transactions_idempotency_key_uq
  ON reward_transactions (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

ALTER TABLE after_fight_entries ADD COLUMN IF NOT EXISTS conversation_mode text;
ALTER TABLE after_fight_entries ADD COLUMN IF NOT EXISTS final_thought text;
ALTER TABLE after_fight_entries ADD COLUMN IF NOT EXISTS ready_state text NOT NULL DEFAULT 'ready';

CREATE TABLE IF NOT EXISTS date_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  created_by_member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title text NOT NULL,
  note text,
  category text NOT NULL DEFAULT 'spontaniczne',
  status text NOT NULL DEFAULT 'idea',
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS date_ideas_couple_created_idx ON date_ideas (couple_id, created_at DESC);

CREATE TABLE IF NOT EXISTS relationship_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  created_by_member_id uuid REFERENCES members(id) ON DELETE SET NULL,
  title text NOT NULL,
  event_date date NOT NULL,
  description text,
  photo_url text,
  event_type text NOT NULL DEFAULT 'custom',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS relationship_events_couple_date_idx ON relationship_events (couple_id, event_date DESC);

CREATE TABLE IF NOT EXISTS memory_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id uuid NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (memory_id, member_id)
);

CREATE TABLE IF NOT EXISTS couple_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  actor_member_id uuid REFERENCES members(id) ON DELETE SET NULL,
  recipient_member_id uuid REFERENCES members(id) ON DELETE SET NULL,
  type text NOT NULL,
  payload jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS couple_events_couple_created_idx ON couple_events (couple_id, created_at DESC);
CREATE INDEX IF NOT EXISTS couple_events_recipient_unread_idx ON couple_events (recipient_member_id, read_at, created_at DESC);

COMMIT;
