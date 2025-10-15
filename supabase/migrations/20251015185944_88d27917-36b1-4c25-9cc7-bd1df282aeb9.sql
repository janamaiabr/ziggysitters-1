-- Create or replace the update_verification_status function
CREATE OR REPLACE FUNCTION public.update_verification_status(
  profile_id uuid,
  is_verified boolean,
  verification_status verification_status
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    is_verified = update_verification_status.is_verified,
    verification_status = update_verification_status.verification_status,
    updated_at = now()
  WHERE id = profile_id;
END;
$$;