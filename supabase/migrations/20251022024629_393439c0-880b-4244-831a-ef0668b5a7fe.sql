-- Create a function to validate sitter Stripe status before accepting bookings
CREATE OR REPLACE FUNCTION public.validate_sitter_stripe_on_acceptance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_stripe_account_id text;
  v_stripe_enabled boolean;
  v_sitter_name text;
BEGIN
  -- Only validate when status changes to awaiting_payment
  IF NEW.status = 'awaiting_payment' AND (OLD.status IS NULL OR OLD.status != 'awaiting_payment') THEN
    -- Get sitter's Stripe information
    SELECT 
      stripe_account_id,
      stripe_account_enabled,
      first_name || ' ' || last_name
    INTO v_stripe_account_id, v_stripe_enabled, v_sitter_name
    FROM profiles
    WHERE id = NEW.sitter_id;
    
    -- Validate Stripe account exists
    IF v_stripe_account_id IS NULL OR v_stripe_account_id = '' THEN
      RAISE EXCEPTION 'Sitter % must complete Stripe Connect setup before accepting bookings. Profile > Payments.', v_sitter_name;
    END IF;
    
    -- Validate Stripe account is enabled
    IF v_stripe_enabled IS NOT TRUE THEN
      RAISE EXCEPTION 'Sitter % Stripe account is not fully activated. They must complete Stripe onboarding in Profile > Payments.', v_sitter_name;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS validate_stripe_before_acceptance ON public.bookings;

-- Create the trigger
CREATE TRIGGER validate_stripe_before_acceptance
  BEFORE UPDATE OR INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_sitter_stripe_on_acceptance();