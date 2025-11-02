-- Create a policy that allows authenticated users to view sitter profiles for booking
-- This is necessary for the booking flow to work
-- The public_sitter_profiles view (which excludes email/phone) is used for public browsing
-- But the booking process needs to read from profiles table for validation

CREATE POLICY "Authenticated users can view sitter profiles for booking"
ON public.profiles
FOR SELECT
TO authenticated
USING (role = 'pet_sitter'::user_role AND is_verified = true);

-- This allows:
-- 1. Booking flow to validate sitter data
-- 2. Edge functions to send notifications
-- 3. Application to display sitter information
-- But email/phone are still protected through application logic that only shows them
-- to users with confirmed bookings (via can_access_sitter_contact function)