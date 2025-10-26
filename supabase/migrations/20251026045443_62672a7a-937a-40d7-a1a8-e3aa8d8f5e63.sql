-- Update accept_booking function to handle "under review" status more clearly
CREATE OR REPLACE FUNCTION public.accept_booking(booking_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_sitter_id uuid;
  v_stripe_account_id text;
  v_stripe_enabled boolean;
  v_stripe_onboarding_completed boolean;
  v_sitter_name text;
BEGIN
  -- Get booking sitter ID
  SELECT sitter_id INTO v_sitter_id
  FROM public.bookings
  WHERE id = booking_id;

  IF v_sitter_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Booking not found'
    );
  END IF;

  -- Check sitter's Stripe setup
  SELECT 
    stripe_account_id, 
    stripe_account_enabled,
    stripe_onboarding_completed,
    first_name || ' ' || last_name
  INTO v_stripe_account_id, v_stripe_enabled, v_stripe_onboarding_completed, v_sitter_name
  FROM public.profiles
  WHERE id = v_sitter_id;

  -- Validate Stripe is fully configured
  IF v_stripe_account_id IS NULL OR v_stripe_account_id = '' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You must complete your Stripe Connect setup before accepting bookings. Please go to your Profile > Payments tab.',
      'error_code', 'STRIPE_NOT_CONNECTED'
    );
  END IF;

  -- Check if onboarding is complete but account not yet enabled (under review)
  IF v_stripe_onboarding_completed IS TRUE AND v_stripe_enabled IS NOT TRUE THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Your Stripe account is currently under review. This typically takes 1-2 business days. You will be able to accept bookings once Stripe completes their verification.',
      'error_code', 'STRIPE_UNDER_REVIEW'
    );
  END IF;

  -- Check if account is not enabled (not onboarded or other issue)
  IF v_stripe_enabled IS NOT TRUE THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Your Stripe account is not fully activated. Please complete your Stripe onboarding in Profile > Payments.',
      'error_code', 'STRIPE_NOT_ENABLED'
    );
  END IF;

  -- All validations passed, accept the booking
  UPDATE public.bookings
  SET status = 'awaiting_payment',
      updated_at = now()
  WHERE id = booking_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Booking accepted successfully'
  );
END;
$$;