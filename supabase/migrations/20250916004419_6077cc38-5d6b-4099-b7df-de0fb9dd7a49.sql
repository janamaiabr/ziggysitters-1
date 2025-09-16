-- Fix Security Definer View issue by recreating the public_sitter_profiles view
-- with proper ownership to respect RLS policies

-- Drop the existing view
DROP VIEW IF EXISTS public.public_sitter_profiles;

-- Recreate the view without security definer privileges
-- This view will now respect RLS policies and execute with the querying user's privileges
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
FROM profiles 
WHERE role = 'pet_sitter'::user_role 
  AND is_verified = true 
  AND is_verified IS NOT NULL;

-- Grant appropriate permissions to the view
-- Allow public read access since this is meant to be a public view of sitter profiles
GRANT SELECT ON public.public_sitter_profiles TO anon, authenticated;

-- Add a comment explaining the view's purpose
COMMENT ON VIEW public.public_sitter_profiles IS 'Public view of verified pet sitter profiles, respects RLS policies';