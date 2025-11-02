-- Remove policies that expose sensitive contact information to public/all authenticated users
DROP POLICY IF EXISTS "Public can view verified sitter profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated can view all sitter profiles" ON public.profiles;

-- The remaining policies ensure:
-- 1. Users can view their own profile (with all sensitive data)
-- 2. Admins can view all profiles
-- 3. Users with confirmed bookings can view their sitter's contact info (via can_access_sitter_contact)
-- 4. For public browsing, the app uses public_sitter_profiles view (no email/phone)

-- Email and phone will only be accessible:
-- - By the profile owner themselves
-- - By admins
-- - By pet owners who have confirmed/in-progress/completed bookings with that sitter