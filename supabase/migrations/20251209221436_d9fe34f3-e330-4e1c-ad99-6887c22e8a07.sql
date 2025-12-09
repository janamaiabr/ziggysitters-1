-- Add email verification tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verification_token text,
ADD COLUMN IF NOT EXISTS email_verification_sent_at timestamp with time zone;