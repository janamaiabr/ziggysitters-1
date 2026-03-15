
-- Enable pg_net if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create cron job to run expire-pending-bookings every 6 hours
SELECT cron.schedule(
  'expire-pending-bookings-6h',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://qermxzepyzbenemcordv.supabase.co/functions/v1/expire-pending-bookings',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcm14emVweXpiZW5lbWNvcmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NDkzNTksImV4cCI6MjA3MzIyNTM1OX0.OpzbomICzVes3YWxn_KESzpEMGPTQSEA9gVNtGmIUx8"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
