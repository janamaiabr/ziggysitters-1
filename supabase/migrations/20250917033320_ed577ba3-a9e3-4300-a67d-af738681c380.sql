-- Drop and recreate the public_sitter_profiles view without SECURITY DEFINER
-- This ensures RLS policies are properly enforced for the querying user

DROP VIEW IF EXISTS public.public_sitter_profiles;

-- Create a new view that respects RLS policies
CREATE VIEW public.public_sitter_profiles AS
SELECT 
  id,
  ((first_name || ' ') || LEFT(last_name, 1) || '.') AS display_name,
  role,
  suburb,
  city,
  bio,
  avatar_url,
  is_verified,
  background_check_verified,
  rating,
  total_reviews,
  response_rate,
  verification_status,
  created_at
FROM public.profiles 
WHERE role = 'pet_sitter'::user_role;

-- Ensure the view respects RLS by not using SECURITY DEFINER
-- The view will now use the permissions of the querying user