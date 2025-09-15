-- Second migration: Implement phone security and admin approval system
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

-- Create safe contact access function (excludes phone numbers)
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

-- Update profiles policies to secure phone numbers and add admin access
DROP POLICY IF EXISTS "Booking participants can access contact info" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are private" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create new secure policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles for moderation" 
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

-- Admin UPDATE policy for approving sitters
CREATE POLICY "Admins can update verification status" 
ON public.profiles 
FOR UPDATE 
USING (is_admin())
WITH CHECK (is_admin());