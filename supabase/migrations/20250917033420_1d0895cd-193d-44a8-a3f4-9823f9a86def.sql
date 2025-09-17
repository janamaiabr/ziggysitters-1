-- Fix the security definer view by recreating it with security_invoker
DROP VIEW IF EXISTS public.public_sitter_profiles CASCADE;

-- Create the view with security_invoker to ensure it uses the querying user's permissions
CREATE VIEW public.public_sitter_profiles 
WITH (security_invoker=true)
AS
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