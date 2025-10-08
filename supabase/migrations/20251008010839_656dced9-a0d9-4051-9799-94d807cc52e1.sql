-- Allow anyone to view pet sitter profiles (basic information)
-- This is needed so pet owners can view sitter details before booking
CREATE POLICY "Anyone can view pet sitter profiles"
ON profiles
FOR SELECT
USING (role = 'pet_sitter');