/*
# Add bio and avatar_url columns to profiles + create avatars storage bucket

1. Modified Tables
- `profiles`: add `bio` (text, nullable) — user biography shown on profile page.
- `profiles`: add `avatar_url` (text, nullable) — URL to the user's avatar image in storage.

2. New Storage Bucket
- `avatars` (public) — stores user avatar images.

3. Storage Policies
- SELECT: anyone (anon + authenticated) can read avatars (public bucket).
- INSERT: authenticated users can upload to a path prefixed with their own user id.
- UPDATE: authenticated users can update their own avatar.
- DELETE: authenticated users can delete their own avatar.

4. Security Notes
- The profiles table already has RLS enabled with select/insert/update policies scoped to auth.uid() = id.
- The new columns are covered by the existing UPDATE policy (no column-level restrictions needed since users own their row).
- Avatar upload paths use `{user_id}/` prefix so users can only write to their own folder.
*/

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS avatar_url text;

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for avatars bucket
DROP POLICY IF EXISTS "public_read_avatars" ON storage.objects;
CREATE POLICY "public_read_avatars"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'avatars');

-- Authenticated users can upload to their own folder
DROP POLICY IF EXISTS "auth_upload_own_avatar" ON storage.objects;
CREATE POLICY "auth_upload_own_avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can update their own avatar
DROP POLICY IF EXISTS "auth_update_own_avatar" ON storage.objects;
CREATE POLICY "auth_update_own_avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can delete their own avatar
DROP POLICY IF EXISTS "auth_delete_own_avatar" ON storage.objects;
CREATE POLICY "auth_delete_own_avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Grant storage access
GRANT ALL ON SCHEMA storage TO authenticated;
