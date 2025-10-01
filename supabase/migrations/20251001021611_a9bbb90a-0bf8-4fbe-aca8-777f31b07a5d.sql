-- Drop view and policy that depend on the role column
DROP VIEW IF EXISTS public_sitter_profiles;
DROP POLICY IF EXISTS "Sitters are viewable by everyone" ON profiles;

-- Update any existing 'both' users to 'pet_sitter'
UPDATE profiles 
SET role = 'pet_sitter' 
WHERE role = 'both';

-- Drop the default constraint temporarily
ALTER TABLE profiles ALTER COLUMN role DROP DEFAULT;

-- Create new enum without 'both'
CREATE TYPE user_role_new AS ENUM ('pet_owner', 'pet_sitter', 'admin');

-- Update the column to use the new enum
ALTER TABLE profiles 
  ALTER COLUMN role TYPE user_role_new 
  USING role::text::user_role_new;

-- Drop old enum and rename new one
DROP TYPE user_role;
ALTER TYPE user_role_new RENAME TO user_role;

-- Restore the default
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'pet_owner'::user_role;

-- Recreate the view
CREATE VIEW public_sitter_profiles AS
SELECT 
  id,
  role,
  first_name || ' ' || last_name as display_name,
  avatar_url,
  suburb,
  city,
  bio,
  is_verified,
  verification_status,
  rating,
  total_reviews,
  response_rate,
  background_check_verified,
  created_at
FROM profiles
WHERE role = 'pet_sitter'
  AND is_verified = true;

-- Recreate the policy
CREATE POLICY "Sitters are viewable by everyone"
ON profiles
FOR SELECT
USING (role = 'pet_sitter');