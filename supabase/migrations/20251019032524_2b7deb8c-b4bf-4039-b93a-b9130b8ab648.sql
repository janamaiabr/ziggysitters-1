-- Add dog walking service for all sitters who don't have it
-- Using a reasonable default rate of $25/hour

INSERT INTO sitter_services (
  sitter_id,
  service_type,
  hourly_rate,
  is_offered,
  accepted_pet_species,
  accepted_pet_sizes,
  max_pets,
  experience_years,
  allows_senior_pets,
  allows_puppies,
  has_fenced_yard,
  description
)
SELECT 
  p.id,
  'dog_walking',
  25.00,
  true,
  ARRAY['dog']::pet_species[],
  ARRAY['small', 'medium', 'large']::pet_size[],
  3,
  1,
  true,
  true,
  false,
  'Professional dog walking service'
FROM profiles p
WHERE p.role = 'pet_sitter'
  AND NOT EXISTS (
    SELECT 1 FROM sitter_services ss 
    WHERE ss.sitter_id = p.id 
    AND ss.service_type = 'dog_walking'
  );