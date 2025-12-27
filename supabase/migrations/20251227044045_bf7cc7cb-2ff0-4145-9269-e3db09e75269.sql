-- Add custom time range columns for young walker availability
ALTER TABLE public.young_walkers
ADD COLUMN IF NOT EXISTS after_school_start_time time DEFAULT '15:00',
ADD COLUMN IF NOT EXISTS after_school_end_time time DEFAULT '18:00',
ADD COLUMN IF NOT EXISTS weekend_start_time time DEFAULT '09:00',
ADD COLUMN IF NOT EXISTS weekend_end_time time DEFAULT '17:00',
ADD COLUMN IF NOT EXISTS holiday_start_time time DEFAULT '09:00',
ADD COLUMN IF NOT EXISTS holiday_end_time time DEFAULT '17:00';

-- Add comment for clarity
COMMENT ON COLUMN public.young_walkers.after_school_start_time IS 'Start time for after school availability (default 3pm)';
COMMENT ON COLUMN public.young_walkers.after_school_end_time IS 'End time for after school availability (default 6pm)';
COMMENT ON COLUMN public.young_walkers.weekend_start_time IS 'Start time for weekend availability (default 9am)';
COMMENT ON COLUMN public.young_walkers.weekend_end_time IS 'End time for weekend availability (default 5pm)';
COMMENT ON COLUMN public.young_walkers.holiday_start_time IS 'Start time for school holiday availability (default 9am)';
COMMENT ON COLUMN public.young_walkers.holiday_end_time IS 'End time for school holiday availability (default 5pm)';