/*
# Create profiles table

## Purpose
Stores user profile information for the ODI LABS music platform.
Each registered user has a profile row linked to their Supabase auth account.

## New Tables
- `profiles`
  - `id` (uuid, primary key) — matches the user's auth.users id
  - `name` (text, not null) — display name shown in the UI
  - `email` (text, not null) — email address, mirrors auth.users email
  - `role` (text, not null, default 'user') — either 'user' or 'admin'
  - `created_at` (timestamptz, default now()) — registration timestamp

## Security
- RLS enabled on `profiles`.
- GRANT SELECT, INSERT, UPDATE to `authenticated` only (this app requires sign-in).
  - INSERT/UPDATE restricted to columns the user should control: name, email.
  - SELECT on all columns so the profile page can display role + created_at.
- Policies:
  1. Users can SELECT their own profile row.
  2. Users can INSERT their own profile row (during sign-up).
  3. Users can UPDATE their own profile row (name/email only — role is not grantable).
- No DELETE policy from the client — user deletion is handled by the admin edge function
  using the service role key, which bypasses RLS.

## Notes
1. The `id` column references `auth.users(id)` with CASCADE delete, so deleting
   an auth user automatically removes their profile.
2. `role` defaults to 'user'. The admin role is assigned to the specific admin email
   during the sign-up flow by the edge function (not by the client — the client
   cannot set or change the role column).
3. The GRANT for INSERT/UPDATE covers only (name, email) columns, preventing users
   from escalating their own role via the Data API.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON profiles TO authenticated;
GRANT INSERT (id, name, email) ON profiles TO authenticated;
GRANT UPDATE (name, email) ON profiles TO authenticated;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
