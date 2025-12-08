-- Add column to track when we last sent a sitter notification to prevent spam
ALTER TABLE public.email_captures 
ADD COLUMN IF NOT EXISTS last_sitter_notification_at timestamp with time zone DEFAULT NULL;

-- Add index for efficient querying by location
CREATE INDEX IF NOT EXISTS idx_email_captures_search_location ON public.email_captures(search_location);

-- Add index for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_email_captures_last_notification ON public.email_captures(last_sitter_notification_at);