-- Create search events tracking table
CREATE TABLE IF NOT EXISTS public.search_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  search_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Search parameters
  suburb TEXT,
  city TEXT,
  service_type TEXT,
  pet_species TEXT[],
  pet_size TEXT[],
  
  -- Results and engagement
  results_count INTEGER,
  clicked_sitter_ids UUID[],
  
  -- Device/browser info for retargeting
  user_agent TEXT,
  referrer TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast user lookups
CREATE INDEX idx_search_events_user_id ON public.search_events(user_id);
CREATE INDEX idx_search_events_session_id ON public.search_events(session_id);
CREATE INDEX idx_search_events_timestamp ON public.search_events(search_timestamp DESC);
CREATE INDEX idx_search_events_suburb ON public.search_events(suburb);

-- Enable RLS
ALTER TABLE public.search_events ENABLE ROW LEVEL SECURITY;

-- Admins can view all search events for analytics
CREATE POLICY "Admins can view all search events"
  ON public.search_events
  FOR SELECT
  USING (is_admin());

-- Users can view their own search history
CREATE POLICY "Users can view their own search events"
  ON public.search_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone can insert search events (including anonymous users)
CREATE POLICY "Anyone can log search events"
  ON public.search_events
  FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE public.search_events IS 'Tracks user search behavior for analytics and retargeting';
COMMENT ON COLUMN public.search_events.session_id IS 'Browser session ID for tracking anonymous users';
COMMENT ON COLUMN public.search_events.clicked_sitter_ids IS 'Array of sitter profile IDs that were clicked from search results';