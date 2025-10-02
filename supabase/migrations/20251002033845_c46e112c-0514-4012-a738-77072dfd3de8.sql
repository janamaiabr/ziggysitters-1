
-- Drop the public_sitter_profiles view to avoid security definer issues
-- Instead, we'll query the profiles table directly with proper RLS enforcement
DROP VIEW IF EXISTS public_sitter_profiles;

-- The profiles table already has the RLS policy "Sitters are viewable by everyone"
-- which allows SELECT when role = 'pet_sitter', so we can query it directly
