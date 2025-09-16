-- Update existing bookings table to support Stripe payment integration
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
ADD COLUMN IF NOT EXISTS booking_reference text UNIQUE DEFAULT 'BK-' || upper(substring(md5(random()::text) from 1 for 8));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_session ON public.bookings(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON public.bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);