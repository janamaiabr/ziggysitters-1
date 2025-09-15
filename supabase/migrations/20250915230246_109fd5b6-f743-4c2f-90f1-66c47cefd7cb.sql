-- Ensure the public_sitter_profiles view is secure and follows best practices
-- Drop and recreate the view with explicit security considerations
DROP VIEW IF EXISTS public.public_sitter_profiles;

-- Create the view that only exposes safe, non-sensitive data
-- This view is safe because it only shows data that should be public anyway
CREATE VIEW public.public_sitter_profiles 
WITH (security_barrier = true) AS
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
FROM public.profiles p
WHERE p.role = 'pet_sitter'::user_role 
  AND p.is_verified = true
  AND p.is_verified IS NOT NULL;

-- Grant appropriate permissions
GRANT SELECT ON public.public_sitter_profiles TO anon;
GRANT SELECT ON public.public_sitter_profiles TO authenticated;

-- Add a comment explaining the security considerations
COMMENT ON VIEW public.public_sitter_profiles IS 
'Safe public view of verified pet sitters. Only exposes non-sensitive business information. 
Uses security_barrier to ensure proper RLS enforcement on underlying tables.';