-- Create table for email captures (retargeting)
CREATE TABLE public.email_captures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  search_location TEXT,
  search_service_type TEXT,
  source TEXT DEFAULT 'search_retarget',
  subscribed BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_email_sent_at TIMESTAMP WITH TIME ZONE,
  email_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.email_captures ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for capturing emails from anonymous users)
CREATE POLICY "Anyone can submit email capture"
ON public.email_captures
FOR INSERT
WITH CHECK (true);

-- Only admins can view/manage
CREATE POLICY "Admins can view email captures"
ON public.email_captures
FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can update email captures"
ON public.email_captures
FOR UPDATE
USING (is_admin());

-- Create index for email lookups
CREATE INDEX idx_email_captures_email ON public.email_captures(email);
CREATE INDEX idx_email_captures_created ON public.email_captures(created_at DESC);