-- Create missing profile for admin user
INSERT INTO public.profiles (
  user_id, 
  first_name, 
  last_name, 
  email,
  role
)
VALUES (
  '174c1a59-cab8-4df1-ad55-700158a4cc85', 
  'Admin',
  'User',
  'admin@ziggysitters.com',
  'admin'
)
ON CONFLICT (user_id) DO NOTHING;