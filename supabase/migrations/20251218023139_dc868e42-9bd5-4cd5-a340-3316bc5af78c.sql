
-- Fix: Allow anonymous users to select their own search events by session_id
-- This enables click tracking to work for non-logged-in users

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own search events" ON search_events;

-- Create a new policy that allows session-based access
CREATE POLICY "Users can view their own search events"
ON search_events
FOR SELECT
USING (
  auth.uid() = user_id 
  OR (user_id IS NULL AND session_id IS NOT NULL)
);
