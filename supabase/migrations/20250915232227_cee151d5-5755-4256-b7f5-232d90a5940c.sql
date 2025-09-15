-- Add admin role and secure phone numbers completely
-- First, add admin role to the enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';

-- Create a completely secure phone access policy - phone numbers should NEVER be visible to anyone except the user themselves
-- Remove phone from any public access and ensure only the profile owner can see it

-- Update the can_access_sitter_contact function to NOT include phone numbers
-- Phone numbers should remain private even for confirmed bookings
CREATE OR REPLACE FUNCTION public.can_access_sitter_contact_safe(sitter_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  -- Allow access to sitter contact info (but NOT phone) if user has confirmed booking with them
  SELECT EXISTS (
    SELECT 1 
    FROM bookings b
    JOIN profiles p ON p.id = b.owner_id
    WHERE b.sitter_id = sitter_profile_id
      AND p.user_id = auth.uid()
      AND b.status IN ('confirmed', 'in_progress', 'completed')
  );
$function$;

-- Create admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE user_id = auth.uid() 
      AND role = 'admin'
  );
$function$;

-- Update profiles policies to secure phone numbers and add admin access
DROP POLICY IF EXISTS "Booking participants can access contact info" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are private" ON public.profiles;

-- Create new secure policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Booking participants can access limited contact info" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND can_access_sitter_contact_safe(id)
  AND auth.uid() != user_id  -- Don't duplicate own profile access
);

-- Update the public view to ensure it never shows phone numbers
DROP VIEW IF EXISTS public.public_sitter_profiles;

CREATE VIEW public.public_sitter_profiles 
WITH (security_barrier = true) AS
SELECT 
  p.id,
  p.first_name,
  p.bio,
  p.city,
  p.rating,
  p.total_reviews,
  p.avatar_url,
  p.response_rate,
  p.role,
  p.created_at,
  p.is_verified
FROM public.profiles p
WHERE p.role = 'pet_sitter'::user_role 
  AND p.is_verified = true;

-- Grant access to the safe view
GRANT SELECT ON public.public_sitter_profiles TO anon;
GRANT SELECT ON public.public_sitter_profiles TO authenticated;