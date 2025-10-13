-- Create transactions table for accounting
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('booking_payment', 'refund', 'payout', 'platform_fee')),
  amount numeric NOT NULL,
  gst_amount numeric NOT NULL DEFAULT 0,
  platform_earnings numeric NOT NULL DEFAULT 0,
  description text NOT NULL,
  stripe_payment_intent_id text,
  stripe_refund_id text,
  stripe_transfer_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Only admins can view transactions
CREATE POLICY "Admins can view all transactions"
ON public.transactions
FOR SELECT
USING (is_admin());

-- Create index for faster queries
CREATE INDEX idx_transactions_booking_id ON public.transactions(booking_id);
CREATE INDEX idx_transactions_type ON public.transactions(transaction_type);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);

COMMENT ON TABLE public.transactions IS 'Tracks all financial transactions on the platform including payments, refunds, payouts, and platform earnings';