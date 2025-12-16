-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can insert their own events" ON public.user_events;

-- Create new policy that allows inserts for both authenticated users (matching their id) AND anonymous users (null user_id)
CREATE POLICY "Allow event inserts" 
ON public.user_events 
FOR INSERT 
WITH CHECK (
  user_id IS NULL OR user_id = auth.uid()
);