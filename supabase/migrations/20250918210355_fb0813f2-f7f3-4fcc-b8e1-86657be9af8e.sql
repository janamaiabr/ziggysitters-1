-- Complete onboarding for existing users and create test sitter profiles
UPDATE profiles 
SET 
  phone = '+64 21 123 4567',
  address = '123 Queen Street',
  suburb = 'Auckland Central', 
  city = 'Auckland',
  postal_code = '1010',
  onboarding_completed = true
WHERE phone IS NULL AND address IS NULL AND suburb IS NULL;

-- Insert test sitter profiles with valid user_ids from existing users
INSERT INTO profiles (
  user_id, first_name, last_name, email, phone, bio, address, suburb, city, postal_code,
  role, onboarding_completed, is_verified, verification_status, background_check_verified, 
  rating, total_reviews, response_rate, latitude, longitude, created_at, updated_at
)
SELECT 
  user_id || '-test-1', 'Lisa', 'Anderson', 'lisa.anderson@email.co.nz', '+64 21 567 8901', 
  'Experienced pet sitter with 5+ years caring for dogs and cats. I have a fenced backyard and flexible schedule.', 
  '12 Jervois Road', 'Herne Bay', 'Auckland', '1011', 'pet_sitter', true, true, 'verified', true, 
  4.9, 45, 98, -36.8428, 174.7398, now() - interval '45 days', now()
FROM profiles WHERE role = 'pet_owner' LIMIT 1;

INSERT INTO profiles (
  user_id, first_name, last_name, email, phone, bio, address, suburb, city, postal_code,
  role, onboarding_completed, is_verified, verification_status, background_check_verified, 
  rating, total_reviews, response_rate, latitude, longitude, created_at, updated_at
)
SELECT 
  user_id || '-test-2', 'David', 'Smith', 'david.smith@email.co.nz', '+64 21 678 9012', 
  'Retired vet nurse who loves spending time with pets. Specialise in senior pet care and medication administration.', 
  '88 Ponsonby Road', 'Ponsonby', 'Auckland', '1011', 'pet_sitter', true, true, 'verified', true, 
  4.8, 32, 95, -36.8506, 174.7398, now() - interval '60 days', now()
FROM profiles WHERE role = 'pet_owner' LIMIT 1;

INSERT INTO profiles (
  user_id, first_name, last_name, email, phone, bio, address, suburb, city, postal_code,
  role, onboarding_completed, is_verified, verification_status, background_check_verified, 
  rating, total_reviews, response_rate, latitude, longitude, created_at, updated_at
)
SELECT 
  user_id || '-test-3', 'Sophie', 'Davis', 'sophie.davis@email.co.nz', '+64 21 901 2345', 
  'Professional dog walker and pet sitter. I offer daily walks, drop-in visits, and overnight stays.', 
  '156 Great North Road', 'Grey Lynn', 'Auckland', '1021', 'pet_sitter', true, true, 'verified', true, 
  4.9, 67, 97, -36.8706, 174.7273, now() - interval '90 days', now()
FROM profiles WHERE role = 'pet_owner' LIMIT 1;

-- Insert services for the test sitters
INSERT INTO sitter_services (
  sitter_id, service_type, hourly_rate, daily_rate, overnight_rate, 
  is_offered, description, max_pets, has_fenced_yard, 
  accepted_pet_species, accepted_pet_sizes, allows_puppies, allows_senior_pets,
  experience_years, created_at, updated_at
)
SELECT 
  p.id, 'dog_walking'::service_type, 25.00, NULL, NULL, true,
  'Professional dog walking service with flexible scheduling', 4, true,
  ARRAY['dog']::pet_species[], ARRAY['small', 'medium', 'large']::pet_size[], true, true,
  5, now(), now()
FROM profiles p WHERE p.first_name = 'Lisa' AND p.email = 'lisa.anderson@email.co.nz'

UNION ALL

SELECT 
  p.id, 'house_sitting'::service_type, NULL, 75.00, 95.00, true,
  'Pet sitting in your home - your pets stay comfortable in familiar surroundings', 5, false,
  ARRAY['dog', 'cat']::pet_species[], ARRAY['small', 'medium', 'large']::pet_size[], false, true,
  5, now(), now()
FROM profiles p WHERE p.first_name = 'Lisa' AND p.email = 'lisa.anderson@email.co.nz'

UNION ALL

SELECT 
  p.id, 'pet_sitting'::service_type, NULL, 70.00, 90.00, true,
  'Pet sitting in my home - your pets will be part of our family', 3, true,
  ARRAY['dog', 'cat']::pet_species[], ARRAY['small', 'medium', 'large']::pet_size[], false, true,
  5, now(), now()
FROM profiles p WHERE p.first_name = 'Lisa' AND p.email = 'lisa.anderson@email.co.nz'

UNION ALL

SELECT 
  p.id, 'drop_in_visits'::service_type, 35.00, NULL, NULL, true,
  'Drop-in visits to check on your pets, feed them, and provide companionship', 6, false,
  ARRAY['dog', 'cat', 'rabbit', 'bird']::pet_species[], ARRAY['small', 'medium', 'large']::pet_size[], true, true,
  5, now(), now()
FROM profiles p WHERE p.first_name = 'Lisa' AND p.email = 'lisa.anderson@email.co.nz'

UNION ALL

SELECT 
  p.id, 'dog_walking'::service_type, 30.00, NULL, NULL, true,
  'Professional dog walking service with veterinary knowledge', 2, false,
  ARRAY['dog']::pet_species[], ARRAY['small', 'medium', 'large']::pet_size[], true, true,
  15, now(), now()
FROM profiles p WHERE p.first_name = 'David' AND p.email = 'david.smith@email.co.nz'

UNION ALL

SELECT 
  p.id, 'house_sitting'::service_type, NULL, 85.00, 110.00, true,
  'Expert pet sitting in your home with medical care if needed', 3, false,
  ARRAY['dog', 'cat']::pet_species[], ARRAY['small', 'medium', 'large']::pet_size[], false, true,
  15, now(), now()
FROM profiles p WHERE p.first_name = 'David' AND p.email = 'david.smith@email.co.nz'

UNION ALL

SELECT 
  p.id, 'drop_in_visits'::service_type, 40.00, NULL, NULL, true,
  'Professional drop-in visits with health monitoring', 4, false,
  ARRAY['dog', 'cat', 'rabbit', 'bird']::pet_species[], ARRAY['small', 'medium', 'large']::pet_size[], true, true,
  15, now(), now()
FROM profiles p WHERE p.first_name = 'David' AND p.email = 'david.smith@email.co.nz'

UNION ALL

SELECT 
  p.id, 'dog_walking'::service_type, 28.00, NULL, NULL, true,
  'Energetic dog walking and exercise sessions', 4, false,
  ARRAY['dog']::pet_species[], ARRAY['small', 'medium', 'large']::pet_size[], true, true,
  8, now(), now()
FROM profiles p WHERE p.first_name = 'Sophie' AND p.email = 'sophie.davis@email.co.nz'

UNION ALL

SELECT 
  p.id, 'house_sitting'::service_type, NULL, 80.00, 100.00, true,
  'Comprehensive house and pet sitting services', 5, false,
  ARRAY['dog', 'cat']::pet_species[], ARRAY['small', 'medium', 'large']::pet_size[], false, true,
  8, now(), now()
FROM profiles p WHERE p.first_name = 'Sophie' AND p.email = 'sophie.davis@email.co.nz'

UNION ALL

SELECT 
  p.id, 'drop_in_visits'::service_type, 38.00, NULL, NULL, true,
  'Regular check-ins and care for your pets', 6, false,
  ARRAY['dog', 'cat', 'rabbit', 'bird']::pet_species[], ARRAY['small', 'medium', 'large']::pet_size[], true, true,
  8, now(), now()
FROM profiles p WHERE p.first_name = 'Sophie' AND p.email = 'sophie.davis@email.co.nz';