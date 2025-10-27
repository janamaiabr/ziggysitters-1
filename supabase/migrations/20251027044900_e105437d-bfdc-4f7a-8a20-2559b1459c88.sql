-- Create a trigger to automatically mark bookings as completed when end date passes
-- This ensures bookings transition to completed status so payouts can be processed

CREATE OR REPLACE FUNCTION auto_complete_bookings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update bookings that are in_progress and past their end_date to completed
  UPDATE bookings
  SET 
    status = 'completed',
    updated_at = now()
  WHERE status = 'in_progress'
    AND end_date < CURRENT_DATE
    AND payment_status = 'paid';
    
  -- Log the completion
  RAISE NOTICE 'Auto-completed bookings past end date';
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION auto_complete_bookings() TO authenticated;
GRANT EXECUTE ON FUNCTION auto_complete_bookings() TO service_role;

-- Add comment
COMMENT ON FUNCTION auto_complete_bookings() IS 'Automatically marks in_progress bookings as completed when their end_date has passed';