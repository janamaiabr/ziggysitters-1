-- Fix the security definer view issue by dropping and recreating without security_barrier
DROP VIEW IF EXISTS public.public_sitter_profiles;

-- Create a standard view for public sitter profiles that only exposes safe information
CREATE VIEW public.public_sitter_profiles AS
SELECT 
  id,
  first_name,
  last_name,
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
FROM public.profiles
WHERE role = 'pet_sitter'::user_role 
  AND is_verified = true;

-- Grant public access to the view (this is safe since the view only contains non-sensitive data)
GRANT SELECT ON public.public_sitter_profiles TO anon, authenticated;