-- Fix security definer view warning by enabling security_invoker mode
-- This ensures the view respects RLS policies and uses the calling user's permissions

DROP VIEW IF EXISTS public.public_sitter_profiles;

CREATE VIEW public.public_sitter_profiles 
WITH (security_invoker=on)
AS
SELECT 
  id,
  first_name,
  SUBSTRING(last_name, 1, 1) || '.' as last_name,
  suburb,
  city,
  bio,
  avatar_url,
  rating,
  total_reviews,
  is_verified,
  role,
  created_at,
  response_rate
FROM public.profiles
WHERE role = 'pet_sitter' AND is_verified = true;

-- Re-grant access to the view
GRANT SELECT ON public.public_sitter_profiles TO anon, authenticated;