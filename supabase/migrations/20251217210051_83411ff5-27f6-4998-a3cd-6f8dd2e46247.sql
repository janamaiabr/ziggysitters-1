
-- Add UPDATE policy for search_events so click tracking works
CREATE POLICY "Users can update their own search events" 
ON public.search_events 
FOR UPDATE 
USING (
  (auth.uid() = user_id) OR 
  (user_id IS NULL AND session_id IS NOT NULL)
)
WITH CHECK (
  (auth.uid() = user_id) OR 
  (user_id IS NULL AND session_id IS NOT NULL)
);
