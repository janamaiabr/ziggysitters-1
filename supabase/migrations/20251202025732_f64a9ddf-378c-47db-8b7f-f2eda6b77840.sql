-- Remove test users from public views
-- Update public_sitters view to exclude test accounts
DROP VIEW IF EXISTS public_sitters;

CREATE VIEW public_sitters AS
SELECT 
  id,
  first_name,
  last_name,
  bio,
  avatar_url,
  suburb,
  city,
  rating,
  total_reviews,
  response_rate,
  role,
  is_verified,
  golden_badge_approved,
  onboarding_completed,
  created_at
FROM profiles
WHERE role = 'pet_sitter'
  AND onboarding_completed = true
  AND is_test_account = false;  -- Exclude test accounts

-- Update public_sitter_profiles view to exclude test accounts
DROP VIEW IF EXISTS public_sitter_profiles;

CREATE VIEW public_sitter_profiles AS
SELECT 
  id,
  first_name,
  last_name,
  bio,
  avatar_url,
  suburb,
  city,
  rating,
  total_reviews,
  response_rate,
  role,
  is_verified,
  created_at
FROM profiles
WHERE role = 'pet_sitter'
  AND is_verified = true
  AND onboarding_completed = true
  AND is_test_account = false;  -- Exclude test accounts

-- Add comment to document columns to prevent accidental deletion
COMMENT ON COLUMN profiles.id_document_url IS 'IMPORTANT: Do NOT delete user uploaded documents. These are required for verification and compliance.';
COMMENT ON COLUMN profiles.id_document_urls IS 'IMPORTANT: Do NOT delete user uploaded documents. These are required for verification and compliance.';
COMMENT ON COLUMN profiles.blue_card_document_url IS 'IMPORTANT: Do NOT delete user uploaded documents. These are required for verification and compliance.';

-- Ensure verification-docs bucket has proper retention
-- Note: Actual deletion prevention must be handled at application level or via storage policies