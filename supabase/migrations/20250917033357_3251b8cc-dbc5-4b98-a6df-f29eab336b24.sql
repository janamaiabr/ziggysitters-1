-- Properly fix the security definer view issue
-- Drop the view completely and recreate with proper ownership

DROP VIEW IF EXISTS public.public_sitter_profiles CASCADE;

-- Create the view with explicit ownership to avoid SECURITY DEFINER
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

-- Ensure proper permissions and ownership
ALTER VIEW public.public_sitter_profiles OWNER TO authenticator;