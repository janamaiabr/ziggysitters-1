-- Drop and recreate the public_sitter_profiles view to fix security definer issue
-- The issue is that views owned by postgres role can bypass RLS policies

-- First drop the existing view
DROP VIEW IF EXISTS public.public_sitter_profiles;

-- Recreate the view with explicit SECURITY INVOKER (default behavior)
-- This ensures the view uses the permissions of the querying user, not the view creator
CREATE VIEW public.public_sitter_profiles 
WITH (security_invoker = true)
AS 
SELECT 
  id,
  concat(first_name, ' ', substring(last_name, 1, 1), '.') AS display_name,
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
FROM profiles
WHERE role = ANY (ARRAY['pet_sitter'::user_role, 'both'::user_role])
  AND role <> 'admin'::user_role
  AND email <> 'admin@ziggysitters.com';

-- Ensure the view is publicly readable (since it only contains safe data)
-- This is the intended behavior for this public view
GRANT SELECT ON public.public_sitter_profiles TO public;