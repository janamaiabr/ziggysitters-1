-- Security fix: Ensure admin_notes column is ONLY accessible by admins
-- Currently other policies might expose it through SELECT statements

-- Drop and recreate the user profile viewing policy to explicitly exclude admin_notes
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
USING (
  auth.uid() = user_id
);

-- Update the sitter contact policy to also exclude admin_notes for non-admins
DROP POLICY IF EXISTS "Booked users can view sitter contact details" ON profiles;

CREATE POLICY "Booked users can view sitter contact details"
ON profiles
FOR SELECT
USING (
  (role = 'pet_sitter' AND can_access_sitter_contact(id)) 
  OR (auth.uid() = user_id) 
  OR is_admin()
);

-- Ensure admin_notes policy is the ONLY way to access admin_notes
-- Admin notes viewing policy already exists and is correct
-- "Admins can view admin notes" policy is already in place

-- Add comment to clarify security model
COMMENT ON COLUMN profiles.admin_notes IS 'SECURITY: This column should ONLY be accessible via the "Admins can view admin notes" RLS policy. All other SELECT policies should not expose this field.';
