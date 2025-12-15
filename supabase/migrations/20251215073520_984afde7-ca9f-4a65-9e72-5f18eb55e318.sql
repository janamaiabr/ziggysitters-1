-- Create user_events table for comprehensive event tracking
CREATE TABLE public.user_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id TEXT,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  page_path TEXT,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_user_events_user_id ON public.user_events(user_id);
CREATE INDEX idx_user_events_event_type ON public.user_events(event_type);
CREATE INDEX idx_user_events_created_at ON public.user_events(created_at DESC);
CREATE INDEX idx_user_events_session_id ON public.user_events(session_id);

-- Enable RLS
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert events (for tracking before login)
CREATE POLICY "Anyone can insert events" ON public.user_events
  FOR INSERT WITH CHECK (true);

-- Only admins can view all events
CREATE POLICY "Admins can view all events" ON public.user_events
  FOR SELECT USING (is_admin());

-- Users can view their own events
CREATE POLICY "Users can view own events" ON public.user_events
  FOR SELECT USING (
    user_id IN (SELECT id FROM profiles WHERE profiles.user_id = auth.uid())
  );

-- Create onboarding_funnel view for analytics
CREATE OR REPLACE VIEW public.onboarding_funnel AS
SELECT 
  p.id as user_id,
  p.first_name,
  p.email,
  p.role,
  p.created_at as registered_at,
  -- Step 1: Signed up
  true as signed_up,
  -- Step 2: Added pet (for pet owners)
  CASE 
    WHEN p.role = 'pet_owner' THEN EXISTS (SELECT 1 FROM pets WHERE owner_id = p.id)
    ELSE NULL
  END as added_pet,
  -- Step 3: Searched for sitters
  CASE 
    WHEN p.role = 'pet_owner' THEN EXISTS (SELECT 1 FROM search_events WHERE user_id = p.user_id)
    ELSE NULL
  END as searched,
  -- Step 4: Made a booking
  EXISTS (SELECT 1 FROM bookings WHERE owner_id = p.id) as made_booking,
  -- Step 5: Completed a booking
  EXISTS (SELECT 1 FROM bookings WHERE owner_id = p.id AND status = 'completed') as completed_booking,
  -- Time metrics
  (SELECT MIN(created_at) FROM pets WHERE owner_id = p.id) as first_pet_added_at,
  (SELECT MIN(created_at) FROM search_events WHERE user_id = p.user_id) as first_search_at,
  (SELECT MIN(created_at) FROM bookings WHERE owner_id = p.id) as first_booking_at
FROM profiles p
WHERE p.role = 'pet_owner';