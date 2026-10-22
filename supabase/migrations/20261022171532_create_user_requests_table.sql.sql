/*
# Create user_requests table

1. New Tables
- `user_requests`
  - `id` (uuid, primary key, auto-generated)
  - `user_id` (uuid, not null, defaults to auth.uid(), references auth.users ON DELETE CASCADE)
  - `type` (text, not null) — request category: 'event', 'support', 'artist', 'profile_edit'
  - `title` (text, not null) — short display title
  - `description` (text, not null) — brief description shown on the card
  - `status` (text, not null, default 'pending') — one of: pending, approved, resolved, rejected
  - `target_view` (text, nullable) — frontend view name to navigate to when card is clicked (e.g. 'map', 'artists', 'support', 'profile')
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `user_requests`.
- Grant SELECT, INSERT, UPDATE, DELETE to `authenticated` only (app requires sign-in).
- Owner-scoped CRUD: each authenticated user can only access rows they own.
- `user_id` defaults to `auth.uid()` so inserts that omit it still satisfy the WITH CHECK policy.

3. Indexes
- Index on `user_id` for efficient per-user queries.
- Index on `status` for filtering by status.
*/

CREATE TABLE IF NOT EXISTS user_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('event', 'support', 'artist', 'profile_edit')),
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'resolved', 'rejected')),
  target_view text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_requests ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON user_requests TO authenticated;

DROP POLICY IF EXISTS "select_own_requests" ON user_requests;
CREATE POLICY "select_own_requests"
  ON user_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_requests" ON user_requests;
CREATE POLICY "insert_own_requests"
  ON user_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_requests" ON user_requests;
CREATE POLICY "update_own_requests"
  ON user_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_requests" ON user_requests;
CREATE POLICY "delete_own_requests"
  ON user_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_requests_user_id ON user_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_requests_status ON user_requests(status);
