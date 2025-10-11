-- Create a trigger to automatically increment daily_reports_completed when a report is submitted
-- This ensures the payment verification system can check if all reports are complete

-- First, create the trigger function
CREATE OR REPLACE FUNCTION public.increment_daily_reports_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Increment the counter for the booking
  UPDATE bookings
  SET daily_reports_completed = daily_reports_completed + 1
  WHERE id = NEW.booking_id;
  
  RETURN NEW;
END;
$$;

-- Create the trigger that fires after a daily report is inserted
CREATE TRIGGER trigger_increment_daily_reports_completed
AFTER INSERT ON daily_reports
FOR EACH ROW
EXECUTE FUNCTION public.increment_daily_reports_completed();

-- Add a comment for documentation
COMMENT ON FUNCTION public.increment_daily_reports_completed() IS 
'Automatically increments the daily_reports_completed counter when a sitter submits a daily report. This is critical for payment verification.';