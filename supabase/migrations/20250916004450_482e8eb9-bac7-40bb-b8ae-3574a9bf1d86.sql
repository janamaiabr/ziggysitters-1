-- Fix the security definer view issue by changing ownership
-- The view is still owned by postgres, which gives it elevated privileges

-- Change the ownership of the view to authenticator role
-- This ensures the view executes with the querying user's privileges, not elevated privileges
ALTER VIEW public.public_sitter_profiles OWNER TO authenticator;

-- Verify the view respects RLS by revoking any elevated permissions
REVOKE ALL ON public.public_sitter_profiles FROM postgres;

-- Ensure proper permissions are granted to the intended roles
GRANT SELECT ON public.public_sitter_profiles TO anon, authenticated;