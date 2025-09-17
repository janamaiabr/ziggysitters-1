-- Create a function to check if a user can access basic pet info through confirmed bookings
CREATE OR REPLACE FUNCTION public.can_access_pet_basic_info(pet_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- Allow access to basic pet info if user is the owner or has a confirmed booking with the pet
  SELECT EXISTS (
    -- Pet owner can always access
    SELECT 1 
    FROM pets p
    JOIN profiles pr ON pr.id = p.owner_id
    WHERE p.id = pet_id 
      AND pr.user_id = auth.uid()
  ) OR EXISTS (
    -- Sitters with confirmed/in-progress/completed bookings can access basic info
    SELECT 1 
    FROM bookings b
    JOIN profiles pr ON pr.id = b.sitter_id
    WHERE pet_id = ANY(b.pet_ids)
      AND pr.user_id = auth.uid()
      AND b.status IN ('confirmed', 'in_progress', 'completed')
  );
$$;

-- Create a function to check if a user can access sensitive pet data (medical, emergency contacts)
CREATE OR REPLACE FUNCTION public.can_access_pet_sensitive_data(pet_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- Only pet owners can access sensitive data
  SELECT EXISTS (
    SELECT 1 
    FROM pets p
    JOIN profiles pr ON pr.id = p.owner_id
    WHERE p.id = pet_id 
      AND pr.user_id = auth.uid()
  );
$$;

-- Drop existing policies
DROP POLICY IF EXISTS "Pet owners can view their own pets" ON pets;
DROP POLICY IF EXISTS "Pet owners can insert their own pets" ON pets;
DROP POLICY IF EXISTS "Pet owners can update their own pets" ON pets;
DROP POLICY IF EXISTS "Pet owners can delete their own pets" ON pets;

-- Create new granular policies for pets table
CREATE POLICY "Users can view basic pet info through bookings"
ON pets FOR SELECT
USING (can_access_pet_basic_info(id));

CREATE POLICY "Pet owners can insert their own pets"
ON pets FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = pets.owner_id 
      AND user_id = auth.uid()
  )
);

CREATE POLICY "Pet owners can update their own pets"
ON pets FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = pets.owner_id 
      AND user_id = auth.uid()
  )
);

CREATE POLICY "Pet owners can delete their own pets"
ON pets FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = pets.owner_id 
      AND user_id = auth.uid()
  )
);

-- Create a secure view for basic pet information that sitters can access
CREATE OR REPLACE VIEW public.pet_basic_info AS
SELECT 
  id,
  owner_id,
  name,
  species,
  size,
  age,
  breed,
  gender,
  weight,
  photo_urls,
  personality_traits,
  exercise_needs,
  feeding_instructions,
  special_care_notes,
  -- Exclude sensitive medical and emergency data
  created_at,
  updated_at
FROM pets
WHERE can_access_pet_basic_info(id);

-- Create RLS policy for the view
ALTER VIEW public.pet_basic_info SET (security_barrier = true);

-- Create a secure view for sensitive pet data (owner-only access)
CREATE OR REPLACE VIEW public.pet_sensitive_info AS
SELECT 
  id,
  medical_conditions,
  medications,
  vaccination_status,
  vaccination_expiry,
  is_neutered,
  emergency_contact_name,
  emergency_contact_phone
FROM pets
WHERE can_access_pet_sensitive_data(id);

-- Create RLS policy for sensitive data view
ALTER VIEW public.pet_sensitive_info SET (security_barrier = true);