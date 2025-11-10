-- Add admin_notes column to profiles table (admin-only secure notes)
ALTER TABLE public.profiles 
ADD COLUMN admin_notes TEXT;

COMMENT ON COLUMN public.profiles.admin_notes IS 'Secure admin-only notes for verification details, name discrepancies, etc.';

-- Create RLS policy for admin notes - only admins can read
CREATE POLICY "Admins can view admin notes"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  is_admin() 
  AND admin_notes IS NOT NULL
);

-- Create RLS policy for admin notes - only admins can update
CREATE POLICY "Admins can update admin notes"
ON public.profiles
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());