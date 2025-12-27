-- Young Dog Walker Program Tables
-- NZ Compliant: Supports parent/child registration with proper consent and restrictions

-- Enum for young walker status
DO $$ BEGIN
  CREATE TYPE young_walker_status AS ENUM ('pending_approval', 'active', 'suspended', 'inactive');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Main young walkers table
CREATE TABLE public.young_walkers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Profile linkage (the young walker's profile)
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Parent/Guardian information
  parent_user_id UUID NOT NULL, -- Parent's auth.users ID
  parent_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  
  -- Young walker details
  child_first_name TEXT NOT NULL,
  child_last_name TEXT NOT NULL,
  child_date_of_birth DATE NOT NULL,
  
  -- Service configuration (NZ compliant)
  rate_per_walk NUMERIC NOT NULL DEFAULT 15.00,
  max_walk_duration_mins INTEGER NOT NULL DEFAULT 30,
  max_distance_km NUMERIC NOT NULL DEFAULT 2.0,
  accepted_dog_sizes TEXT[] NOT NULL DEFAULT ARRAY['small', 'medium'],
  
  -- Availability (respecting school hours)
  available_after_school BOOLEAN DEFAULT true, -- 3pm-6pm weekdays
  available_weekends BOOLEAN DEFAULT true,
  available_school_holidays BOOLEAN DEFAULT true,
  
  -- Location
  home_suburb TEXT NOT NULL,
  home_city TEXT NOT NULL DEFAULT 'Auckland',
  service_radius_km NUMERIC NOT NULL DEFAULT 2.0,
  
  -- Bio and experience
  bio TEXT,
  experience_with_dogs TEXT,
  
  -- Parent consent
  parent_consent_given BOOLEAN NOT NULL DEFAULT false,
  parent_consent_given_at TIMESTAMP WITH TIME ZONE,
  parent_consent_ip TEXT,
  
  -- Checklists acknowledged
  parent_checklist_completed BOOLEAN NOT NULL DEFAULT false,
  safety_guidelines_acknowledged BOOLEAN NOT NULL DEFAULT false,
  
  -- Status
  status young_walker_status NOT NULL DEFAULT 'pending_approval',
  admin_approved_at TIMESTAMP WITH TIME ZONE,
  admin_approved_by UUID,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one young walker entry per profile
  CONSTRAINT young_walkers_profile_unique UNIQUE (profile_id)
);

-- Index for faster lookups
CREATE INDEX idx_young_walkers_status ON public.young_walkers(status);
CREATE INDEX idx_young_walkers_parent ON public.young_walkers(parent_user_id);
CREATE INDEX idx_young_walkers_suburb ON public.young_walkers(home_suburb);

-- Enable RLS
ALTER TABLE public.young_walkers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Parents can view/manage their children's profiles
CREATE POLICY "Parents can view their children walker profiles"
  ON public.young_walkers
  FOR SELECT
  USING (
    parent_user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = young_walkers.profile_id AND profiles.user_id = auth.uid())
  );

CREATE POLICY "Parents can create walker profiles for children"
  ON public.young_walkers
  FOR INSERT
  WITH CHECK (parent_user_id = auth.uid());

CREATE POLICY "Parents can update children walker profiles"
  ON public.young_walkers
  FOR UPDATE
  USING (parent_user_id = auth.uid());

-- Admins can manage all
CREATE POLICY "Admins view all young walker profiles"
  ON public.young_walkers
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins update young walker profiles"
  ON public.young_walkers
  FOR UPDATE
  USING (is_admin());

-- Public can view active young walkers (for search/hire)
CREATE POLICY "Public view active young walkers"
  ON public.young_walkers
  FOR SELECT
  USING (status = 'active' AND parent_consent_given = true);

-- Young walker availability table
CREATE TABLE public.young_walker_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  young_walker_id UUID NOT NULL REFERENCES public.young_walkers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL, -- 'after_school', 'morning_weekend', 'afternoon_weekend'
  is_available BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT young_walker_availability_unique UNIQUE (young_walker_id, date, time_slot)
);

ALTER TABLE public.young_walker_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents manage child availability"
  ON public.young_walker_availability
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM young_walkers yw 
      WHERE yw.id = young_walker_availability.young_walker_id 
      AND yw.parent_user_id = auth.uid()
    )
  );

CREATE POLICY "Public view young walker availability"
  ON public.young_walker_availability
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM young_walkers yw 
      WHERE yw.id = young_walker_availability.young_walker_id 
      AND yw.status = 'active'
    )
  );

-- Young walker bookings table (separate from main bookings for simpler flow)
CREATE TABLE public.young_walker_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_reference TEXT NOT NULL DEFAULT ('YW-' || upper(SUBSTRING(md5((random())::text) FROM 1 FOR 8))),
  
  -- Walker and client
  young_walker_id UUID NOT NULL REFERENCES public.young_walkers(id),
  client_id UUID NOT NULL REFERENCES public.profiles(id), -- Pet owner
  
  -- Booking details
  walk_date DATE NOT NULL,
  walk_time TIME NOT NULL,
  duration_mins INTEGER NOT NULL DEFAULT 30,
  
  -- Dog info
  dog_name TEXT NOT NULL,
  dog_breed TEXT,
  dog_size TEXT NOT NULL,
  dog_temperament TEXT, -- Must be well-behaved
  dog_photo_url TEXT,
  
  -- Location
  pickup_address TEXT NOT NULL,
  walk_area TEXT, -- Where they'll walk
  
  -- Pricing
  rate NUMERIC NOT NULL,
  platform_fee NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  
  -- Client checklist acknowledgments
  client_confirmed_dog_temperament BOOLEAN NOT NULL DEFAULT false,
  client_confirmed_safety_guidelines BOOLEAN NOT NULL DEFAULT false,
  
  -- Completion
  walk_completed_at TIMESTAMP WITH TIME ZONE,
  walk_notes TEXT,
  walk_photo_url TEXT,
  
  -- Payment
  payment_status TEXT DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_young_walker_bookings_walker ON public.young_walker_bookings(young_walker_id);
CREATE INDEX idx_young_walker_bookings_client ON public.young_walker_bookings(client_id);
CREATE INDEX idx_young_walker_bookings_date ON public.young_walker_bookings(walk_date);

ALTER TABLE public.young_walker_bookings ENABLE ROW LEVEL SECURITY;

-- Parents can view their child's bookings
CREATE POLICY "Parents view child walker bookings"
  ON public.young_walker_bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM young_walkers yw 
      WHERE yw.id = young_walker_bookings.young_walker_id 
      AND yw.parent_user_id = auth.uid()
    )
  );

-- Clients can view/manage their bookings
CREATE POLICY "Clients view their young walker bookings"
  ON public.young_walker_bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = young_walker_bookings.client_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Clients create young walker bookings"
  ON public.young_walker_bookings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = young_walker_bookings.client_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Clients update their young walker bookings"
  ON public.young_walker_bookings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = young_walker_bookings.client_id 
      AND p.user_id = auth.uid()
    )
  );

-- Admins can manage all
CREATE POLICY "Admins manage young walker bookings"
  ON public.young_walker_bookings
  FOR ALL
  USING (is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_young_walkers_updated_at
  BEFORE UPDATE ON public.young_walkers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_young_walker_bookings_updated_at
  BEFORE UPDATE ON public.young_walker_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add young_walker flag to profiles table for easy identification
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_young_walker BOOLEAN DEFAULT false;

-- Function to calculate age from date of birth (for application logic)
CREATE OR REPLACE FUNCTION public.get_young_walker_age(dob DATE)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER - EXTRACT(YEAR FROM dob)::INTEGER
$$;