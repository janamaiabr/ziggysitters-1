-- ============= CRITICAL FIX: Prevent Double-Booking at Database Level =============

-- Create a function to check for overlapping bookings
CREATE OR REPLACE FUNCTION check_booking_overlap()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if there are any conflicting bookings for the same sitter
  IF EXISTS (
    SELECT 1 
    FROM bookings 
    WHERE sitter_id = NEW.sitter_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND status IN ('pending', 'awaiting_payment', 'confirmed', 'in_progress')
      AND (
        -- New booking overlaps with existing booking
        (NEW.start_date <= end_date AND NEW.end_date >= start_date)
      )
  ) THEN
    RAISE EXCEPTION 'Sitter is not available for these dates - overlapping booking exists';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce no overlapping bookings
DROP TRIGGER IF EXISTS prevent_overlapping_bookings ON bookings;
CREATE TRIGGER prevent_overlapping_bookings
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_overlap();

-- ============= CRITICAL FIX: Add Input Validation Constraints =============

-- Add check constraints for reasonable values
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_total_amount_positive;
ALTER TABLE bookings ADD CONSTRAINT bookings_total_amount_positive 
  CHECK (total_amount > 0 AND total_amount <= 100000);

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_dates_valid;
ALTER TABLE bookings ADD CONSTRAINT bookings_dates_valid 
  CHECK (end_date >= start_date);

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_special_instructions_length;
ALTER TABLE bookings ADD CONSTRAINT bookings_special_instructions_length 
  CHECK (char_length(special_instructions) <= 2000);

-- Add constraint for reasonable pet count (array length)
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_pet_count;
ALTER TABLE bookings ADD CONSTRAINT bookings_pet_count 
  CHECK (array_length(pet_ids, 1) > 0 AND array_length(pet_ids, 1) <= 10);

-- ============= CRITICAL FIX: More Frequent Payment Cleanup =============

-- Update the cleanup function to be more aggressive (24 hours instead of 7 days)
CREATE OR REPLACE FUNCTION public.cleanup_stale_payments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Auto-cancel bookings that have been awaiting payment for more than 24 hours
  -- This prevents sitter calendar from being blocked by unpaid bookings
  UPDATE bookings
  SET status = 'cancelled',
      sitter_notes = COALESCE(sitter_notes || ' | ', '') || 'Auto-cancelled: Payment not received within 24 hours of sitter acceptance'
  WHERE status = 'awaiting_payment'
    AND updated_at < NOW() - INTERVAL '24 hours';
    
  -- Log the cleanup
  RAISE NOTICE 'Cleaned up stale awaiting_payment bookings';
END;
$function$;