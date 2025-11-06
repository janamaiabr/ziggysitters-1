-- Fix infinite recursion in RLS policy functions by ensuring they use SECURITY DEFINER
-- This allows them to bypass RLS when checking permissions

-- Drop and recreate is_admin function with proper SECURITY DEFINER and CASCADE
DROP FUNCTION IF EXISTS is_admin() CASCADE;
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
$$;

-- Drop and recreate can_access_sitter_contact function with proper SECURITY DEFINER and CASCADE
DROP FUNCTION IF EXISTS can_access_sitter_contact(uuid) CASCADE;
CREATE OR REPLACE FUNCTION can_access_sitter_contact(sitter_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM bookings b
    INNER JOIN profiles owner ON owner.id = b.owner_id
    WHERE b.sitter_id = sitter_profile_id
    AND owner.user_id = auth.uid()
    AND b.status IN ('confirmed', 'awaiting_payment', 'in_progress', 'completed')
  )
$$;

-- Drop and recreate can_access_pet_basic_info function with proper SECURITY DEFINER and CASCADE
DROP FUNCTION IF EXISTS can_access_pet_basic_info(uuid) CASCADE;
CREATE OR REPLACE FUNCTION can_access_pet_basic_info(pet_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Pet owner can always see their pet
    SELECT 1
    FROM pets p
    INNER JOIN profiles owner ON owner.id = p.owner_id
    WHERE p.id = pet_id
    AND owner.user_id = auth.uid()
  )
  OR EXISTS (
    -- Sitter can see pets in their bookings
    SELECT 1
    FROM pets p
    INNER JOIN bookings b ON p.id = ANY(b.pet_ids)
    INNER JOIN profiles sitter ON sitter.id = b.sitter_id
    WHERE p.id = pet_id
    AND sitter.user_id = auth.uid()
    AND b.status IN ('confirmed', 'awaiting_payment', 'in_progress', 'completed')
  )
$$;

-- Recreate all policies that were dropped

-- Profiles policies
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update verification status" ON public.profiles
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Booked users can view sitter contact" ON public.profiles
  FOR SELECT
  USING (role = 'pet_sitter' AND can_access_sitter_contact(id));

-- Storage policies for verification docs
CREATE POLICY "Admins can view all verification docs" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'verification-docs' AND is_admin());

-- Transactions policies
CREATE POLICY "Admins can view all transactions" ON public.transactions
  FOR SELECT
  USING (is_admin());

-- Pets policies
CREATE POLICY "Users can view basic pet info through bookings" ON public.pets
  FOR SELECT
  USING (can_access_pet_basic_info(id));