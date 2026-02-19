
-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Anyone can submit sitter lead" ON public.sitter_leads;

-- Recreate as explicitly PERMISSIVE for anon role
CREATE POLICY "Anyone can submit sitter lead"
ON public.sitter_leads
AS PERMISSIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
