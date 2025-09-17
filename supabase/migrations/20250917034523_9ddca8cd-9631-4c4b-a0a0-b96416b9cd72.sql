-- Update RLS policy to allow any authenticated user to create bookings
-- Users can be both pet sitters and pet owners

DROP POLICY IF EXISTS "Pet owners can create bookings" ON public.bookings;

-- Create new policy that allows any authenticated user to create bookings for themselves
CREATE POLICY "Users can create bookings as owners" 
ON public.bookings 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.id = bookings.owner_id 
      AND profiles.user_id = auth.uid()
  )
);