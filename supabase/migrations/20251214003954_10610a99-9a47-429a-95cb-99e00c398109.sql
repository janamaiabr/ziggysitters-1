-- Add weekly sitter digest cron job (runs every Monday at 9am NZT = 8pm Sunday UTC)
SELECT cron.schedule(
  'weekly-sitter-digest',
  '0 20 * * 0', -- Every Sunday at 8pm UTC = Monday 9am NZT
  $$
  SELECT net.http_post(
    url := 'https://qermxzepyzbenemcordv.supabase.co/functions/v1/send-weekly-sitter-digest',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcm14emVweXpiZW5lbWNvcmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NDkzNTksImV4cCI6MjA3MzIyNTM1OX0.OpzbomICzVes3YWxn_KESzpEMGPTQSEA9gVNtGmIUx8"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);