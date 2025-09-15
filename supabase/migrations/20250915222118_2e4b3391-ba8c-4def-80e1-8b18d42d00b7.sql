-- Fix security definer view issue by recreating the view with security_invoker = true
-- This ensures the view respects RLS policies of the querying user, not the view creator

-- Drop and recreate the view with proper security settings
DROP VIEW IF EXISTS public.public_sitter_profiles;

-- Create a secure public view for sitter discovery with security_invoker = true
CREATE VIEW public.public_sitter_profiles
WITH (security_invoker = true) AS
SELECT 
  id,
  first_name,
  bio,
  city, -- General city is ok, but not full address
  avatar_url,
  rating,
  total_reviews,
  response_rate,
  created_at,
  role
FROM public.profiles 
WHERE role = 'pet_sitter' 
  AND is_verified = true;

-- Grant public read access to the secure view
GRANT SELECT ON public.public_sitter_profiles TO anon, authenticated;