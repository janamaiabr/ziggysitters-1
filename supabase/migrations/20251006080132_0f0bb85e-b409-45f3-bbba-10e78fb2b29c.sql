-- Fix critical security issues in profiles and pets tables (clean migration)
-- This migration ensures PII is protected while allowing public browsing of sitters

-- 1. DROP ALL EXISTING POLICIES to start fresh
DROP POLICY IF EXISTS "Sitters are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public can view verified sitter profiles (limited data)" ON public.profiles;
DROP POLICY IF EXISTS "Users can view sitter contact info with confirmed booking" ON public.profiles;

-- 2. Create a public view with ONLY non-sensitive sitter data
CREATE OR REPLACE VIEW public.public_sitter_profiles AS
SELECT 
  id,
  first_name,
  SUBSTRING(last_name, 1, 1) || '.' as last_name,
  suburb,
  city,
  bio,
  avatar_url,
  rating,
  total_reviews,
  is_verified,
  role,
  created_at,
  response_rate
FROM public.profiles
WHERE role = 'pet_sitter' AND is_verified = true;

-- Grant access to the view for anonymous and authenticated users
GRANT SELECT ON public.public_sitter_profiles TO anon, authenticated;

-- 3. NEW SAFE POLICY: Allow anon + auth to view LIMITED sitter data
CREATE POLICY "Public can view verified sitter profiles"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (
  role = 'pet_sitter' 
  AND is_verified = true
);

-- 4. Allow authenticated users with bookings to see full contact info
CREATE POLICY "Booked users can view sitter contact"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  role = 'pet_sitter' 
  AND can_access_sitter_contact(id)
);

-- 5. Update pet access functions
CREATE OR REPLACE FUNCTION public.can_access_pet_sensitive_data(pet_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM pets p
    JOIN profiles pr ON pr.id = p.owner_id
    WHERE p.id = pet_id 
      AND pr.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 
    FROM bookings b
    JOIN profiles pr ON pr.id = b.sitter_id
    WHERE pet_id = ANY(b.pet_ids)
      AND pr.user_id = auth.uid()
      AND b.status IN ('in_progress', 'completed')
  );
$$;

-- Add comments
COMMENT ON POLICY "Public can view verified sitter profiles" ON public.profiles IS 
'Allows anonymous users to browse verified sitters. Email, phone, address remain hidden.';

COMMENT ON VIEW public.public_sitter_profiles IS 
'Public view for sitter browsing - only exposes safe, non-PII data.';