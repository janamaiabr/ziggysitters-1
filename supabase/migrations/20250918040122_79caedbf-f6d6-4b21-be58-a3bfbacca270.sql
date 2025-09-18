-- Add onboarding completion tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;

-- Update existing profiles that have basic info to be marked as completed
-- This prevents existing users from being stuck in onboarding
UPDATE public.profiles 
SET onboarding_completed = TRUE 
WHERE phone IS NOT NULL 
  AND address IS NOT NULL 
  AND suburb IS NOT NULL 
  AND first_name IS NOT NULL 
  AND last_name IS NOT NULL;