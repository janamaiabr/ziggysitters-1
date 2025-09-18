-- Create RLS policy to allow public viewing of sitter profiles
CREATE POLICY "Sitters are viewable by everyone" 
ON profiles 
FOR SELECT 
USING (role IN ('pet_sitter', 'both'));