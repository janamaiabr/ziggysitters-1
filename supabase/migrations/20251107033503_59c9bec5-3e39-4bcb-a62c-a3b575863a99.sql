-- FINAL SECURITY FIX: Require authentication for all profile access
-- This prevents scraping of sensitive data

DROP POLICY IF EXISTS "Public can search verified sitters" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated can search verified sitters" ON public.profiles;

-- Only authenticated users can search for sitters
CREATE POLICY "Authenticated users can search verified sitters"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  role = 'pet_sitter' 
  AND is_verified = true
  AND onboarding_completed = true
);

-- Note: Frontend must query only safe columns:
-- SELECT id, first_name, last_name, suburb, city, bio, avatar_url, rating, total_reviews, response_rate
-- DO NOT SELECT: email, phone, address, postal_code, latitude, longitude, id_document_url, stripe_account_id