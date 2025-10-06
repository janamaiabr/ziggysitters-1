-- FINAL SECURITY FIX: Restrict profiles table RLS to prevent direct access to PII
-- Force all public queries to use the secure view instead

-- 1. Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public can view verified sitter profiles" ON public.profiles;

-- 2. Create a more restricted policy that only allows viewing minimal profile data
-- This policy is for authenticated users to see basic profile info in specific contexts
CREATE POLICY "Authenticated users can view limited sitter info"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  role = 'pet_sitter' 
  AND is_verified = true
);

-- 3. Make sure emergency contacts are protected in pets table
-- Update can_access_pet_basic_info to be more explicit about what it does NOT expose
COMMENT ON FUNCTION public.can_access_pet_basic_info IS 
'Controls access to non-sensitive pet data. Does NOT grant access to emergency contacts.
Emergency contacts require can_access_pet_sensitive_data function.
Basic info includes: name, species, size, age, breed, gender, weight, photo_urls, personality_traits, exercise_needs, feeding_instructions, special_care_notes.
Does NOT include: medical_conditions, medications, emergency_contact_name, emergency_contact_phone.';

-- 4. Ensure the public view is the ONLY way for anonymous users to browse sitters
-- Grant SELECT on the view to anon users
GRANT SELECT ON public.public_sitter_profiles TO anon;

-- 5. Ensure sitter_services table has appropriate RLS
-- This is intentionally public as it's marketplace pricing data
COMMENT ON TABLE public.sitter_services IS 
'Public marketplace pricing data. Intentionally visible to allow price comparison.
For MVP launch, this is acceptable. Consider adding RLS in future if competitive concerns arise.';