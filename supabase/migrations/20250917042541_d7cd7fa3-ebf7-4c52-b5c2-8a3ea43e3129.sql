-- Remove the dangerous RLS policy that exposes sensitive data
DROP POLICY IF EXISTS "Public sitter profiles are viewable by everyone" ON public.profiles;

-- The safe public_sitter_profiles view already exists and only exposes non-sensitive data
-- No additional changes needed to the view as it already properly filters sensitive information