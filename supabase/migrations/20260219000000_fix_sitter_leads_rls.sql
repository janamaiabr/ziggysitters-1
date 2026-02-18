-- Fix sitter_leads: allow anonymous inserts (form was broken - RLS blocking anon users)
DROP POLICY IF EXISTS "Anyone can submit sitter lead" ON public.sitter_leads;
CREATE POLICY "Anyone can submit sitter lead" 
  ON public.sitter_leads 
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

-- Fix admin_event_queue: allow inserts for signup notifications
DROP POLICY IF EXISTS "Allow anonymous insert to event queue" ON public.admin_event_queue;
CREATE POLICY "Allow anonymous insert to event queue"
  ON public.admin_event_queue
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Schedule weekly admin digest (was never created)
SELECT cron.schedule(
  'weekly-admin-digest',
  '0 20 * * 0',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/send-weekly-admin-digest',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
