-- Fix the update_verification_status function to work properly
-- This function should only be callable by admins via RLS, not by hardcoded email check
DROP FUNCTION IF EXISTS public.update_verification_status(uuid, boolean, text);
DROP FUNCTION IF EXISTS public.update_verification_status(uuid, boolean, verification_status);

CREATE FUNCTION public.update_verification_status(
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
  -- Only allow admins to update verification status
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can update verification status';
  END IF;

  -- Update the profile
  UPDATE profiles 
  SET 
    is_verified = update_verification_status.is_verified,
    verification_status = update_verification_status.verification_status,
    updated_at = now()
  WHERE id = profile_id;
END;
$$;