-- Create sitter_testimonials table for sitters to collect testimonials from past clients
CREATE TABLE public.sitter_testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sitter_id UUID NOT NULL REFERENCES public.profiles(id),
  client_name TEXT NOT NULL,
  client_relationship TEXT DEFAULT 'past_client', -- past_client, friend, family
  testimonial_text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_approved BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sitter_testimonials ENABLE ROW LEVEL SECURITY;

-- Sitters can view their own testimonials
CREATE POLICY "Sitters can view their own testimonials"
ON public.sitter_testimonials
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = sitter_testimonials.sitter_id AND p.user_id = auth.uid()
  )
);

-- Sitters can insert their own testimonials (max 3 enforced in app)
CREATE POLICY "Sitters can insert their own testimonials"
ON public.sitter_testimonials
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = sitter_testimonials.sitter_id AND p.user_id = auth.uid()
  )
);

-- Sitters can update their own testimonials
CREATE POLICY "Sitters can update their own testimonials"
ON public.sitter_testimonials
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = sitter_testimonials.sitter_id AND p.user_id = auth.uid()
  )
);

-- Sitters can delete their own testimonials
CREATE POLICY "Sitters can delete their own testimonials"
ON public.sitter_testimonials
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = sitter_testimonials.sitter_id AND p.user_id = auth.uid()
  )
);

-- Public can view approved testimonials
CREATE POLICY "Public can view approved testimonials"
ON public.sitter_testimonials
FOR SELECT
USING (is_approved = true);

-- Admins can manage all testimonials
CREATE POLICY "Admins can manage all testimonials"
ON public.sitter_testimonials
FOR ALL
USING (is_admin());

-- Create index for efficient queries
CREATE INDEX idx_sitter_testimonials_sitter_id ON public.sitter_testimonials(sitter_id);
CREATE INDEX idx_sitter_testimonials_approved ON public.sitter_testimonials(is_approved);

-- Trigger for updated_at
CREATE TRIGGER update_sitter_testimonials_updated_at
BEFORE UPDATE ON public.sitter_testimonials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();