-- Create admin function to update verification status
CREATE OR REPLACE FUNCTION public.update_verification_status(
  profile_id uuid,
  is_verified boolean,
  verification_status text
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.profiles 
  SET 
    is_verified = update_verification_status.is_verified,
    verification_status = update_verification_status.verification_status::verification_status
  WHERE id = profile_id
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
        AND email = 'admin@ziggysitters.com'
    );
$$;