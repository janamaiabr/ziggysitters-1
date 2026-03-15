DROP FUNCTION IF EXISTS public.get_public_sitter_info(uuid);

CREATE OR REPLACE FUNCTION public.get_public_sitter_info(sitter_id uuid)
 RETURNS TABLE(id uuid, first_name text, last_name text, bio text, avatar_url text, suburb text, city text, rating numeric, total_reviews integer, response_rate integer, is_verified boolean, latitude numeric, longitude numeric, competency_tags text[])
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
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
    is_verified,
    latitude,
    longitude,
    competency_tags
  FROM profiles
  WHERE id = sitter_id
    AND role = 'pet_sitter'
    AND onboarding_completed = true;
$$;