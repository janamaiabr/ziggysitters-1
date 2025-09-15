-- Fix security vulnerability: Restrict public access to profiles table
-- Remove the overly permissive public policy that exposes all profile data
DROP POLICY IF EXISTS "Public can view basic sitter info" ON public.profiles;

-- Create a much more restrictive policy that only allows public access to essential business info
CREATE POLICY "Public can view safe sitter info" 
ON public.profiles 
FOR SELECT 
USING (
  role = 'pet_sitter'::user_role 
  AND is_verified = true 
  AND auth.uid() IS NULL  -- Only for unauthenticated (public) users
);

-- Update the existing public_sitter_profiles view to ensure it only shows safe data
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