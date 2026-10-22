/*
# Lock down grants and fix function search_path

## Purpose
1. REVOKE excess default privileges that Postgres grants to `anon` and `authenticated`
   on `profiles` and `site_content` — the default broad grants undermine our column-level
   restrictions and RLS policies.
2. Re-grant only the minimum needed:
   - profiles: SELECT + INSERT(id,name,email) + UPDATE(name,email) to authenticated only.
   - site_content: SELECT to anon+authenticated; UPDATE(columns) to authenticated.
3. Grant service_role full CRUD on profiles (the admin edge function uses the service
   role key to manage users and needs to read/write profiles).
4. Fix the `update_site_content_timestamp` trigger function to set an explicit
   `search_path = public`, resolving the security advisor warning.

## Security Changes
- REVOKE ALL on profiles FROM anon, authenticated — removes default broad grants.
- REVOKE ALL on site_content FROM anon, authenticated — same.
- RE-GRANT only the minimum needed (see above).
- GRANT ALL on profiles TO service_role — admin edge function bypasses RLS via service key.
- ALTER FUNCTION update_site_content_timestamp SET search_path = public.
*/

-- Lock down profiles: revoke everything first, then grant only what's needed
REVOKE ALL ON profiles FROM anon, authenticated;
GRANT SELECT ON profiles TO authenticated;
GRANT INSERT (id, name, email) ON profiles TO authenticated;
GRANT UPDATE (name, email) ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;

-- Lock down site_content: revoke everything first, then grant only what's needed
REVOKE ALL ON site_content FROM anon, authenticated;
GRANT SELECT ON site_content TO anon, authenticated;
GRANT UPDATE (hero_title, hero_subtitle, hero_image_url, jet_image_url) ON site_content TO authenticated;
GRANT ALL ON site_content TO service_role;

-- Fix mutable search_path on the trigger function
CREATE OR REPLACE FUNCTION public.update_site_content_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
