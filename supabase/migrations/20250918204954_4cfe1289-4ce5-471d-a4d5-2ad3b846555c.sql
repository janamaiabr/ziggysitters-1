-- Insert dummy data for testing

-- Insert dummy pet owners
INSERT INTO profiles (
  user_id, first_name, last_name, email, phone, bio, address, suburb, city, postal_code,
  role, onboarding_completed, is_verified, verification_status, rating, total_reviews, 
  latitude, longitude, created_at, updated_at
) VALUES 
  (gen_random_uuid(), 'Sarah', 'Johnson', 'sarah.johnson@email.co.nz', '+64 21 123 4567', 'Love spending time with my golden retriever Max!', '123 Queen Street', 'Ponsonby', 'Auckland', '1011', 'pet_owner', true, false, 'pending', 4.8, 12, -36.8485, 174.7633, now() - interval '30 days', now()),
  (gen_random_uuid(), 'Mike', 'Chen', 'mike.chen@email.co.nz', '+64 21 234 5678', 'Cat dad to two rescue cats', '456 Dominion Road', 'Mount Eden', 'Auckland', '1024', 'pet_owner', true, false, 'pending', 4.5, 8, -36.8706, 174.7505, now() - interval '20 days', now()),
  (gen_random_uuid(), 'Emma', 'Taylor', 'emma.taylor@email.co.nz', '+64 21 345 6789', 'First-time dog owner, looking for experienced sitters', '789 Remuera Road', 'Remuera', 'Auckland', '1050', 'pet_owner', true, false, 'pending', 5.0, 3, -36.8707, 174.7762, now() - interval '10 days', now()),
  (gen_random_uuid(), 'James', 'Williams', 'james.williams@email.co.nz', '+64 21 456 7890', 'Busy professional with a lovely labrador', '321 Parnell Road', 'Parnell', 'Auckland', '1052', 'pet_owner', true, false, 'pending', 4.2, 6, -36.8590, 174.7772, now() - interval '15 days', now());

-- Insert dummy pet sitters
INSERT INTO profiles (
  user_id, first_name, last_name, email, phone, bio, address, suburb, city, postal_code,
  role, onboarding_completed, is_verified, verification_status, background_check_verified, 
  rating, total_reviews, response_rate, latitude, longitude, created_at, updated_at
) VALUES 
  (gen_random_uuid(), 'Lisa', 'Anderson', 'lisa.anderson@email.co.nz', '+64 21 567 8901', 'Experienced pet sitter with 5+ years caring for dogs and cats. I have a fenced backyard and flexible schedule.', '12 Jervois Road', 'Herne Bay', 'Auckland', '1011', 'pet_sitter', true, true, 'verified', true, 4.9, 45, 98, -36.8428, 174.7398, now() - interval '45 days', now()),
  (gen_random_uuid(), 'David', 'Smith', 'david.smith@email.co.nz', '+64 21 678 9012', 'Retired vet nurse who loves spending time with pets. Specialise in senior pet care and medication administration.', '88 Ponsonby Road', 'Ponsonby', 'Auckland', '1011', 'pet_sitter', true, true, 'verified', true, 4.8, 32, 95, -36.8506, 174.7398, now() - interval '60 days', now()),
  (gen_random_uuid(), 'Rachel', 'Brown', 'rachel.brown@email.co.nz', '+64 21 789 0123', 'Work from home mum with two kids who love animals. Great with puppies and energetic dogs!', '45 Richmond Road', 'Grey Lynn', 'Auckland', '1021', 'pet_sitter', true, false, 'pending', false, 4.7, 18, 92, -36.8506, 174.7398, now() - interval '25 days', now()),
  (gen_random_uuid(), 'Tom', 'Wilson', 'tom.wilson@email.co.nz', '+64 21 890 1234', 'University student studying veterinary science. Available weekends and school holidays for pet sitting.', '67 Karangahape Road', 'Auckland Central', 'Auckland', '1010', 'pet_sitter', true, false, 'under_review', false, 4.6, 22, 89, -36.8485, 174.7633, now() - interval '35 days', now()),
  (gen_random_uuid(), 'Sophie', 'Davis', 'sophie.davis@email.co.nz', '+64 21 901 2345', 'Professional dog walker and pet sitter. I offer daily walks, drop-in visits, and overnight stays.', '156 Great North Road', 'Grey Lynn', 'Auckland', '1021', 'pet_sitter', true, true, 'verified', true, 4.9, 67, 97, -36.8706, 174.7273, now() - interval '90 days', now());

-- Insert users with "both" role
INSERT INTO profiles (
  user_id, first_name, last_name, email, phone, bio, address, suburb, city, postal_code,
  role, onboarding_completed, is_verified, verification_status, background_check_verified, 
  rating, total_reviews, response_rate, latitude, longitude, created_at, updated_at
) VALUES 
  (gen_random_uuid(), 'Anna', 'Lee', 'anna.lee@email.co.nz', '+64 21 012 3456', 'Pet owner and experienced sitter. I have two cats and love helping other pet families when they travel.', '234 Mt Eden Road', 'Mount Eden', 'Auckland', '1024', 'both', true, true, 'verified', true, 4.8, 28, 94, -36.8706, 174.7505, now() - interval '50 days', now()),
  (gen_random_uuid(), 'Chris', 'Thompson', 'chris.thompson@email.co.nz', '+64 21 123 0456', 'Dog owner who also provides pet sitting services. I understand the anxiety of leaving your pets and provide regular updates.', '78 New North Road', 'Kingsland', 'Auckland', '1021', 'both', true, false, 'under_review', false, 4.7, 15, 91, -36.8706, 174.7273, now() - interval '40 days', now());

-- Get the profile IDs we just inserted for sitters to create services
WITH sitter_profiles AS (
  SELECT id, first_name, last_name, role FROM profiles 
  WHERE role IN ('pet_sitter', 'both') 
  AND email LIKE '%@email.co.nz'
)

-- Insert sitter services for each sitter
INSERT INTO sitter_services (
  sitter_id, service_type, hourly_rate, daily_rate, overnight_rate, 
  is_offered, description, max_pets, has_fenced_yard, 
  accepted_pet_species, accepted_pet_sizes, allows_puppies, allows_senior_pets,
  experience_years, created_at, updated_at
)
SELECT 
  sp.id,
  'dog_walking'::service_type,
  CASE 
    WHEN sp.first_name = 'Lisa' THEN 25.00
    WHEN sp.first_name = 'David' THEN 30.00
    WHEN sp.first_name = 'Rachel' THEN 20.00
    WHEN sp.first_name = 'Tom' THEN 18.00
    WHEN sp.first_name = 'Sophie' THEN 28.00
    WHEN sp.first_name = 'Anna' THEN 22.00
    ELSE 25.00
  END,
  NULL,
  NULL,
  true,
  'Professional dog walking service with flexible scheduling',
  CASE 
    WHEN sp.first_name IN ('Lisa', 'Sophie') THEN 4
    WHEN sp.first_name = 'David' THEN 2
    ELSE 3
  END,
  CASE 
    WHEN sp.first_name IN ('Lisa', 'Rachel', 'Anna') THEN true
    ELSE false
  END,
  ARRAY['dog']::pet_species[],
  ARRAY['small', 'medium', 'large']::pet_size[],
  true,
  true,
  CASE 
    WHEN sp.first_name = 'David' THEN 15
    WHEN sp.first_name = 'Lisa' THEN 5
    WHEN sp.first_name = 'Sophie' THEN 8
    WHEN sp.first_name = 'Anna' THEN 3
    ELSE 2
  END,
  now(),
  now()
FROM sitter_profiles sp

UNION ALL

SELECT 
  sp.id,
  'house_sitting'::service_type,
  NULL,
  CASE 
    WHEN sp.first_name = 'Lisa' THEN 75.00
    WHEN sp.first_name = 'David' THEN 85.00
    WHEN sp.first_name = 'Rachel' THEN 60.00
    WHEN sp.first_name = 'Sophie' THEN 80.00
    WHEN sp.first_name = 'Anna' THEN 65.00
    ELSE 70.00
  END,
  CASE 
    WHEN sp.first_name = 'Lisa' THEN 95.00
    WHEN sp.first_name = 'David' THEN 110.00
    WHEN sp.first_name = 'Rachel' THEN 80.00
    WHEN sp.first_name = 'Sophie' THEN 100.00
    WHEN sp.first_name = 'Anna' THEN 85.00
    ELSE 90.00
  END,
  true,
  'Pet sitting in your home - your pets stay comfortable in familiar surroundings',
  CASE 
    WHEN sp.first_name IN ('Lisa', 'Sophie') THEN 5
    WHEN sp.first_name = 'David' THEN 3
    ELSE 4
  END,
  false,
  ARRAY['dog', 'cat']::pet_species[],
  ARRAY['small', 'medium', 'large']::pet_size[],
  CASE 
    WHEN sp.first_name IN ('Rachel', 'Anna') THEN true
    ELSE false
  END,
  true,
  CASE 
    WHEN sp.first_name = 'David' THEN 15
    WHEN sp.first_name = 'Lisa' THEN 5
    WHEN sp.first_name = 'Sophie' THEN 8
    WHEN sp.first_name = 'Anna' THEN 3
    ELSE 2
  END,
  now(),
  now()
FROM sitter_profiles sp

UNION ALL

SELECT 
  sp.id,
  'pet_sitting'::service_type,
  NULL,
  CASE 
    WHEN sp.first_name = 'Lisa' THEN 70.00
    WHEN sp.first_name = 'David' THEN 80.00
    WHEN sp.first_name = 'Rachel' THEN 55.00
    WHEN sp.first_name = 'Tom' THEN 50.00
    WHEN sp.first_name = 'Anna' THEN 60.00
    ELSE 65.00
  END,
  CASE 
    WHEN sp.first_name = 'Lisa' THEN 90.00
    WHEN sp.first_name = 'David' THEN 105.00
    WHEN sp.first_name = 'Rachel' THEN 75.00
    WHEN sp.first_name = 'Tom' THEN 70.00
    WHEN sp.first_name = 'Anna' THEN 80.00
    ELSE 85.00
  END,
  CASE 
    WHEN sp.first_name IN ('Lisa', 'David', 'Anna') THEN true
    ELSE false
  END,
  'Pet sitting in my home - your pets will be part of our family',
  CASE 
    WHEN sp.first_name = 'Lisa' THEN 3
    WHEN sp.first_name = 'David' THEN 2
    ELSE 2
  END,
  CASE 
    WHEN sp.first_name IN ('Lisa', 'Rachel', 'Anna') THEN true
    ELSE false
  END,
  ARRAY['dog', 'cat']::pet_species[],
  ARRAY['small', 'medium', 'large']::pet_size[],
  CASE 
    WHEN sp.first_name IN ('Rachel', 'Anna') THEN true
    ELSE false
  END,
  true,
  CASE 
    WHEN sp.first_name = 'David' THEN 15
    WHEN sp.first_name = 'Lisa' THEN 5
    WHEN sp.first_name = 'Sophie' THEN 8
    WHEN sp.first_name = 'Anna' THEN 3
    ELSE 2
  END,
  now(),
  now()
FROM sitter_profiles sp
WHERE sp.first_name IN ('Lisa', 'David', 'Rachel', 'Anna')

UNION ALL

SELECT 
  sp.id,
  'drop_in_visits'::service_type,
  CASE 
    WHEN sp.first_name = 'Lisa' THEN 35.00
    WHEN sp.first_name = 'David' THEN 40.00
    WHEN sp.first_name = 'Rachel' THEN 30.00
    WHEN sp.first_name = 'Tom' THEN 25.00
    WHEN sp.first_name = 'Sophie' THEN 38.00
    WHEN sp.first_name = 'Anna' THEN 32.00
    ELSE 35.00
  END,
  NULL,
  NULL,
  true,
  'Drop-in visits to check on your pets, feed them, and provide companionship',
  CASE 
    WHEN sp.first_name IN ('Lisa', 'Sophie') THEN 6
    ELSE 4
  END,
  false,
  ARRAY['dog', 'cat', 'rabbit', 'bird']::pet_species[],
  ARRAY['small', 'medium', 'large']::pet_size[],
  true,
  true,
  CASE 
    WHEN sp.first_name = 'David' THEN 15
    WHEN sp.first_name = 'Lisa' THEN 5
    WHEN sp.first_name = 'Sophie' THEN 8
    WHEN sp.first_name = 'Anna' THEN 3
    ELSE 2
  END,
  now(),
  now()
FROM sitter_profiles sp;