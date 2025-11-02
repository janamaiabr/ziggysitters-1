
-- Schedule daily auto-processing of payouts at 2 AM
SELECT cron.schedule(
  'auto-process-payouts-daily',
  '0 2 * * *', -- Every day at 2 AM
  $$
  SELECT
    net.http_post(
        url:='https://qermxzepyzbenemcordv.supabase.co/functions/v1/auto-process-payouts',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcm14emVweXpiZW5lbWNvcmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NDkzNTksImV4cCI6MjA3MzIyNTM1OX0.OpzbomICzVes3YWxn_KESzpEMGPTQSEA9gVNtGmIUx8"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);
