-- Fix the security vulnerability with public_sitter_profiles view
-- Remove public access and implement proper access control

-- Revoke public access from the view (this was the security issue)
REVOKE ALL ON public.public_sitter_profiles FROM public;

-- Grant access only to authenticated users 
GRANT SELECT ON public.public_sitter_profiles TO authenticated;

-- Grant access to service role for admin functions
GRANT SELECT ON public.public_sitter_profiles TO service_role;

-- Ensure the view still works for intended users (authenticated users only)
-- The view itself filters to only show public sitter profile data, but now requires authentication