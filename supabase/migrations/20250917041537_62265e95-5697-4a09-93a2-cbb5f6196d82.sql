-- Fix the security definer view issue by using a regular view
-- and add additional frontend filtering as backup

-- Drop and recreate the view as a regular view (not security definer)
DROP VIEW IF EXISTS public_sitter_profiles;

CREATE VIEW public_sitter_profiles AS
SELECT 
  id,
  CONCAT(first_name, ' ', SUBSTRING(last_name, 1, 1), '.') as display_name,
  role,
  suburb,
  city,
  bio,
  avatar_url,
  is_verified,
  rating,
  total_reviews,
  response_rate,
  background_check_verified,
  verification_status,
  created_at
FROM profiles
WHERE role IN ('pet_sitter', 'both') 
  AND role != 'admin'
  AND email != 'admin@ziggysitters.com';