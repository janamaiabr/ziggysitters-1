
-- Fix the RLS policy - user_id references profiles.id, not auth.uid()
DROP POLICY IF EXISTS "Allow event inserts" ON public.user_events;

CREATE POLICY "Allow event inserts" 
ON public.user_events 
FOR INSERT 
WITH CHECK (
  user_id IS NULL 
  OR user_id IN (SELECT id FROM profiles WHERE profiles.user_id = auth.uid())
);
