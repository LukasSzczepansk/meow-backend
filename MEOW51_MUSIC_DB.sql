-- MEOW 5.1 Music Studio - fallback SQL
-- Prefer: npx drizzle-kit push

CREATE TABLE IF NOT EXISTS music_playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  created_by_member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  name text NOT NULL,
  vibe text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS music_playlist_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid NOT NULL REFERENCES music_playlists(id) ON DELETE CASCADE,
  track_id uuid NOT NULL REFERENCES couple_tracks(id) ON DELETE CASCADE,
  added_by_member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT music_playlist_tracks_playlist_track_unique UNIQUE (playlist_id, track_id)
);
