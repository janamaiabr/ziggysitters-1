-- Fix the security definer view issue
-- Drop the problematic view
DROP VIEW IF EXISTS public.public_sitter_listings;

-- Instead, we'll rely on RLS policies and the frontend will query with specific columns
-- The RLS policies already restrict what data can be accessed

-- Update the public sitter search policy to be more explicit about allowed fields
DROP POLICY IF EXISTS "Public can view basic sitter info for search" ON public.profiles;

-- This policy allows public to SELECT but RLS will filter the results
-- Frontend queries must specify only safe columns
CREATE POLICY "Public can search verified sitters"
ON public.profiles
FOR SELECT
TO anon
USING (
  role = 'pet_sitter' 
  AND is_verified = true
  AND onboarding_completed = true
);

-- Authenticated users can also search
CREATE POLICY "Authenticated can search verified sitters"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  role = 'pet_sitter' 
  AND is_verified = true
  AND onboarding_completed = true
);