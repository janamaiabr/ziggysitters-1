-- Check the current public_sitter_profiles view
DROP VIEW IF EXISTS public_sitter_profiles;

-- Recreate the view to properly show sitter profiles
CREATE VIEW public_sitter_profiles AS
SELECT 
  p.id,
  (p.first_name || ' ' || LEFT(p.last_name, 1) || '.') as display_name,
  p.role,
  p.suburb,
  p.city,
  p.bio,
  p.avatar_url,
  p.is_verified,
  p.background_check_verified,
  p.rating,
  p.total_reviews,
  p.response_rate,
  p.verification_status,
  p.created_at
FROM profiles p
WHERE p.role = 'pet_sitter'
  AND p.is_verified = true
  OR p.id IS NOT NULL; -- Show all sitters for now, can add verification filter later