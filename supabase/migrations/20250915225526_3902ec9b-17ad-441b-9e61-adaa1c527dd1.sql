-- Fix security definer view issue
-- Remove the security definer property and recreate as a normal view
DROP VIEW IF EXISTS public.public_sitter_profiles;

CREATE VIEW public.public_sitter_profiles AS
SELECT 
  id,
  first_name,
  bio,
  city,
  rating,
  total_reviews,
  avatar_url,
  response_rate,
  role,
  created_at
FROM public.profiles
WHERE role = 'pet_sitter'::user_role 
  AND is_verified = true;

-- Grant public access to this safe view
GRANT SELECT ON public.public_sitter_profiles TO anon;
GRANT SELECT ON public.public_sitter_profiles TO authenticated;