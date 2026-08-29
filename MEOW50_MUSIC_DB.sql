-- MEOW 5.0 Music Engine - fallback SQL
-- Prefer: npx drizzle-kit push

CREATE TABLE IF NOT EXISTS couple_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  added_by_member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  provider text NOT NULL,
  provider_track_id text NOT NULL,
  title text NOT NULL,
  artist text NOT NULL,
  album text,
  artwork_url text,
  duration_ms integer,
  source_permalink text,
  is_our_song boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT couple_tracks_couple_provider_track_unique UNIQUE (couple_id, provider, provider_track_id)
);

CREATE TABLE IF NOT EXISTS music_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'audius',
  provider_track_id text,
  title text,
  artist text,
  artwork_url text,
  duration_ms integer,
  source_permalink text,
  is_playing boolean NOT NULL DEFAULT false,
  position_ms integer NOT NULL DEFAULT 0,
  state_changed_at timestamptz NOT NULL DEFAULT now(),
  updated_by_member_id uuid REFERENCES members(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT music_rooms_couple_unique UNIQUE (couple_id)
);
