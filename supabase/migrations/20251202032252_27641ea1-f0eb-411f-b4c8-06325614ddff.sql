-- Create a security definer function to return all public sitters
CREATE OR REPLACE FUNCTION public.get_public_sitters()
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  bio text,
  avatar_url text,
  suburb text,
  city text,
  rating numeric,
  total_reviews integer,
  response_rate integer,
  role user_role,
  is_verified boolean,
  golden_badge_approved boolean,
  onboarding_completed boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    p.onboarding_completed,
    p.created_at
  FROM profiles p
  WHERE p.role = 'pet_sitter'
    AND p.is_test_account = false;
$$;

COMMENT ON FUNCTION public.get_public_sitters() IS 'Returns all sitter profiles (verified and unverified, regardless of onboarding), excluding explicit test accounts, for public search.';