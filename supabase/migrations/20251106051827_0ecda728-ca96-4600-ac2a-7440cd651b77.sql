-- Fix the remaining RLS recursion issue
-- The "Sitters can view owner profiles for their bookings" policy is causing recursion
-- because it queries profiles table within the profiles table policy

-- Create a security definer function to check if sitter can view owner profile
CREATE OR REPLACE FUNCTION can_sitter_view_owner_profile(owner_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM bookings b
    INNER JOIN profiles sitter ON sitter.id = b.sitter_id
    WHERE b.owner_id = owner_profile_id
    AND sitter.user_id = auth.uid()
    AND b.status IN ('confirmed', 'awaiting_payment', 'in_progress', 'completed')
  )
$$;

-- Drop and recreate the problematic policy
DROP POLICY IF EXISTS "Sitters can view owner profiles for their bookings" ON public.profiles;

CREATE POLICY "Sitters can view owner profiles for their bookings" ON public.profiles
  FOR SELECT
  USING (can_sitter_view_owner_profile(id));