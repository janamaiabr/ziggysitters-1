-- Backfill search_events: convert profile.id to profiles.user_id (auth UUID)
-- This fixes the mismatch where search_events.user_id was storing profile.id 
-- instead of auth.users.id

-- The search_events.user_id column is UUID type
-- We need to update records where search_events.user_id matches a profile.id
-- and replace with that profile's user_id (the auth.users UUID)

UPDATE search_events se
SET user_id = p.user_id::uuid
FROM profiles p
WHERE se.user_id = p.id
  AND se.user_id IS NOT NULL
  AND p.user_id IS NOT NULL;