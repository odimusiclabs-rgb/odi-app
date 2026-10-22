/*
# Create site_content table and seed default homepage content

## Purpose
Stores the editable homepage content for the ODI LABS music platform.
The admin panel reads and updates this single row to control the hero section
title, subtitle, and images shown on the public landing page.

## New Tables
- `site_content`
  - `id` (int, primary key) — always 1 (single-row configuration table)
  - `hero_title` (text, not null) — large headline on the homepage hero
  - `hero_subtitle` (text, not null) — sub-headline beneath the hero title
  - `hero_image_url` (text, not null) — URL of the hero background image
  - `jet_image_url` (text, not null) — URL of the JET artist/roster image
  - `updated_at` (timestamptz, default now()) — last modification timestamp

## Seed Data
- Inserts a single row (id=1) with default content:
  - hero_title: 'DISCOVER THE SOUND'
  - hero_subtitle: 'Studio without walls'
  - hero_image_url: Pexels stock photo URL
  - jet_image_url: local path '/images/IMG_0004.jpeg'

## Security
- RLS enabled on `site_content`.
- GRANT SELECT to `anon, authenticated` — the homepage is public; anyone can view.
- GRANT UPDATE to `authenticated` only — only signed-in users can attempt updates
  (the RLS policy further restricts this to admins).
- No INSERT or DELETE grants from the client — the seed row is managed via migration.
- Policies:
  1. SELECT (anon, authenticated) — public read, USING (true) is intentional: this
     is shared public content with no per-user isolation.
  2. UPDATE (authenticated) — only users whose profile role is 'admin' or whose email
     matches the admin email can update homepage content.

## Notes
1. This is a single-row configuration table. The app always queries `eq('id', 1)`.
2. The admin check in the UPDATE policy mirrors the client-side admin check
   (email === 'odimusic.office@gmail.com'), but also checks role = 'admin' for
   forward compatibility.
3. `updated_at` is automatically set to now() on every UPDATE via a trigger.
*/

CREATE TABLE IF NOT EXISTS site_content (
  id int PRIMARY KEY DEFAULT 1,
  hero_title text NOT NULL,
  hero_subtitle text NOT NULL,
  hero_image_url text NOT NULL,
  jet_image_url text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON site_content TO anon, authenticated;
GRANT UPDATE (hero_title, hero_subtitle, hero_image_url, jet_image_url) ON site_content TO authenticated;

DROP POLICY IF EXISTS "public_read_site_content" ON site_content;
CREATE POLICY "public_read_site_content"
  ON site_content FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "admin_update_site_content" ON site_content;
CREATE POLICY "admin_update_site_content"
  ON site_content FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.email = 'odimusic.office@gmail.com')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.email = 'odimusic.office@gmail.com')
    )
  );

-- Seed the default row
INSERT INTO site_content (id, hero_title, hero_subtitle, hero_image_url, jet_image_url)
VALUES (
  1,
  'DISCOVER THE SOUND',
  'Studio without walls',
  'https://images.pexels.com/photos/19330423/pexels-photo-19330423.jpeg?auto=compress&cs=tinysrgb&h=1200&w=800',
  '/images/IMG_0004.jpeg'
)
ON CONFLICT (id) DO NOTHING;

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_site_content_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS site_content_updated_at ON site_content;
CREATE TRIGGER site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW
  EXECUTE FUNCTION update_site_content_timestamp();
