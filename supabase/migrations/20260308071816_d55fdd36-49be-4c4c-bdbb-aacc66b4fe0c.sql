
-- Migration 1: Pet Health Fields
ALTER TABLE pets ADD COLUMN IF NOT EXISTS is_senior boolean DEFAULT false;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS health_conditions text[] DEFAULT '{}';
ALTER TABLE pets ADD COLUMN IF NOT EXISTS medications_detail jsonb DEFAULT '[]';
ALTER TABLE pets ADD COLUMN IF NOT EXISTS special_needs text;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS emergency_vet_name text;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS emergency_vet_phone text;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS mobility_level text;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS dietary_requirements text;

-- Add check constraint for mobility_level
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pets_mobility_level_check'
  ) THEN
    ALTER TABLE pets ADD CONSTRAINT pets_mobility_level_check 
      CHECK (mobility_level IS NULL OR mobility_level IN ('full', 'limited', 'assisted', 'minimal'));
  END IF;
END $$;

-- Migration 2: Sitter Competency & Vetting
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS competency_tags text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS police_check_status text DEFAULT 'not_submitted';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS police_check_date date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_visit_completed boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_visit_date date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_visit_notes text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_source text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS references_count integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interview_completed boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interview_notes text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interview_date date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vetting_status text DEFAULT 'pending';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_police_check_status_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_police_check_status_check 
      CHECK (police_check_status IS NULL OR police_check_status IN ('not_submitted', 'pending', 'verified', 'expired'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_vetting_status_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_vetting_status_check 
      CHECK (vetting_status IS NULL OR vetting_status IN ('pending', 'in_progress', 'approved', 'rejected'));
  END IF;
END $$;

-- Migration 3: Vet Clinic Contacts
CREATE TABLE IF NOT EXISTS vet_clinic_contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_name text NOT NULL,
  contact_person text,
  phone text,
  email text,
  address text,
  suburb text,
  first_visit_date date,
  last_contact_date date,
  next_follow_up_date date,
  referral_count integer DEFAULT 0,
  relationship_status text CHECK (relationship_status IN ('prospect', 'contacted', 'met', 'active_referrer', 'inactive')) DEFAULT 'prospect',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vet_clinic_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage vet clinics" ON vet_clinic_contacts
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Migration 4: Post-Booking Follow-ups
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS follow_up_sent boolean DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS follow_up_sent_at timestamptz;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS follow_up_response text;

CREATE TABLE IF NOT EXISTS booking_followups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  feedback text,
  sitter_name text,
  pet_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE booking_followups ENABLE ROW LEVEL SECURITY;

-- Pet owners can insert and view their own follow-ups
CREATE POLICY "Owners can insert their own followups" ON booking_followups
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN profiles p ON p.id = b.owner_id
      WHERE b.id = booking_followups.booking_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can view their own followups" ON booking_followups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN profiles p ON p.id = b.owner_id
      WHERE b.id = booking_followups.booking_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all followups" ON booking_followups
  FOR SELECT USING (is_admin());
