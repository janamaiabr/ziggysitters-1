-- Create table for sitter service areas (multiple suburbs per sitter)
CREATE TABLE public.sitter_service_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sitter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  suburb TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Auckland',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(sitter_id, suburb)
);

-- Enable RLS
ALTER TABLE public.sitter_service_areas ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Service areas are viewable by everyone" 
ON public.sitter_service_areas 
FOR SELECT 
USING (true);

CREATE POLICY "Sitters can manage their own service areas" 
ON public.sitter_service_areas 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = sitter_service_areas.sitter_id
  AND profiles.user_id = auth.uid()
));

-- Create index for faster lookups
CREATE INDEX idx_sitter_service_areas_suburb ON public.sitter_service_areas(suburb);
CREATE INDEX idx_sitter_service_areas_sitter_id ON public.sitter_service_areas(sitter_id);