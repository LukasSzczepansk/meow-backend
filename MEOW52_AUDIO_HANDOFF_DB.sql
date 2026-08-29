-- MEOW 5.2 - background-audio handoff metadata
-- Safe/idempotent migration for existing Neon/Postgres databases.
-- This stores metadata + a URL to audio that you are authorized to host/stream.
-- It does NOT store or extract YouTube audio.

ALTER TABLE couple_tracks ADD COLUMN IF NOT EXISTS audio_url text;
ALTER TABLE couple_tracks ADD COLUMN IF NOT EXISTS audio_status text NOT NULL DEFAULT 'unavailable';
ALTER TABLE couple_tracks ADD COLUMN IF NOT EXISTS listen_count integer NOT NULL DEFAULT 0;
ALTER TABLE couple_tracks ADD COLUMN IF NOT EXISTS last_played_at timestamptz;
ALTER TABLE couple_tracks ADD COLUMN IF NOT EXISTS preparation_requested_at timestamptz;
ALTER TABLE couple_tracks ADD COLUMN IF NOT EXISTS audio_updated_at timestamptz;

UPDATE couple_tracks
SET audio_status = CASE
  WHEN audio_url IS NOT NULL THEN 'ready'
  WHEN provider = 'youtube' THEN 'youtube_only'
  ELSE audio_status
END;

CREATE INDEX IF NOT EXISTS couple_tracks_audio_status_idx
  ON couple_tracks (audio_status);

CREATE INDEX IF NOT EXISTS couple_tracks_provider_track_idx
  ON couple_tracks (provider, provider_track_id);

CREATE INDEX IF NOT EXISTS couple_tracks_last_played_at_idx
  ON couple_tracks (last_played_at DESC);
