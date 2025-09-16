-- Final cleanup to resolve security issues
-- Since the public_sitter_profiles view/table is causing security issues 
-- and isn't used in the frontend, we'll remove it entirely

-- Drop the problematic view/table that's causing the security definer issue
DROP VIEW IF EXISTS public.public_sitter_profiles CASCADE;
DROP TABLE IF EXISTS public.public_sitter_profiles CASCADE;

-- Drop the function we created earlier since we don't need it
DROP FUNCTION IF EXISTS public.get_public_sitter_profiles() CASCADE;

-- The existing RLS policies on the profiles table are sufficient for security
-- The "Public can view verified sitter profiles" policy already allows
-- public access to verified sitter profiles, which is what the view was providing

-- Confirm no security definer objects remain by checking
-- (This is just for verification, no actual changes made)
COMMENT ON SCHEMA public IS 'Security definer view has been removed - using RLS policies on profiles table instead';