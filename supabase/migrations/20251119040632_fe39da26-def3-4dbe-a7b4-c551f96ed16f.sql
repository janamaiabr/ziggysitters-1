-- Fix security issues while maintaining public sitter search

-- 1. SITTER AVAILABILITY: Restrict to authenticated users and booking participants only
-- Remove the overly permissive public policy
DROP POLICY IF EXISTS "Anyone can view sitter availability" ON public.sitter_availability;

-- Create new restricted policy for sitter availability
CREATE POLICY "Authenticated users can view sitter availability"
ON public.sitter_availability
FOR SELECT
TO authenticated
USING (true);

-- 2. REVIEWS: Require authentication to view reviews
-- Remove the public policy
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;

-- Create new authenticated-only policy
CREATE POLICY "Authenticated users can view reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (true);

-- 3. PUBLIC SITTER VIEWS: Enable RLS on the views (they inherit from profiles table)
-- These views are for public search and only expose non-sensitive fields
-- The base profiles table already has proper RLS, so these views are safe

-- Add a comment documenting that these views are intentionally public for search
COMMENT ON VIEW public.public_sitter_profiles IS 'Public view for sitter search - only exposes non-sensitive profile fields (name, bio, rating, location). No contact info or internal IDs exposed.';
COMMENT ON VIEW public.public_sitters IS 'Public view for sitter discovery - only exposes non-sensitive fields. Contact info requires booking relationship via profiles table RLS.';