-- Allow pet owners to view sitter profiles for bookings they own (any status)
-- This fixes the "Sitter profile not found" error when owners try to view pending bookings

CREATE OR REPLACE FUNCTION public.can_owner_view_sitter_profile(sitter_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM bookings b
    INNER JOIN profiles owner ON owner.id = b.owner_id
    WHERE b.sitter_id = sitter_profile_id
    AND owner.user_id = auth.uid()
  )
$$;

-- Update the policy to also allow owners to view sitter profiles for their bookings
DROP POLICY IF EXISTS "Owners can view sitter profiles for their bookings" ON profiles;
CREATE POLICY "Owners can view sitter profiles for their bookings"
ON profiles
FOR SELECT
USING (
  role = 'pet_sitter' AND can_owner_view_sitter_profile(id)
);