/*
# Create site-content storage bucket and policies

## Purpose
Creates a public storage bucket for homepage images (hero photo, JET photo)
uploaded through the admin panel's Content Manager.

## Storage Bucket
- `site-content` (public) — stores image files for the homepage.
  Public bucket so the homepage can display images without authenticated URLs.

## Storage Policies
- SELECT (read): public — anyone can view images (anon + authenticated), USING (true).
  This is intentional: homepage images are public content.
- INSERT (upload): authenticated only, admin check — only admins can upload new images.
- UPDATE: authenticated only, admin check — only admins can replace images.
- DELETE: authenticated only, admin check — only admins can remove images.

## Notes
1. The bucket is public so images render on the homepage without signed URLs.
2. Upload/update/delete policies verify the caller is an admin by joining to the
   profiles table and checking role = 'admin' or the admin email.
3. The AdminPanel.tsx component uploads to this bucket and uses getPublicUrl()
   to retrieve the public URL for storing in site_content.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('site-content', 'site-content', true)
ON CONFLICT (id) DO NOTHING;

-- Public read policy
DROP POLICY IF EXISTS "public_read_site_content_bucket" ON storage.objects;
CREATE POLICY "public_read_site_content_bucket"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'site-content');

-- Admin insert policy
DROP POLICY IF EXISTS "admin_upload_site_content" ON storage.objects;
CREATE POLICY "admin_upload_site_content"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'site-content'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.email = 'odimusic.office@gmail.com')
    )
  );

-- Admin update policy
DROP POLICY IF EXISTS "admin_update_site_content" ON storage.objects;
CREATE POLICY "admin_update_site_content"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'site-content'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.email = 'odimusic.office@gmail.com')
    )
  )
  WITH CHECK (
    bucket_id = 'site-content'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.email = 'odimusic.office@gmail.com')
    )
  );

-- Admin delete policy
DROP POLICY IF EXISTS "admin_delete_site_content" ON storage.objects;
CREATE POLICY "admin_delete_site_content"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'site-content'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.email = 'odimusic.office@gmail.com')
    )
  );
