-- Fix admin user role and update public_sitter_profiles view to exclude admins

-- First, fix the admin user's role
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@ziggysitters.com';

-- Drop the existing view
DROP VIEW IF EXISTS public_sitter_profiles;

-- Recreate the view excluding admin users
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