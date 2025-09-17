-- Remove the unused SECURITY DEFINER function that is causing linter warnings
-- The public_sitter_profiles view provides the same functionality more securely
DROP FUNCTION IF EXISTS public.get_safe_sitter_profiles(integer);