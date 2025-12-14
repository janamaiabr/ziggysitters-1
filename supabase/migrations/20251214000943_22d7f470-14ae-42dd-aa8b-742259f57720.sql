-- Add cron job for sitter onboarding reminders (runs daily at 9am NZT)
SELECT cron.schedule(
  'sitter-onboarding-reminders-daily',
  '0 21 * * *',
  $$
  SELECT net.http_post(
    url := 'https://qermxzepyzbenemcordv.supabase.co/functions/v1/check-sitter-onboarding-status',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcm14emVweXpiZW5lbWNvcmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NDkzNTksImV4cCI6MjA3MzIyNTM1OX0.OpzbomICzVes3YWxn_KESzpEMGPTQSEA9gVNtGmIUx8"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);