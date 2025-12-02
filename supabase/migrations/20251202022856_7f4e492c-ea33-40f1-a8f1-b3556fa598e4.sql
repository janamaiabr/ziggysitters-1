-- Update public_sitters view to show ALL sitters with onboarding completed (not just verified)
-- This allows unverified sitters to be searchable and bookable
DROP VIEW IF EXISTS public_sitters;

CREATE VIEW public_sitters AS
SELECT 
  p.id,
  p.first_name,
  p.last_name,
  p.bio,
  p.avatar_url,
  p.suburb,
  p.city,
  p.rating,
  p.total_reviews,
  p.response_rate,
  p.role,
  p.is_verified,
  p.golden_badge_approved,
  p.created_at,
  p.onboarding_completed
FROM profiles p
WHERE 
  p.role = 'pet_sitter' 
  AND p.onboarding_completed = true;

-- Add comment for clarity
COMMENT ON VIEW public_sitters IS 'All sitters who have completed onboarding, regardless of verification status. Three levels: unverified (no ID), verified (ID approved), gold star (vet check approved).';