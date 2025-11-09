-- Add is_test_account column to profiles
ALTER TABLE public.profiles 
ADD COLUMN is_test_account boolean NOT NULL DEFAULT false;

-- Mark janamaia@gmail.com as a test account
UPDATE public.profiles 
SET is_test_account = true 
WHERE email = 'janamaia@gmail.com';

-- Recreate public_sitters view to exclude test accounts
DROP VIEW IF EXISTS public.public_sitters;
CREATE VIEW public.public_sitters AS
SELECT 
  id,
  first_name,
  last_name,
  suburb,
  city,
  bio,
  avatar_url,
  rating,
  response_rate,
  total_reviews,
  role,
  is_verified,
  onboarding_completed,
  created_at
FROM public.profiles
WHERE role = 'pet_sitter'
  AND is_verified = true
  AND onboarding_completed = true
  AND is_test_account = false;

-- Recreate public_sitter_profiles view to exclude test accounts
DROP VIEW IF EXISTS public.public_sitter_profiles;
CREATE VIEW public.public_sitter_profiles AS
SELECT 
  id,
  first_name,
  last_name,
  suburb,
  city,
  bio,
  avatar_url,
  rating,
  response_rate,
  total_reviews,
  role,
  is_verified,
  created_at
FROM public.profiles
WHERE role = 'pet_sitter'
  AND is_verified = true
  AND onboarding_completed = true
  AND is_test_account = false;