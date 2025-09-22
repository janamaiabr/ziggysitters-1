-- Fix admin user role and onboarding status
UPDATE public.profiles 
SET 
  role = 'admin',
  onboarding_completed = true
WHERE email = 'hello@ziggysitters.com';