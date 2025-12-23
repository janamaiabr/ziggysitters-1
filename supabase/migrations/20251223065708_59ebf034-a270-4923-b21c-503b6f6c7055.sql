-- Fix search_events RLS policies to use auth.uid() directly 
-- since search_events.user_id now stores the auth user UUID, not profile.id

-- Drop existing policies
DROP POLICY IF EXISTS "Users can update their own search events" ON search_events;
DROP POLICY IF EXISTS "Users can view their own search events" ON search_events;

-- Create new policies that use auth.uid() directly
CREATE POLICY "Users can view their own search events" 
ON search_events 
FOR SELECT 
USING (
  (user_id = auth.uid()) 
  OR ((user_id IS NULL) AND (session_id IS NOT NULL))
  OR is_admin()
);

CREATE POLICY "Users can update their own search events" 
ON search_events 
FOR UPDATE 
USING (
  (user_id = auth.uid()) 
  OR ((user_id IS NULL) AND (session_id IS NOT NULL))
)
WITH CHECK (
  (user_id = auth.uid()) 
  OR (user_id IS NULL)
);