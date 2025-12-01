-- Create table to store deleted user information
CREATE TABLE IF NOT EXISTS public.deleted_users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  first_name text,
  last_name text,
  cancellation_reason text,
  deleted_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_by_admin uuid REFERENCES auth.users(id),
  user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deleted_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view deleted users
CREATE POLICY "Admins can view deleted users"
  ON public.deleted_users
  FOR SELECT
  USING (is_admin());

-- Only admins can insert deleted user records
CREATE POLICY "Admins can insert deleted users"
  ON public.deleted_users
  FOR INSERT
  WITH CHECK (is_admin());

-- Create index on email for future lookups
CREATE INDEX idx_deleted_users_email ON public.deleted_users(email);

-- Add table to store account cancellation requests
CREATE TABLE IF NOT EXISTS public.account_cancellation_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  email text NOT NULL,
  user_name text NOT NULL,
  reason text NOT NULL,
  requested_at timestamp with time zone NOT NULL DEFAULT now(),
  processed boolean DEFAULT false,
  processed_at timestamp with time zone,
  processed_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.account_cancellation_requests ENABLE ROW LEVEL SECURITY;

-- Users can insert their own cancellation requests
CREATE POLICY "Users can create cancellation requests"
  ON public.account_cancellation_requests
  FOR INSERT
  WITH CHECK (true);

-- Admins can view all cancellation requests
CREATE POLICY "Admins can view cancellation requests"
  ON public.account_cancellation_requests
  FOR SELECT
  USING (is_admin());

-- Admins can update cancellation requests
CREATE POLICY "Admins can update cancellation requests"
  ON public.account_cancellation_requests
  FOR UPDATE
  USING (is_admin());

-- Create index for lookups
CREATE INDEX idx_cancellation_requests_user_id ON public.account_cancellation_requests(user_id);
CREATE INDEX idx_cancellation_requests_processed ON public.account_cancellation_requests(processed);