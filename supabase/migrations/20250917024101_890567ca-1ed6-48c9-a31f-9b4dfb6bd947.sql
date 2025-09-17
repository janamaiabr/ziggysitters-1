-- Fix the security issue by recreating the view without SECURITY DEFINER
DROP VIEW IF EXISTS public_sitter_profiles;

-- Recreate the view properly (without security definer)
CREATE VIEW public_sitter_profiles AS
SELECT 
  p.id,
  (p.first_name || ' ' || LEFT(p.last_name, 1) || '.') as display_name,
  p.role,
  p.suburb,
  p.city,
  p.bio,
  p.avatar_url,
  p.is_verified,
  p.background_check_verified,
  p.rating,
  p.total_reviews,
  p.response_rate,
  p.verification_status,
  p.created_at
FROM profiles p
WHERE p.role = 'pet_sitter';

-- Create RLS policy for the view
CREATE POLICY "Public sitter profiles are viewable by everyone" 
ON profiles 
FOR SELECT 
USING (role = 'pet_sitter');