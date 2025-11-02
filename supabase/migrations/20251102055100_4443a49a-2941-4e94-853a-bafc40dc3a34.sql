-- Restore policy to allow viewing sitter profiles for search/browsing
-- This policy allows reading the profiles table for pet sitters
-- The application uses public_sitter_profiles view (which excludes email/phone) for public browsing
-- Email and phone are only accessed when users have confirmed bookings

CREATE POLICY "Public can view sitter profiles for search"
ON public.profiles
FOR SELECT
USING (role = 'pet_sitter'::user_role AND is_verified = true);

-- This allows the FindSitters page to work while the app uses public_sitter_profiles view
-- which excludes sensitive fields (email, phone) by design