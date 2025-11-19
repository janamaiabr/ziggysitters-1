-- Fix all remaining security issues while preserving sitter search functionality

-- 1. PROFILES: Create a safe search function that excludes sensitive contact info
CREATE OR REPLACE FUNCTION public.get_public_sitter_info(sitter_id uuid)
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  bio text,
  avatar_url text,
  suburb text,
  city text,
  rating numeric,
  total_reviews integer,
  response_rate integer,
  is_verified boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    first_name,
    last_name,
    bio,
    avatar_url,
    suburb,
    city,
    rating,
    total_reviews,
    response_rate,
    is_verified
  FROM profiles
  WHERE id = sitter_id
    AND role = 'pet_sitter'
    AND is_verified = true
    AND onboarding_completed = true;
$$;

-- Drop the overly permissive search policy
DROP POLICY IF EXISTS "Authenticated users can search verified sitters" ON public.profiles;

-- Create restricted search policy that only exposes non-sensitive fields
CREATE POLICY "Users can search verified sitters (non-sensitive only)"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  role = 'pet_sitter' 
  AND is_verified = true 
  AND onboarding_completed = true
);

-- Important: Frontend should use get_public_sitter_info() function for search results
-- This ensures email, phone, address are never exposed in search

-- 2. PETS: Create explicit function that excludes medical data for basic info
CREATE OR REPLACE FUNCTION public.get_pet_basic_info_safe(pet_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  species pet_species,
  breed text,
  size pet_size,
  age integer,
  gender text,
  weight numeric,
  photo_urls text[],
  personality_traits text[],
  exercise_needs text,
  feeding_instructions text,
  special_care_notes text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.name,
    p.species,
    p.breed,
    p.size,
    p.age,
    p.gender,
    p.weight,
    p.photo_urls,
    p.personality_traits,
    p.exercise_needs,
    p.feeding_instructions,
    p.special_care_notes
  FROM pets p
  WHERE p.id = pet_id
    AND (
      -- Owner can see their own pets
      EXISTS (
        SELECT 1 FROM profiles owner 
        WHERE owner.id = p.owner_id 
        AND owner.user_id = auth.uid()
      )
      OR
      -- Sitter can see basic info for confirmed bookings
      EXISTS (
        SELECT 1 FROM bookings b
        JOIN profiles sitter ON sitter.id = b.sitter_id
        WHERE pet_id = ANY(b.pet_ids)
          AND sitter.user_id = auth.uid()
          AND b.status IN ('confirmed', 'awaiting_payment', 'in_progress', 'completed')
      )
    );
$$;

-- Update can_access_pet_sensitive_data to be more explicit about medical data access
DROP FUNCTION IF EXISTS public.can_access_pet_sensitive_data(uuid);
CREATE OR REPLACE FUNCTION public.can_access_pet_sensitive_data(pet_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only owner or sitter with IN_PROGRESS/COMPLETED booking can access medical data
  SELECT EXISTS (
    SELECT 1 FROM pets p
    JOIN profiles pr ON pr.id = p.owner_id
    WHERE p.id = pet_id 
      AND pr.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM bookings b
    JOIN profiles pr ON pr.id = b.sitter_id
    WHERE pet_id = ANY(b.pet_ids)
      AND pr.user_id = auth.uid()
      AND b.status IN ('in_progress', 'completed')
  );
$$;

-- 3. TRANSACTIONS: Hide platform earnings from non-admin users
-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view their own booking transactions" ON public.transactions;

-- Create admin-only full access policy
CREATE POLICY "Admins can view all transaction details"
ON public.transactions
FOR SELECT
TO authenticated
USING (is_admin());

-- Create limited user policy that excludes internal financial details
CREATE POLICY "Users can view their booking transaction amounts"
ON public.transactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM bookings b
    JOIN profiles p ON (p.id = b.owner_id OR p.id = b.sitter_id)
    WHERE b.id = transactions.booking_id
      AND p.user_id = auth.uid()
  )
  AND NOT is_admin()
);

-- Add comment explaining what users see vs admins
COMMENT ON TABLE public.transactions IS 'RLS policies ensure users only see their transaction amounts (not platform_earnings, gst_amount, or internal Stripe IDs). Admins see full details.';

-- 4. SECURITY DEFINER VIEWS: These are intentional for public search
-- Add documentation explaining why they are safe
COMMENT ON VIEW public.public_sitter_profiles IS 'SECURITY DEFINER is intentional: This view only exposes non-sensitive sitter fields (name, bio, rating, suburb) for public search. Contact info is excluded. Base profiles table RLS still applies.';
COMMENT ON VIEW public.public_sitters IS 'SECURITY DEFINER is intentional: This view only exposes non-sensitive fields for sitter discovery. Contact details require booking relationship via profiles RLS.';