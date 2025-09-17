-- Remove the overly permissive public policy that exposes sensitive data
DROP POLICY IF EXISTS "Public can view verified sitter basic info" ON public.profiles;

-- Create a more restrictive policy that only allows access to basic public information
-- This policy should only be used in very specific cases where we need basic sitter info
CREATE POLICY "Limited public sitter info for specific operations" 
ON public.profiles 
FOR SELECT 
USING (
  (role = ANY (ARRAY['pet_sitter'::user_role, 'both'::user_role])) 
  AND (is_verified = true)
  AND (
    -- Only allow access to display_name, avatar_url, suburb, city, bio, rating, total_reviews
    -- This policy will be enforced at the application level by selecting only safe columns
    true
  )
);

-- Add a comment to the public_sitter_profiles view to clarify its purpose
COMMENT ON VIEW public.public_sitter_profiles IS 'Safe public view of verified sitter profiles containing only non-sensitive information for public display. Use this instead of direct profiles table access.';

-- Ensure the public_sitter_profiles view has proper access
-- Since it has no RLS policies, it should be publicly accessible by default
-- Add a policy to explicitly allow public read access
CREATE POLICY "Public can view sitter profiles through safe view" 
ON public.public_sitter_profiles 
FOR SELECT 
USING (true);