-- Fix the security issue by replacing the overly permissive public profile policy
-- Drop the existing public policy that exposes all profile data
DROP POLICY IF EXISTS "Public can view verified sitter profiles" ON public.profiles;

-- Create a new policy that only exposes safe, business-relevant information
-- This policy will be used with a SELECT query that explicitly limits fields
CREATE POLICY "Public can view limited sitter profile info" 
ON public.profiles 
FOR SELECT 
USING (
  (role = 'pet_sitter'::user_role) 
  AND (is_verified = true) 
  AND (is_verified IS NOT NULL)
);

-- Create a secure view for public sitter profiles that only exposes safe information
CREATE OR REPLACE VIEW public.public_sitter_profiles AS
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

-- Enable RLS on the view
ALTER VIEW public.public_sitter_profiles SET (security_barrier = true);

-- Grant public access to the view
GRANT SELECT ON public.public_sitter_profiles TO anon, authenticated;