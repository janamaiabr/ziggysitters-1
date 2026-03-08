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
