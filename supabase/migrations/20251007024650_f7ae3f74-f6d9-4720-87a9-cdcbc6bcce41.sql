-- Fix: Remove public access to profiles table to prevent PII and payment data exposure
-- The public_sitter_profiles view already provides safe public access with only non-sensitive fields

-- Drop the policy that exposes full profile rows (including email, phone, stripe_account_id)
DROP POLICY IF EXISTS "Public can view verified sitters through secure view" ON public.profiles;

-- The remaining policies on profiles ensure:
-- 1. "Users can view their own profile" - users see their own full data
-- 2. "Booked users can view sitter contact" - users with confirmed bookings can see sitter contact info
-- 3. "Admins can view all profiles" - admins have full access
-- 
-- Public browsing uses public_sitter_profiles view (which excludes PII and payment data)

-- Ensure the view has proper comments explaining security boundaries
COMMENT ON VIEW public.public_sitter_profiles IS 
'Public view of verified sitters for browsing. Excludes all PII (email, phone, address, documents) and payment data (stripe_account_id, stripe_account_enabled, stripe_onboarding_completed). 
Users must login and have confirmed bookings to view contact details via the "Booked users can view sitter contact" policy.';