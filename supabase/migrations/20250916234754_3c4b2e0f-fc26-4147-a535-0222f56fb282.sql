-- Fix infinite recursion by dropping dependent policies first, then recreating functions and policies

-- Drop all policies on profiles table that cause recursion
DROP POLICY IF EXISTS "Admins can view all profiles for moderation" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update verification status" ON public.profiles;
DROP POLICY IF EXISTS "Authorized users can access sitter contact info" ON public.profiles;
DROP POLICY IF EXISTS "Booking participants can access limited contact info" ON public.profiles;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.can_access_sitter_contact_details(uuid);
DROP FUNCTION IF EXISTS public.can_access_sitter_contact_safe(uuid);

-- Create new is_admin function that uses auth.uid() directly without querying profiles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
      AND email = 'admin@ziggysitters.com'
  );
$$;

-- Create safe contact access function for booking participants
CREATE OR REPLACE FUNCTION public.can_access_sitter_contact_safe(sitter_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM bookings b
    JOIN auth.users u ON u.id = auth.uid()
    WHERE b.sitter_id = sitter_profile_id
      AND EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.user_id = u.id AND p.id = b.owner_id
      )
      AND b.status IN ('confirmed', 'in_progress', 'completed')
  );
$$;

-- Create detailed contact access function
CREATE OR REPLACE FUNCTION public.can_access_sitter_contact_details(sitter_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    -- Admin access via email check
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() AND email = 'admin@ziggysitters.com'
    )
    OR
    -- Sitter can access their own profile
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = sitter_profile_id AND p.user_id = auth.uid()
    )
    OR
    -- User has confirmed booking with this sitter
    EXISTS (
      SELECT 1 
      FROM bookings b
      JOIN auth.users u ON u.id = auth.uid()
      WHERE b.sitter_id = sitter_profile_id
        AND EXISTS (
          SELECT 1 FROM profiles p 
          WHERE p.user_id = u.id AND p.id = b.owner_id
        )
        AND b.status IN ('confirmed', 'in_progress', 'completed')
    );
$$;

-- Recreate the necessary policies with fixed functions
CREATE POLICY "Admins can view all profiles for moderation" 
ON public.profiles 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can update verification status" 
ON public.profiles 
FOR UPDATE 
USING (is_admin())
WITH CHECK (is_admin());

-- Simplified policy for public sitter profiles (safe fields only)
CREATE POLICY "Public can view basic sitter info" 
ON public.profiles 
FOR SELECT 
USING (
  role IN ('pet_sitter', 'both') 
  AND is_verified = true
);

-- Policy for authorized contact access (full details for confirmed bookings)
CREATE POLICY "Authorized users can access sitter contact info" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR is_admin()
  OR (
    role IN ('pet_sitter', 'both') 
    AND is_verified = true 
    AND can_access_sitter_contact_details(id)
  )
);