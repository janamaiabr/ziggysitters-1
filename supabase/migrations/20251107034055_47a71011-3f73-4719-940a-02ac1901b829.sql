-- Create a public view that exposes ONLY safe sitter information
-- This allows anonymous users to search sitters without exposing sensitive data

CREATE OR REPLACE VIEW public.public_sitters AS
SELECT 
  p.id,
  p.first_name,
  p.last_name,
  p.suburb,
  p.city,
  p.bio,
  p.avatar_url,
  p.rating,
  p.total_reviews,
  p.response_rate,
  p.created_at,
  p.role,
  p.is_verified,
  p.onboarding_completed
FROM public.profiles p
WHERE 
  p.role = 'pet_sitter'
  AND p.is_verified = true
  AND p.onboarding_completed = true;

-- Allow anyone (including anonymous users) to view this public sitter data
GRANT SELECT ON public.public_sitters TO anon;
GRANT SELECT ON public.public_sitters TO authenticated;

-- Also allow public access to sitter_availability (it doesn't contain sensitive data)
DROP POLICY IF EXISTS "Authenticated users can view sitter availability" ON public.sitter_availability;

CREATE POLICY "Anyone can view sitter availability"
ON public.sitter_availability
FOR SELECT
TO anon, authenticated
USING (true);