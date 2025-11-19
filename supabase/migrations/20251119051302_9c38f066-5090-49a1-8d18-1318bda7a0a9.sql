-- Create table to track Stripe migration status
CREATE TABLE IF NOT EXISTS public.stripe_migration_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sitter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  old_stripe_account_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(sitter_id)
);

-- Enable RLS
ALTER TABLE public.stripe_migration_tracking ENABLE ROW LEVEL SECURITY;

-- Only admins can access migration tracking
CREATE POLICY "Admins can view migration tracking"
  ON public.stripe_migration_tracking
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can manage migration tracking"
  ON public.stripe_migration_tracking
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Auto-update updated_at
CREATE TRIGGER update_stripe_migration_tracking_updated_at
  BEFORE UPDATE ON public.stripe_migration_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();