-- Fix accept_booking function to validate Stripe setup before accepting bookings
-- This prevents the root cause of the payment error

DROP FUNCTION IF EXISTS public.accept_booking(uuid);

CREATE OR REPLACE FUNCTION public.accept_booking(booking_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sitter_id uuid;
  v_stripe_account_id text;
  v_stripe_enabled boolean;
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
    first_name || ' ' || last_name
  INTO v_stripe_account_id, v_stripe_enabled, v_sitter_name
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