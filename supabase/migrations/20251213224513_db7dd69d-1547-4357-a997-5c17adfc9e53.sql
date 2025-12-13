-- Revert get_public_sitters to include all non-test pet sitters (do NOT filter by services)
CREATE OR REPLACE FUNCTION public.get_public_sitters()
 RETURNS TABLE(id uuid, first_name text, last_name text, bio text, avatar_url text, suburb text, city text, rating numeric, total_reviews integer, response_rate integer, role user_role, is_verified boolean, golden_badge_approved boolean, onboarding_completed boolean, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;