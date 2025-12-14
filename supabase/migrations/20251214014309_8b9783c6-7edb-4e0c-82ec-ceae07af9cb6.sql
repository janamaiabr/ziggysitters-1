-- Schedule daily all-daily-report reminders (runs at 6 PM NZT / 5 AM UTC)
SELECT cron.schedule(
  'daily-daily-report-reminders',
  '0 5 * * *',
  $$
  SELECT net.http_post(
    url := 'https://qermxzepyzbenemcordv.supabase.co/functions/v1/send-all-daily-report-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcm14emVweXpiZW5lbWNvcmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NDkzNTksImV4cCI6MjA3MzIyNTM1OX0.OpzbomICzVes3YWxn_KESzpEMGPTQSEA9gVNtGmIUx8"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Schedule daily missing documents check (runs at 10 AM NZT / 9 PM UTC)
SELECT cron.schedule(
  'daily-missing-documents-check',
  '0 21 * * *',
  $$
  SELECT net.http_post(
    url := 'https://qermxzepyzbenemcordv.supabase.co/functions/v1/check-missing-documents',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcm14emVweXpiZW5lbWNvcmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NDkzNTksImV4cCI6MjA3MzIyNTM1OX0.OpzbomICzVes3YWxn_KESzpEMGPTQSEA9gVNtGmIUx8"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Schedule weekly bulk onboarding reminders (runs every Monday at 10 AM NZT / 9 PM Sunday UTC)
SELECT cron.schedule(
  'weekly-bulk-onboarding-reminders',
  '0 21 * * 0',
  $$
  SELECT net.http_post(
    url := 'https://qermxzepyzbenemcordv.supabase.co/functions/v1/send-bulk-onboarding-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcm14emVweXpiZW5lbWNvcmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NDkzNTksImV4cCI6MjA3MzIyNTM1OX0.OpzbomICzVes3YWxn_KESzpEMGPTQSEA9gVNtGmIUx8"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);