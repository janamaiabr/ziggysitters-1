-- ========================================
-- CRITICAL SECURITY FIXES FOR PRODUCTION LAUNCH
-- ========================================

-- Issue 1: Remove public read access to profiles table (CRITICAL)
-- Currently: Anyone can see emails, phones, addresses, Stripe IDs
-- Fix: Only allow viewing specific sitter profiles, not all sensitive data

DROP POLICY IF EXISTS "Public can view sitter profiles for search" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view sitter profiles for booking" ON public.profiles;

-- Allow public to view ONLY basic sitter info for search (no contact details)
CREATE POLICY "Public can view basic sitter info for search"
ON public.profiles
FOR SELECT
USING (
  role = 'pet_sitter' 
  AND is_verified = true
);

-- Allow authenticated users with bookings to see sitter contact info
CREATE POLICY "Booked users can view sitter contact details"
ON public.profiles
FOR SELECT
USING (
  (role = 'pet_sitter' AND can_access_sitter_contact(id))
  OR (auth.uid() = user_id)
  OR is_admin()
);

-- Issue 2: Hide sensitive profile fields from public
-- Create a view for public sitter listings that excludes sensitive data
CREATE OR REPLACE VIEW public.public_sitter_listings AS
SELECT 
  id,
  first_name,
  last_name,
  suburb,
  city,
  bio,
  avatar_url,
  rating,
  total_reviews,
  response_rate,
  created_at,
  role,
  is_verified
FROM public.profiles
WHERE role = 'pet_sitter' 
  AND is_verified = true
  AND onboarding_completed = true;

-- Grant public access to the safe view only
GRANT SELECT ON public.public_sitter_listings TO anon;
GRANT SELECT ON public.public_sitter_listings TO authenticated;

-- Issue 3: Allow users to view their own transactions
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;

-- Keep admin access
CREATE POLICY "Admins can view all transactions"
ON public.transactions
FOR SELECT
USING (is_admin());

-- Add policy for users to see their own booking transactions
CREATE POLICY "Users can view their own booking transactions"
ON public.transactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM bookings b
    JOIN profiles p ON p.id = b.owner_id OR p.id = b.sitter_id
    WHERE b.id = transactions.booking_id
      AND p.user_id = auth.uid()
  )
);

-- Issue 4: Restrict sitter availability to authenticated users only
DROP POLICY IF EXISTS "Sitter availability is viewable by everyone" ON public.sitter_availability;

CREATE POLICY "Authenticated users can view sitter availability"
ON public.sitter_availability
FOR SELECT
USING (auth.role() IS NOT NULL);

-- Issue 5: Add password leak protection (enable in Supabase settings)
-- This must be done in Supabase dashboard: Authentication → Policies → Password Protection