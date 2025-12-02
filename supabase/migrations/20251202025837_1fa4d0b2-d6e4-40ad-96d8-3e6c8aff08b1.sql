-- Relax public_sitters view to include unverified and not-yet-onboarded sitters
DROP VIEW IF EXISTS public_sitters;

CREATE VIEW public_sitters AS
SELECT 
  id,
  first_name,
  last_name,
  bio,
  avatar_url,
  suburb,
  city,
  rating,
  total_reviews,
  response_rate,
  role,
  is_verified,
  golden_badge_approved,
  onboarding_completed,
  created_at
FROM profiles
WHERE role = 'pet_sitter'
  AND is_test_account = false;  -- Only exclude explicit test accounts

COMMENT ON VIEW public_sitters IS 'Public search view for sitters, including verified and unverified, regardless of onboarding status, excluding test accounts.';