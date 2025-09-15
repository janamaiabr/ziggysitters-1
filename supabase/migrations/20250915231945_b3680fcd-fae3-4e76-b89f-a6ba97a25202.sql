-- Fix the security vulnerability: Remove anonymous access to sensitive profile data
-- Drop the overly permissive policy that exposes sensitive personal information
DROP POLICY IF EXISTS "Public can view safe sitter info" ON public.profiles;

-- Create a more restrictive policy that completely blocks anonymous access to profiles table
-- Anonymous users should only access the safe public_sitter_profiles view instead
CREATE POLICY "Profiles are private" 
ON public.profiles 
FOR SELECT 
USING (
  -- Only authenticated users can access profiles directly
  auth.uid() IS NOT NULL AND (
    -- Users can see their own profile
    auth.uid() = user_id 
    -- OR users with confirmed bookings can see contact info via the existing policy
    OR can_access_sitter_contact(id)
  )
);

-- Ensure the public_sitter_profiles view only shows safe information
-- (This view was already created securely in previous migration)
-- Verify it only exposes: id, first_name, bio, city, rating, total_reviews, avatar_url, response_rate, role, created_at

-- Make sure anonymous users can still access the safe view
GRANT SELECT ON public.public_sitter_profiles TO anon;
GRANT SELECT ON public.public_sitter_profiles TO authenticated;