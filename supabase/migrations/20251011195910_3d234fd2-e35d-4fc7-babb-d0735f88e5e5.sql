-- Fix the default value for requires_daily_reports to be false instead of true
-- This prevents bookings from incorrectly defaulting to requiring daily reports
ALTER TABLE bookings 
ALTER COLUMN requires_daily_reports SET DEFAULT false;