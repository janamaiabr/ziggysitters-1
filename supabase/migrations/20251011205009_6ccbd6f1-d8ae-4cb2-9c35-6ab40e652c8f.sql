-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule cleanup of stale payments to run daily at 3 AM
SELECT cron.schedule(
  'cleanup-stale-awaiting-payments',
  '0 3 * * *', -- Run at 3 AM every day
  $$
  SELECT cleanup_stale_payments();
  $$
);