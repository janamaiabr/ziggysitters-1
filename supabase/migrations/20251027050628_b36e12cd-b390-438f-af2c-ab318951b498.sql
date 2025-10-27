-- Enable pg_cron and pg_net extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Grant permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Schedule auto_complete_bookings to run daily at 1 AM
SELECT cron.schedule(
  'auto-complete-bookings-daily',
  '0 1 * * *', -- Run at 1 AM every day
  $$
  SELECT auto_complete_bookings();
  $$
);

-- Schedule auto-process-payouts edge function to run daily at 2 AM
-- This runs after bookings are auto-completed
SELECT cron.schedule(
  'auto-process-payouts-daily',
  '0 2 * * *', -- Run at 2 AM every day
  $$
  SELECT
    net.http_post(
        url:='https://qermxzepyzbenemcordv.supabase.co/functions/v1/auto-process-payouts',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcm14emVweXpiZW5lbWNvcmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NDkzNTksImV4cCI6MjA3MzIyNTM1OX0.OpzbomICzVes3YWxn_KESzpEMGPTQSEA9gVNtGmIUx8"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);