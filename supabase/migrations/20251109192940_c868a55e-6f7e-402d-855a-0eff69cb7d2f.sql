-- RE-ENABLE production validation: Prevent future date daily reports
-- This was temporarily disabled for testing, now enabling for production launch

CREATE OR REPLACE FUNCTION public.validate_report_date()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  -- PRODUCTION: Prevent future date submissions
  IF NEW.report_date > today_date THEN
    RAISE EXCEPTION 'Cannot submit reports for future dates. Please wait until the booking day.';
  END IF;

  RETURN NEW;
END;
$function$;