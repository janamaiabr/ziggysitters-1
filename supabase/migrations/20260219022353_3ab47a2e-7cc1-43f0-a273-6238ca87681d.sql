
-- Drop the restrictive INSERT policy and recreate as permissive
DROP POLICY IF EXISTS "Anyone can submit sitter lead" ON public.sitter_leads;

CREATE POLICY "Anyone can submit sitter lead"
ON public.sitter_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
