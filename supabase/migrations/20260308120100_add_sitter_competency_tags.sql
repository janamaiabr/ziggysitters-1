-- Add competency tags and vetting fields to sitter profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS competency_tags text[] DEFAULT '{}';
-- tags: medication_admin, first_aid_certified, senior_pet_experience, anxiety_specialist, post_surgical_care, diabetic_pet_care, mobility_assistance

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS police_check_status text 
  CHECK (police_check_status IN ('not_submitted', 'pending', 'verified', 'expired')) 
  DEFAULT 'not_submitted';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS police_check_date date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_visit_completed boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_visit_date date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_visit_notes text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_source text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS references_count integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interview_completed boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interview_notes text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interview_date date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vetting_status text 
  CHECK (vetting_status IN ('pending', 'in_progress', 'approved', 'rejected')) 
  DEFAULT 'pending';
