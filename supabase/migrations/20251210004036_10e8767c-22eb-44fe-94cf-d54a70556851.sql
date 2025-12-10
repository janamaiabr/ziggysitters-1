-- Update get_pet_basic_info_safe to exclude emergency contacts
CREATE OR REPLACE FUNCTION public.get_pet_basic_info_safe(pet_id uuid)
RETURNS TABLE(
  id uuid, 
  name text, 
  species pet_species, 
  breed text, 
  size pet_size, 
  age integer, 
  gender text, 
  weight numeric, 
  photo_urls text[], 
  personality_traits text[], 
  exercise_needs text, 
  feeding_instructions text, 
  special_care_notes text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.id,
    p.name,
    p.species,
    p.breed,
    p.size,
    p.age,
    p.gender,
    p.weight,
    p.photo_urls,
    p.personality_traits,
    p.exercise_needs,
    p.feeding_instructions,
    p.special_care_notes
  FROM pets p
  WHERE p.id = pet_id
    AND (
      -- Owner can see their own pets
      EXISTS (
        SELECT 1 FROM profiles owner 
        WHERE owner.id = p.owner_id 
        AND owner.user_id = auth.uid()
      )
      OR
      -- Sitter can see basic info for confirmed bookings
      EXISTS (
        SELECT 1 FROM bookings b
        JOIN profiles sitter ON sitter.id = b.sitter_id
        WHERE pet_id = ANY(b.pet_ids)
          AND sitter.user_id = auth.uid()
          AND b.status IN ('confirmed', 'awaiting_payment', 'in_progress', 'completed')
      )
    );
$$;

-- Update get_pet_basic_info_for_booking to exclude emergency contacts
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
STABLE
SECURITY DEFINER
SET search_path TO 'public'
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
  JOIN unnest((SELECT pet_ids FROM bookings WHERE id = booking_id)) AS pid ON p.id = pid
  WHERE EXISTS (
    SELECT 1 FROM bookings b
    JOIN profiles pr ON pr.id = b.sitter_id
    WHERE b.id = booking_id
      AND pr.user_id = auth.uid()
      AND b.status IN ('confirmed', 'in_progress', 'completed')
  );
$$;

-- Create new protected function for emergency contacts (only for owners and active sitters)
CREATE OR REPLACE FUNCTION public.get_pet_emergency_contacts(pet_id uuid)
RETURNS TABLE(
  id uuid,
  emergency_contact_name text,
  emergency_contact_phone text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.id,
    p.emergency_contact_name,
    p.emergency_contact_phone
  FROM pets p
  WHERE p.id = pet_id
    AND (
      -- Owner always has access
      EXISTS (
        SELECT 1 FROM profiles owner 
        WHERE owner.id = p.owner_id 
        AND owner.user_id = auth.uid()
      )
      OR
      -- Sitter only during confirmed/in_progress bookings (not just awaiting_payment)
      EXISTS (
        SELECT 1 FROM bookings b
        JOIN profiles sitter ON sitter.id = b.sitter_id
        WHERE pet_id = ANY(b.pet_ids)
          AND sitter.user_id = auth.uid()
          AND b.status IN ('confirmed', 'in_progress')
      )
    );
$$;