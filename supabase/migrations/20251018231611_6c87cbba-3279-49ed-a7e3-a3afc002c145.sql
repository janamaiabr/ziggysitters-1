-- Fix security warnings from previous migration

-- 1. Fix the check_booking_overlap function to have immutable search_path
DROP FUNCTION IF EXISTS check_booking_overlap() CASCADE;

CREATE OR REPLACE FUNCTION check_booking_overlap()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS prevent_overlapping_bookings ON bookings;
CREATE TRIGGER prevent_overlapping_bookings
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_overlap();