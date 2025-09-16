-- Fix the security definer view issue by removing the setting and ensuring proper RLS
-- The view will now use the invoker's permissions (which is safer)

-- Remove the security definer setting from the view
ALTER VIEW public.public_sitter_profiles SET (security_invoker = on);

-- Grant explicit SELECT permission on the view to the public role
-- This allows anyone to read the safe, limited data in the view
GRANT SELECT ON public.public_sitter_profiles TO public;