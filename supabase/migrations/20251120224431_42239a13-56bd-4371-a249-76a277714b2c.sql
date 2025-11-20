-- Create promo codes table
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  applies_to TEXT NOT NULL CHECK (applies_to IN ('platform_fee', 'total', 'service_cost')),
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can read active promo codes to validate them
CREATE POLICY "Anyone can read active promo codes"
  ON public.promo_codes
  FOR SELECT
  USING (is_active = true AND valid_until > now());

-- Only admins can manage promo codes
CREATE POLICY "Admins can manage promo codes"
  ON public.promo_codes
  FOR ALL
  USING (is_admin());

-- Add promo code tracking to bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS promo_code TEXT,
  ADD COLUMN IF NOT EXISTS promo_discount_amount NUMERIC DEFAULT 0;

-- Function to validate and apply promo code
CREATE OR REPLACE FUNCTION validate_promo_code(
  p_code TEXT,
  p_platform_fee NUMERIC
) RETURNS JSON AS $$
DECLARE
  v_promo RECORD;
  v_discount_amount NUMERIC;
BEGIN
  -- Get promo code details
  SELECT * INTO v_promo
  FROM promo_codes
  WHERE code = p_code
    AND is_active = true
    AND valid_from <= now()
    AND valid_until > now()
    AND (max_uses IS NULL OR current_uses < max_uses);

  IF NOT FOUND THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Invalid or expired promo code'
    );
  END IF;

  -- Calculate discount based on type
  IF v_promo.applies_to = 'platform_fee' THEN
    IF v_promo.discount_type = 'percentage' THEN
      v_discount_amount := ROUND(p_platform_fee * (v_promo.discount_value / 100), 2);
    ELSE
      v_discount_amount := LEAST(v_promo.discount_value, p_platform_fee);
    END IF;
  ELSE
    RETURN json_build_object(
      'valid', false,
      'error', 'Promo code not applicable to platform fee'
    );
  END IF;

  RETURN json_build_object(
    'valid', true,
    'discount_amount', v_discount_amount,
    'description', v_promo.description
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Insert Black Friday promo code
INSERT INTO public.promo_codes (
  code,
  description,
  discount_type,
  discount_value,
  applies_to,
  valid_from,
  valid_until,
  max_uses
) VALUES (
  'BLACKFRIDAY50',
  'Black Friday Special - 50% off platform fee',
  'percentage',
  50,
  'platform_fee',
  '2025-11-20 00:00:00+00',
  '2025-11-30 23:59:59+00',
  NULL
) ON CONFLICT (code) DO NOTHING;