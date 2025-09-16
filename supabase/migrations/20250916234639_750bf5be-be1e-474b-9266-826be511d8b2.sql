-- Fix infinite recursion by dropping and recreating policies with corrected functions

-- Drop existing policies that depend on the functions
DROP POLICY IF EXISTS "Admins can view all profiles for moderation" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update verification status" ON public.profiles;
DROP POLICY IF EXISTS "Authorized users can access sitter contact info" ON public.profiles;
DROP POLICY IF EXISTS "Booking participants can access limited contact info" ON public.profiles;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.can_access_sitter_contact_details(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.can_access_sitter_contact_safe(uuid) CASCADE;

-- Create new is_admin function that checks auth.users directly to avoid recursion
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

-- Create safe contact access function
CREATE OR REPLACE FUNCTION public.can_access_sitter_contact_safe(sitter_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM bookings b
    WHERE b.sitter_id = sitter_profile_id
      AND b.owner_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
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
    -- Admin access
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() AND email = 'admin@ziggysitters.com'
    )
    OR
    -- Sitter accessing their own profile
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = sitter_profile_id AND p.user_id = auth.uid()
    )
    OR
    -- User with confirmed booking
    EXISTS (
      SELECT 1 
      FROM bookings b
      WHERE b.sitter_id = sitter_profile_id
        AND b.owner_id IN (
          SELECT id FROM profiles WHERE user_id = auth.uid()
        )
        AND b.status IN ('confirmed', 'in_progress', 'completed')
    );
$$;

-- Recreate the policies
CREATE POLICY "Admins can view all profiles for moderation" 
ON public.profiles FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can update verification status" 
ON public.profiles FOR UPDATE 
USING (is_admin()) 
WITH CHECK (is_admin());

CREATE POLICY "Authorized users can access sitter contact info" 
ON public.profiles FOR SELECT 
USING (
  (auth.uid() = user_id) 
  OR is_admin()
  OR (
    role IN ('pet_sitter', 'both') 
    AND is_verified = true 
    AND can_access_sitter_contact_details(id)
  )
);

CREATE POLICY "Booking participants can access limited contact info" 
ON public.profiles FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND can_access_sitter_contact_safe(id) 
  AND auth.uid() <> user_id
);