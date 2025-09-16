-- Fix Security Definer View issue by completely recreating the view
-- The current view has elevated privileges that bypass RLS policies

-- Drop the existing problematic view
DROP VIEW IF EXISTS public.public_sitter_profiles CASCADE;

-- Create a new view that will execute with proper security context
-- Using a function approach that respects RLS policies
CREATE OR REPLACE FUNCTION public.get_public_sitter_profiles()
RETURNS TABLE (
  id uuid,
  first_name text,
  bio text,
  city text,
  rating numeric,
  total_reviews integer,
  avatar_url text,
  response_rate integer,
  role user_role,
  created_at timestamp with time zone
)
LANGUAGE sql
SECURITY INVOKER  -- This ensures it runs with the caller's privileges, not elevated ones
STABLE
AS $$
  SELECT 
    p.id,
    p.first_name,
    p.bio,
    p.city,
    p.rating,
    p.total_reviews,
    p.avatar_url,
    p.response_rate,
    p.role,
    p.created_at
  FROM profiles p
  WHERE p.role = 'pet_sitter'::user_role 
    AND p.is_verified = true 
    AND p.is_verified IS NOT NULL;
$$;

-- Create a new view based on the function
CREATE VIEW public.public_sitter_profiles AS
SELECT * FROM public.get_public_sitter_profiles();

-- Grant appropriate permissions
GRANT SELECT ON public.public_sitter_profiles TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_sitter_profiles() TO anon, authenticated;

-- Add comment explaining the security fix
COMMENT ON VIEW public.public_sitter_profiles IS 'Secure view of verified pet sitter profiles that respects RLS policies';
COMMENT ON FUNCTION public.get_public_sitter_profiles() IS 'Security invoker function that returns public sitter profiles while respecting RLS';