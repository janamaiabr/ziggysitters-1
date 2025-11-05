-- Allow sitters to view owner profiles for their confirmed bookings
-- This is needed so sitters can see owner info on booking details page and submit reports

CREATE POLICY "Sitters can view owner profiles for their bookings"
ON profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.owner_id = profiles.id
      AND b.sitter_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
      AND b.status IN ('confirmed', 'awaiting_payment', 'in_progress', 'completed')
  )
);