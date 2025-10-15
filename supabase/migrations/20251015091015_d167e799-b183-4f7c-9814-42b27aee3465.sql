-- Mark existing sitters as verified so they appear in search results
UPDATE profiles 
SET is_verified = true
WHERE id IN (
  SELECT id 
  FROM profiles 
  WHERE role = 'pet_sitter' 
  AND is_verified = false
  ORDER BY created_at
  LIMIT 10
);