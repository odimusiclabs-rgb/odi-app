/*
# Create tracks and track_notes tables

1. New Tables
- `tracks`: Stores user's music tracks with metadata (title, artist, BPM, key, status, starred, lyrics/notes).
  - id (uuid, PK)
  - user_id (uuid, NOT NULL, DEFAULT auth.uid(), FK to auth.users)
  - title (text, NOT NULL)
  - artist (text, NOT NULL)
  - bpm (integer, nullable)
  - key_signature (text, nullable) — musical key/tonality
  - status (text, NOT NULL, DEFAULT 'demo') — one of: demo, master, released
  - starred (boolean, NOT NULL, DEFAULT false) — for Release Radar filter
  - lyrics (text, nullable) — lyrics/notes attached to the track
  - cover_url (text, nullable) — optional cover image URL
  - audio_url (text, nullable) — optional audio file URL
  - duration (integer, nullable) — track duration in seconds
  - created_at (timestamptz, DEFAULT now())
  - updated_at (timestamptz, DEFAULT now())

- `track_notes`: Timecoded notes pinned to a specific timestamp within a track.
  - id (uuid, PK)
  - user_id (uuid, NOT NULL, DEFAULT auth.uid(), FK to auth.users)
  - track_id (uuid, NOT NULL, FK to tracks ON DELETE CASCADE)
  - timecode (integer, NOT NULL) — position in seconds
  - text (text, NOT NULL, DEFAULT '')
  - created_at (timestamptz, DEFAULT now())

2. Security
- Enable RLS on both tables.
- Grant CRUD to authenticated only (app has sign-in).
- Owner-scoped CRUD: each authenticated user can only access rows they own.
- track_notes scoped through tracks ownership via EXISTS subquery.
- Added updated_at auto-trigger for tracks.
*/

CREATE TABLE IF NOT EXISTS tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  artist text NOT NULL,
  bpm integer,
  key_signature text,
  status text NOT NULL DEFAULT 'demo' CHECK (status IN ('demo', 'master', 'released')),
  starred boolean NOT NULL DEFAULT false,
  lyrics text,
  cover_url text,
  audio_url text,
  duration integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON tracks TO authenticated;

DROP POLICY IF EXISTS "select_own_tracks" ON tracks;
CREATE POLICY "select_own_tracks" ON tracks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_tracks" ON tracks;
CREATE POLICY "insert_own_tracks" ON tracks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_tracks" ON tracks;
CREATE POLICY "update_own_tracks" ON tracks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_tracks" ON tracks;
CREATE POLICY "delete_own_tracks" ON tracks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS track_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id uuid NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  timecode integer NOT NULL,
  text text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE track_notes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON track_notes TO authenticated;

DROP POLICY IF EXISTS "select_own_track_notes" ON track_notes;
CREATE POLICY "select_own_track_notes" ON track_notes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_track_notes" ON track_notes;
CREATE POLICY "insert_own_track_notes" ON track_notes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_track_notes" ON track_notes;
CREATE POLICY "update_own_track_notes" ON track_notes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_track_notes" ON track_notes;
CREATE POLICY "delete_own_track_notes" ON track_notes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);