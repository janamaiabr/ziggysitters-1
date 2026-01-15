-- Create admin event queue table for weekly digest
CREATE TABLE public.admin_event_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  included_in_digest_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.admin_event_queue ENABLE ROW LEVEL SECURITY;

-- Only service role can access (edge functions)
CREATE POLICY "Service role full access"
ON public.admin_event_queue
FOR ALL
USING (auth.role() = 'service_role');

-- Index for efficient weekly queries
CREATE INDEX idx_admin_event_queue_pending ON public.admin_event_queue(created_at) 
WHERE included_in_digest_at IS NULL;