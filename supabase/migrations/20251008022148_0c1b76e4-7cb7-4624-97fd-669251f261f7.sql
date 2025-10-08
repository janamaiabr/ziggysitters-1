-- Add new booking status for awaiting payment after sitter acceptance
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'awaiting_payment';

-- Add a function for sitters to accept bookings
CREATE OR REPLACE FUNCTION public.accept_booking(booking_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update booking status to awaiting_payment
  UPDATE public.bookings
  SET status = 'awaiting_payment'
  WHERE id = booking_id
    AND status = 'pending'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = bookings.sitter_id
        AND profiles.user_id = auth.uid()
    );
END;
$$;