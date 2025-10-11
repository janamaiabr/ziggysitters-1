-- Create function to validate booking status transitions
CREATE OR REPLACE FUNCTION public.update_booking_status(
  booking_id uuid,
  new_status booking_status
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_status booking_status;
  user_profile_id uuid;
  booking_sitter_id uuid;
BEGIN
  -- Get current booking status and sitter
  SELECT status, sitter_id INTO current_status, booking_sitter_id
  FROM bookings
  WHERE id = booking_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
  
  -- Get user's profile ID
  SELECT id INTO user_profile_id
  FROM profiles
  WHERE user_id = auth.uid();
  
  -- Verify user is the sitter for this booking
  IF user_profile_id != booking_sitter_id THEN
    RAISE EXCEPTION 'Only the assigned sitter can update booking status';
  END IF;
  
  -- Validate status transitions
  CASE current_status
    WHEN 'confirmed' THEN
      IF new_status != 'in_progress' THEN
        RAISE EXCEPTION 'Can only start confirmed bookings';
      END IF;
    WHEN 'in_progress' THEN
      IF new_status != 'completed' THEN
        RAISE EXCEPTION 'In-progress bookings can only be completed';
      END IF;
    ELSE
      RAISE EXCEPTION 'Invalid status transition from %', current_status;
  END CASE;
  
  -- Update the status
  UPDATE bookings
  SET status = new_status
  WHERE id = booking_id;
END;
$$;

-- Create function to auto-cancel stale awaiting_payment bookings
CREATE OR REPLACE FUNCTION public.cleanup_stale_payments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Auto-cancel bookings that have been awaiting payment for more than 7 days
  UPDATE bookings
  SET status = 'cancelled',
      sitter_notes = COALESCE(sitter_notes || ' | ', '') || 'Auto-cancelled: Payment not received within 7 days'
  WHERE status = 'awaiting_payment'
    AND updated_at < NOW() - INTERVAL '7 days';
END;
$$;