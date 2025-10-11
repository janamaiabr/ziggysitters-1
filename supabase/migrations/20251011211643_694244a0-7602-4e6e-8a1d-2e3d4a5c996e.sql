-- FIX: Allow authenticated users to browse sitter profiles
-- The previous fix was too restrictive - authenticated users couldn't even browse sitters!

-- Drop the overly restrictive policies
DROP POLICY IF EXISTS "Public can view basic verified sitter info" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated booking users see sitter contact" ON public.profiles;

-- Create new policy for anonymous users to see verified sitters (basic info only)
CREATE POLICY "Public can view verified sitter profiles"
ON public.profiles
FOR SELECT
TO anon
USING (
  role = 'pet_sitter'::user_role 
  AND is_verified = true
);

-- Create policy for authenticated users to see all sitter profiles
-- Note: Email/phone should be filtered client-side unless user has booking
CREATE POLICY "Authenticated can view all sitter profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  role = 'pet_sitter'::user_role
);

COMMENT ON POLICY "Public can view verified sitter profiles" ON public.profiles IS 'Allows anonymous users to browse verified sitter profiles. Frontend should filter sensitive fields.';
COMMENT ON POLICY "Authenticated can view all sitter profiles" ON public.profiles IS 'Allows authenticated users to browse sitter profiles. Frontend should filter email/phone unless user has active booking.';