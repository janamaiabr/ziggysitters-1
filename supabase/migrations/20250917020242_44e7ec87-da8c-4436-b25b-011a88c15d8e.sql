-- Remove the overly permissive public policy that exposes sensitive data
DROP POLICY IF EXISTS "Public can view verified sitter basic info" ON public.profiles;

-- The public_sitter_profiles view is already safe and contains only non-sensitive data
-- It includes: id, display_name, role, suburb, city, bio, avatar_url, is_verified, 
-- rating, total_reviews, response_rate, background_check_verified, verification_status, created_at
-- It does NOT include: email, phone, address, postal_code, first_name, last_name

-- Add a comment to the public_sitter_profiles view to clarify its purpose
COMMENT ON VIEW public.public_sitter_profiles IS 'Safe public view of verified sitter profiles containing only non-sensitive information for public display. Use this instead of direct profiles table access for public sitter information.';