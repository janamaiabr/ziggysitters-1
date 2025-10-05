-- Add Stripe Connect account fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_account_id text,
ADD COLUMN IF NOT EXISTS stripe_account_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_onboarding_completed boolean DEFAULT false;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_account_id ON public.profiles(stripe_account_id);

COMMENT ON COLUMN public.profiles.stripe_account_id IS 'Stripe Connect account ID for receiving payouts';
COMMENT ON COLUMN public.profiles.stripe_account_enabled IS 'Whether the Stripe Connect account is fully enabled for payouts';
COMMENT ON COLUMN public.profiles.stripe_onboarding_completed IS 'Whether the sitter has completed Stripe Connect onboarding';