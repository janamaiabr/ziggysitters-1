-- Remove the problematic security barrier views
DROP VIEW IF EXISTS public.pet_basic_info;
DROP VIEW IF EXISTS public.pet_sensitive_info;

-- Update the policies to use the security definer functions directly
-- The existing policies should work correctly with the can_access functions

-- Verify that RLS is enabled on pets table
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Create a function specifically for getting pet basic info that sitters can access
CREATE OR REPLACE FUNCTION public.get_pet_basic_info_for_booking(booking_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  species pet_species,
  size pet_size,
  age integer,
  breed text,
  gender text,
  weight numeric,
  photo_urls text[],
  personality_traits text[],
  exercise_needs text,
  feeding_instructions text,
  special_care_notes text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    p.id,
    p.name,
    p.species,
    p.size,
    p.age,
    p.breed,
    p.gender,
    p.weight,
    p.photo_urls,
    p.personality_traits,
    p.exercise_needs,
    p.feeding_instructions,
    p.special_care_notes
  FROM pets p
  JOIN unnest((SELECT pet_ids FROM bookings WHERE id = booking_id)) AS pet_id ON p.id = pet_id
  WHERE EXISTS (
    SELECT 1 FROM bookings b
    JOIN profiles pr ON pr.id = b.sitter_id
    WHERE b.id = booking_id
      AND pr.user_id = auth.uid()
      AND b.status IN ('confirmed', 'in_progress', 'completed')
  );
$$;