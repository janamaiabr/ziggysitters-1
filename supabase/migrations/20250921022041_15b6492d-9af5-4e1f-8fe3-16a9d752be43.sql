-- Transform janamaia@gmail.com into an admin by updating the existing profile
UPDATE profiles 
SET role = 'admin'
WHERE email = 'janamaia@gmail.com';

-- Also ensure admin@ziggysitters.com is an admin (backup admin account)
UPDATE profiles 
SET role = 'admin'
WHERE email = 'admin@ziggysitters.com';