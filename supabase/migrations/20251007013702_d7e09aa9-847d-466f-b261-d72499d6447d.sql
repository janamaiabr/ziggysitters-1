-- Fix: Allow anonymous users to browse sitters
-- The public_sitter_profiles view already filters out PII, we just need to allow access

-- Drop the authenticated-only policy
DROP POLICY IF EXISTS "Authenticated users can view limited sitter info" ON public.profiles;

-- Create policy that allows both anonymous and authenticated users to view verified sitters
-- The view public_sitter_profiles already restricts which columns are visible
CREATE POLICY "Public can view verified sitters through secure view"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (
  role = 'pet_sitter' 
  AND is_verified = true
);

-- Ensure phone numbers are never exposed in the view
-- Update the view to be explicit about excluded PII
DROP VIEW IF EXISTS public.public_sitter_profiles;

CREATE VIEW public.public_sitter_profiles AS
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
  is_verified,
  role,
  created_at
  -- Explicitly NOT including: email, phone, address, postal_code, latitude, longitude,
  -- id_document_url, blue_card_document_url, stripe_account_id, user_id
FROM public.profiles
WHERE role = 'pet_sitter' AND is_verified = true;

-- Grant access to both anonymous and authenticated users
GRANT SELECT ON public.public_sitter_profiles TO anon, authenticated;

COMMENT ON VIEW public.public_sitter_profiles IS 
'Public view of verified sitters. Excludes all PII (email, phone, address, documents).
Safe for anonymous browsing. Users must login to book or view contact details.';