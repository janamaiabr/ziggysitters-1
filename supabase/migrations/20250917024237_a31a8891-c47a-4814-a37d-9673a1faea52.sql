-- Add the missing "pet_sitting_owners_home" service with proper enum casting
INSERT INTO sitter_services (
  sitter_id,
  service_type,
  is_offered,
  daily_rate,
  overnight_rate,
  max_pets,
  accepted_pet_species,
  accepted_pet_sizes,
  has_fenced_yard,
  allows_puppies,
  allows_senior_pets,
  experience_years,
  description
) VALUES (
  'edc3044b-fa5a-4314-8449-dae3a65bfd9a',
  'pet_sitting_owners_home',
  true,
  50.00,
  40.00,
  3,
  ARRAY['dog'::pet_species, 'cat'::pet_species, 'bird'::pet_species, 'rabbit'::pet_species, 'fish'::pet_species],
  ARRAY['small'::pet_size, 'medium'::pet_size, 'large'::pet_size, 'extra_large'::pet_size],
  true,
  true,
  true,
  2,
  'Professional pet sitting in your home'
);