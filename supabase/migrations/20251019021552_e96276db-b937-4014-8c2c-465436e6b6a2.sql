-- EMERGENCY FIX: Restore sitter services for existing sitters
-- This adds default dog walking service for all sitters who completed onboarding but have no services

-- Insert default dog walking service for sitters with no services
INSERT INTO sitter_services (
  sitter_id,
  service_type,
  hourly_rate,
  daily_rate,
  accepted_pet_species,
  accepted_pet_sizes,
  max_pets,
  experience_years,
  allows_puppies,
  allows_senior_pets,
  has_fenced_yard,
  is_offered,
  description
)
SELECT 
  p.id as sitter_id,
  'dog_walking' as service_type,
  20.00 as hourly_rate,
  NULL as daily_rate,
  ARRAY['dog']::pet_species[] as accepted_pet_species,
  ARRAY['small', 'medium', 'large']::pet_size[] as accepted_pet_sizes,
  2 as max_pets,
  1 as experience_years,
  true as allows_puppies,
  true as allows_senior_pets,
  false as has_fenced_yard,
  true as is_offered,
  'Professional dog walking service' as description
FROM profiles p
WHERE 
  p.role = 'pet_sitter' 
  AND p.onboarding_completed = true
  AND NOT EXISTS (
    SELECT 1 FROM sitter_services ss 
    WHERE ss.sitter_id = p.id AND ss.service_type = 'dog_walking'
  );

-- Insert default pet sitting (owner's home) service
INSERT INTO sitter_services (
  sitter_id,
  service_type,
  hourly_rate,
  daily_rate,
  accepted_pet_species,
  accepted_pet_sizes,
  max_pets,
  experience_years,
  allows_puppies,
  allows_senior_pets,
  has_fenced_yard,
  is_offered,
  description
)
SELECT 
  p.id as sitter_id,
  'pet_sitting_owners_home' as service_type,
  NULL as hourly_rate,
  40.00 as daily_rate,
  ARRAY['dog', 'cat']::pet_species[] as accepted_pet_species,
  ARRAY['small', 'medium', 'large']::pet_size[] as accepted_pet_sizes,
  3 as max_pets,
  1 as experience_years,
  true as allows_puppies,
  true as allows_senior_pets,
  false as has_fenced_yard,
  true as is_offered,
  'Pet sitting in your home' as description
FROM profiles p
WHERE 
  p.role = 'pet_sitter' 
  AND p.onboarding_completed = true
  AND NOT EXISTS (
    SELECT 1 FROM sitter_services ss 
    WHERE ss.sitter_id = p.id AND ss.service_type = 'pet_sitting_owners_home'
  );

-- Insert default drop-in visits service
INSERT INTO sitter_services (
  sitter_id,
  service_type,
  hourly_rate,
  daily_rate,
  accepted_pet_species,
  accepted_pet_sizes,
  max_pets,
  experience_years,
  allows_puppies,
  allows_senior_pets,
  has_fenced_yard,
  is_offered,
  description
)
SELECT 
  p.id as sitter_id,
  'drop_in_visits' as service_type,
  15.00 as hourly_rate,
  NULL as daily_rate,
  ARRAY['dog', 'cat', 'rabbit']::pet_species[] as accepted_pet_species,
  ARRAY['small', 'medium', 'large']::pet_size[] as accepted_pet_sizes,
  3 as max_pets,
  1 as experience_years,
  true as allows_puppies,
  true as allows_senior_pets,
  false as has_fenced_yard,
  true as is_offered,
  'Quick check-in visits for your pets' as description
FROM profiles p
WHERE 
  p.role = 'pet_sitter' 
  AND p.onboarding_completed = true
  AND NOT EXISTS (
    SELECT 1 FROM sitter_services ss 
    WHERE ss.sitter_id = p.id AND ss.service_type = 'drop_in_visits'
  );