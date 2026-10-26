/*
# Add cover_url and roles to profiles

1. Modified Tables
- `profiles`: Added `cover_url` (text, nullable) for profile banner/cover image.
- `profiles`: Added `roles` (text[], nullable, DEFAULT '{member}') for multi-role badge system.

2. Security
- No new RLS policies needed; existing profile policies cover the new columns.
- Column-level UPDATE grant on cover_url and roles is covered by the existing table-level UPDATE grant.
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS roles text[] DEFAULT '{"member"}';
