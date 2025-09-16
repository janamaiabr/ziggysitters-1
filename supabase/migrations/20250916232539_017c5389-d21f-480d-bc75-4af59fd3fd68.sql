-- First, add the new service type to the existing enum
ALTER TYPE service_type ADD VALUE 'pet_sitting_owners_home';
ALTER TYPE service_type ADD VALUE 'pet_sitting_sitters_home';

-- Rename existing services to match the new naming convention
-- We'll use UPDATE statements to migrate existing data
UPDATE sitter_services 
SET service_type = 'pet_sitting_sitters_home' 
WHERE service_type = 'overnight_boarding';

UPDATE bookings 
SET service_type = 'pet_sitting_sitters_home' 
WHERE service_type = 'overnight_boarding';

-- Update daycare to be pet_sitting_sitters_home as well 
UPDATE sitter_services 
SET service_type = 'pet_sitting_sitters_home' 
WHERE service_type = 'daycare';

UPDATE bookings 
SET service_type = 'pet_sitting_sitters_home' 
WHERE service_type = 'daycare';

-- Keep dog_walking and drop_in_visits as they are
-- Remove unused service types by creating a new enum with only the services we want
-- But first we need to handle this differently since we can't remove enum values directly

-- Create a new enum with our desired values
CREATE TYPE new_service_type AS ENUM (
  'pet_sitting_sitters_home',
  'pet_sitting_owners_home', 
  'drop_in_visits',
  'dog_walking'
);

-- Update the tables to use the new enum
ALTER TABLE bookings 
ALTER COLUMN service_type TYPE new_service_type 
USING (
  CASE 
    WHEN service_type::text = 'overnight_boarding' THEN 'pet_sitting_sitters_home'::new_service_type
    WHEN service_type::text = 'daycare' THEN 'pet_sitting_sitters_home'::new_service_type
    WHEN service_type::text = 'dog_walking' THEN 'dog_walking'::new_service_type
    WHEN service_type::text = 'drop_in_visits' THEN 'drop_in_visits'::new_service_type
    WHEN service_type::text = 'pet_sitting_sitters_home' THEN 'pet_sitting_sitters_home'::new_service_type
    WHEN service_type::text = 'pet_sitting_owners_home' THEN 'pet_sitting_owners_home'::new_service_type
    ELSE 'pet_sitting_sitters_home'::new_service_type
  END
);

ALTER TABLE sitter_services 
ALTER COLUMN service_type TYPE new_service_type 
USING (
  CASE 
    WHEN service_type::text = 'overnight_boarding' THEN 'pet_sitting_sitters_home'::new_service_type
    WHEN service_type::text = 'daycare' THEN 'pet_sitting_sitters_home'::new_service_type
    WHEN service_type::text = 'dog_walking' THEN 'dog_walking'::new_service_type
    WHEN service_type::text = 'drop_in_visits' THEN 'drop_in_visits'::new_service_type
    WHEN service_type::text = 'pet_sitting_sitters_home' THEN 'pet_sitting_sitters_home'::new_service_type
    WHEN service_type::text = 'pet_sitting_owners_home' THEN 'pet_sitting_owners_home'::new_service_type
    ELSE 'pet_sitting_sitters_home'::new_service_type
  END
);

-- Drop the old enum and rename the new one
DROP TYPE service_type;
ALTER TYPE new_service_type RENAME TO service_type;