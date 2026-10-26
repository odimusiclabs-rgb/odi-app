/*
# Create avatars storage bucket for profile images

## Purpose
Creates a public storage bucket for user avatar and cover images
uploaded through the Edit Profile page.

## Storage Bucket
- `avatars` (public) — stores avatar and cover images per user.
  Public bucket so profile pages can display images without signed URLs.
  Files are organized in subfolders by user ID: `<user_id>/avatar-<timestamp>`, `<user_id>/cover-<timestamp>`.

## Storage Policies
- SELECT (read): public — anyone can view avatar/cover images (anon + authenticated), USING (true).
  This is intentional: profile images are public content.
- INSERT (upload): authenticated only — any authenticated user can upload their own images.
  Files must be in a path starting with their own user ID.
- UPDATE: authenticated only — users can replace their own files.
- DELETE: authenticated only — users can remove their own files.

## Notes
1. The bucket is public so images render on profile pages without signed URLs.
2. Upload/update/delete policies restrict to the user's own folder via path prefix check.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Public read policy
DROP POLICY IF EXISTS "public_read_avatars" ON storage.objects;
CREATE POLICY "public_read_avatars"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'avatars');

-- Authenticated insert policy (user can upload to their own folder)
DROP POLICY IF EXISTS "auth_upload_own_avatar" ON storage.objects;
CREATE POLICY "auth_upload_own_avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated update policy (user can replace their own files)
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

-- Authenticated delete policy (user can remove their own files)
DROP POLICY IF EXISTS "auth_delete_own_avatar" ON storage.objects;
CREATE POLICY "auth_delete_own_avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
