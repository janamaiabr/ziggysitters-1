-- Add the missing "pet_sitting_owners_home" service for the user
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
  50.00, -- Default daily rate
  40.00, -- Default overnight rate  
  3,
  ARRAY['dog', 'cat', 'bird', 'rabbit', 'fish'],
  ARRAY['small', 'medium', 'large', 'extra_large'],
  true,
  true,
  true,
  2,
  'Professional pet sitting in your home'
);