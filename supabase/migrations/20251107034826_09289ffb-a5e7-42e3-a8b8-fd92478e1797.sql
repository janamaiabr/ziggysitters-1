-- Prevent duplicate daily reports: one report per booking per day
-- Also ensure reports are only for dates within the booking period

-- Add unique constraint to prevent duplicate reports for same booking and date
ALTER TABLE daily_reports 
ADD CONSTRAINT unique_booking_report_date 
UNIQUE (booking_id, report_date);

-- Add check constraint to ensure report_date is within booking period
-- Using a trigger instead of CHECK constraint to avoid immutability issues
CREATE OR REPLACE FUNCTION validate_report_date()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  booking_start date;
  booking_end date;
  today_date date;
BEGIN
  -- Get booking dates
  SELECT start_date, end_date INTO booking_start, booking_end
  FROM bookings
  WHERE id = NEW.booking_id;

  -- Get current date
  today_date := CURRENT_DATE;

  -- Validate report_date is within booking period
  IF NEW.report_date < booking_start OR NEW.report_date > booking_end THEN
    RAISE EXCEPTION 'Report date must be within the booking period (% to %)', booking_start, booking_end;
  END IF;

  -- Validate report_date is not in the future
  IF NEW.report_date > today_date THEN
    RAISE EXCEPTION 'Cannot submit reports for future dates. Please wait until the booking day.';
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to validate report dates
DROP TRIGGER IF EXISTS validate_report_date_trigger ON daily_reports;
CREATE TRIGGER validate_report_date_trigger
  BEFORE INSERT OR UPDATE ON daily_reports
  FOR EACH ROW
  EXECUTE FUNCTION validate_report_date();

-- Add helpful comment
COMMENT ON CONSTRAINT unique_booking_report_date ON daily_reports IS 
'Ensures sitters can only submit one report per day per booking';