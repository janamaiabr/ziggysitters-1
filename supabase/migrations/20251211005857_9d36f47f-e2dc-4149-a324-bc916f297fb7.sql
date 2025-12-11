-- Add column to track last onboarding reminder sent
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_onboarding_reminder_at timestamp with time zone DEFAULT NULL;

COMMENT ON COLUMN public.profiles.last_onboarding_reminder_at IS 'Timestamp of last onboarding reminder email sent to this sitter';