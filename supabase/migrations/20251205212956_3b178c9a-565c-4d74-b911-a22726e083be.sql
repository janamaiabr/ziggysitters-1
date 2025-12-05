-- Create sitter_leads table for lead capture
CREATE TABLE public.sitter_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  suburb TEXT,
  city TEXT DEFAULT 'Auckland',
  services_interested TEXT[],
  experience_level TEXT,
  source TEXT DEFAULT 'become_sitter_page',
  converted_to_user BOOLEAN DEFAULT false,
  converted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referrals table for tracking sitter referrals
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id),
  referral_code TEXT NOT NULL UNIQUE,
  referred_email TEXT,
  referred_user_id UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'completed', 'credited')),
  referrer_credit_amount NUMERIC DEFAULT 20.00,
  referee_credit_amount NUMERIC DEFAULT 20.00,
  referrer_credited_at TIMESTAMP WITH TIME ZONE,
  referee_credited_at TIMESTAMP WITH TIME ZONE,
  first_booking_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sitter_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Sitter leads policies (public insert, admin read)
CREATE POLICY "Anyone can submit sitter lead" ON public.sitter_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view sitter leads" ON public.sitter_leads FOR SELECT USING (is_admin());
CREATE POLICY "Admins can update sitter leads" ON public.sitter_leads FOR UPDATE USING (is_admin());

-- Referrals policies
CREATE POLICY "Users can view their own referrals" ON public.referrals FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = referrals.referrer_id AND profiles.user_id = auth.uid())
);
CREATE POLICY "Users can create referrals" ON public.referrals FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = referrals.referrer_id AND profiles.user_id = auth.uid())
);
CREATE POLICY "Admins can view all referrals" ON public.referrals FOR SELECT USING (is_admin());
CREATE POLICY "Admins can update referrals" ON public.referrals FOR UPDATE USING (is_admin());

-- Create indexes
CREATE INDEX idx_sitter_leads_email ON public.sitter_leads(email);
CREATE INDEX idx_sitter_leads_suburb ON public.sitter_leads(suburb);
CREATE INDEX idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);