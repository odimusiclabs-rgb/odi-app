/*
# Create notes table for user notes

1. New Tables
- `notes`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to auth.uid(), references auth.users)
  - `title` (text, not null)
  - `content` (text, stores HTML from the rich text editor)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz, auto-updated)

2. Security
- Enable RLS on `notes`.
- Grant CRUD to `authenticated` only (app has sign-in).
- Owner-scoped CRUD: each authenticated user can only access their own notes.

3. Notes
- `user_id` defaults to `auth.uid()` so inserts from the client work without passing it.
- `content` stores HTML strings produced by the contentEditable rich text editor.
*/

CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON notes TO authenticated;

DROP POLICY IF EXISTS "select_own_notes" ON notes;
CREATE POLICY "select_own_notes"
  ON notes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notes" ON notes;
CREATE POLICY "insert_own_notes"
  ON notes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notes" ON notes;
CREATE POLICY "update_own_notes"
  ON notes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notes" ON notes;
CREATE POLICY "delete_own_notes"
  ON notes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
