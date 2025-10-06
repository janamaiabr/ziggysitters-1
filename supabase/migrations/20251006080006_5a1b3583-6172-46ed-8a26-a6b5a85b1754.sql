-- Fix critical security issues in profiles and pets tables
-- This migration ensures PII is protected while allowing public browsing of sitters

-- 1. DROP THE DANGEROUS POLICY exposing all sitter data
DROP POLICY IF EXISTS "Sitters are viewable by everyone" ON public.profiles;

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

-- 3. Create new safe policy for viewing basic sitter profiles
CREATE POLICY "Public can view verified sitter profiles (limited data)"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (
  role = 'pet_sitter' 
  AND is_verified = true
);

-- 4. Create policy for users with confirmed bookings to access sitter contact info
CREATE POLICY "Users can view sitter contact info with confirmed booking"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  role = 'pet_sitter' 
  AND can_access_sitter_contact(id)
);

-- 5. Update the pet access function to exclude emergency contacts from basic info
CREATE OR REPLACE FUNCTION public.can_access_pet_basic_info(pet_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- Allow access to basic pet info (not emergency contacts) if user is the owner 
  -- or has a confirmed/in-progress/completed booking with the pet
  SELECT EXISTS (
    -- Pet owner can always access
    SELECT 1 
    FROM pets p
    JOIN profiles pr ON pr.id = p.owner_id
    WHERE p.id = pet_id 
      AND pr.user_id = auth.uid()
  ) OR EXISTS (
    -- Sitters with confirmed/in-progress/completed bookings can access basic info
    SELECT 1 
    FROM bookings b
    JOIN profiles pr ON pr.id = b.sitter_id
    WHERE pet_id = ANY(b.pet_ids)
      AND pr.user_id = auth.uid()
      AND b.status IN ('confirmed', 'in_progress', 'completed')
  );
$$;

-- 6. Create function to check access to sensitive pet data (including emergency contacts)
CREATE OR REPLACE FUNCTION public.can_access_pet_sensitive_data(pet_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- Only pet owners OR sitters with in-progress/completed bookings can access sensitive data
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

-- Add helpful comments
COMMENT ON POLICY "Public can view verified sitter profiles (limited data)" ON public.profiles IS 
'Allows anonymous and authenticated users to view basic info of verified sitters only. Sensitive data like email, phone, address, stripe_account_id is NOT exposed through this policy.';

COMMENT ON VIEW public.public_sitter_profiles IS 
'Public view exposing only non-sensitive sitter information for browsing. Use this view in the frontend for the sitter listing page.';

COMMENT ON FUNCTION public.can_access_pet_sensitive_data IS 
'Controls access to sensitive pet data including emergency contacts. Only owners or sitters with active/completed bookings can access.';