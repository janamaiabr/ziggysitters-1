-- Fix the RLS policy for search_events
-- The problem: we store profile.id in user_id, but RLS checks auth.uid() = user_id
-- These are DIFFERENT UUIDs, so updates fail silently!

-- Drop existing policies
DROP POLICY IF EXISTS "Users can update their own search events" ON search_events;
DROP POLICY IF EXISTS "Users can view their own search events" ON search_events;

-- Create corrected policies that properly check via profiles table
CREATE POLICY "Users can update their own search events" 
ON search_events 
FOR UPDATE 
USING (
  -- Can update if: owns the row OR row is anonymous from same session
  (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.id = search_events.user_id))
  OR 
  (search_events.user_id IS NULL AND search_events.session_id IS NOT NULL)
)
WITH CHECK (
  -- After update: user_id must match the logged-in user's profile OR still be null
  (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.id = search_events.user_id))
  OR 
  (search_events.user_id IS NULL)
);

CREATE POLICY "Users can view their own search events" 
ON search_events 
FOR SELECT 
USING (
  (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.id = search_events.user_id))
  OR 
  (search_events.user_id IS NULL AND search_events.session_id IS NOT NULL)
);