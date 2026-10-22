/*
# Create event_user_status table for saved/visited events

1. New Tables
- `event_user_status`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to auth.uid(), references auth.users)
  - `event_id` (int, not null — references the hardcoded map event IDs)
  - `saved` (boolean, default false — user bookmarked the event)
  - `visited` (boolean, default false — user attended the event)
  - `created_at` (timestamptz)
  - Unique constraint on (user_id, event_id) so each user has at most one status row per event.

2. Security
- Enable RLS on `event_user_status`.
- Grant CRUD to `authenticated` only (app has sign-in).
- Owner-scoped CRUD: each authenticated user can only access their own status rows.

3. Notes
- The `user_id` column defaults to `auth.uid()` so inserts from the client succeed even when user_id is omitted.
- `event_id` is an integer matching the hardcoded IDs in mapEvents.ts — no foreign key since events are not stored in a table.
*/

CREATE TABLE IF NOT EXISTS event_user_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id int NOT NULL,
  saved boolean NOT NULL DEFAULT false,
  visited boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, event_id)
);

ALTER TABLE event_user_status ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON event_user_status TO authenticated;

DROP POLICY IF EXISTS "select_own_event_status" ON event_user_status;
CREATE POLICY "select_own_event_status"
  ON event_user_status FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_event_status" ON event_user_status;
CREATE POLICY "insert_own_event_status"
  ON event_user_status FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_event_status" ON event_user_status;
CREATE POLICY "update_own_event_status"
  ON event_user_status FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_event_status" ON event_user_status;
CREATE POLICY "delete_own_event_status"
  ON event_user_status FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
