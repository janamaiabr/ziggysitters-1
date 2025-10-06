-- Add requires_daily_reports field to bookings table
ALTER TABLE public.bookings 
ADD COLUMN requires_daily_reports boolean NOT NULL DEFAULT true;

-- Add comment explaining the field
COMMENT ON COLUMN public.bookings.requires_daily_reports IS 'Whether the pet owner has requested daily reports for this booking';

-- Create index for better query performance
CREATE INDEX idx_bookings_requires_daily_reports ON public.bookings(requires_daily_reports) WHERE requires_daily_reports = true;