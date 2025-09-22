-- Ensure all admin users have onboarding_completed set to true
UPDATE public.profiles 
SET onboarding_completed = true 
WHERE role = 'admin' AND (onboarding_completed IS NULL OR onboarding_completed = false);