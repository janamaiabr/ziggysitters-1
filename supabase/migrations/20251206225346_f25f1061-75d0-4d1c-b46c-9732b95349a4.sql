-- Drop the insecure INSERT policy
DROP POLICY IF EXISTS "Users can create cancellation requests" ON public.account_cancellation_requests;

-- Create a secure INSERT policy that validates user_id matches authenticated user
CREATE POLICY "Users can create their own cancellation requests" 
ON public.account_cancellation_requests 
FOR INSERT 
TO authenticated
WITH CHECK (
  user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);