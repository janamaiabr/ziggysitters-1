-- Add golden badge columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS golden_badge_approved boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS golden_badge_approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS golden_badge_approved_by uuid REFERENCES auth.users(id);

-- Add index for efficient querying
CREATE INDEX IF NOT EXISTS idx_profiles_golden_badge 
ON public.profiles(golden_badge_approved) 
WHERE golden_badge_approved = true;

-- Add comments
COMMENT ON COLUMN public.profiles.golden_badge_approved IS 'Whether the sitter has been approved for a golden badge (police vetting completed)';
COMMENT ON COLUMN public.profiles.golden_badge_approved_at IS 'When the golden badge was approved';
COMMENT ON COLUMN public.profiles.golden_badge_approved_by IS 'Admin user who approved the golden badge';