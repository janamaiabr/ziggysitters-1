-- Since this is a breaking change to service types, we need to clean up existing data
-- This is acceptable in development; for production you'd need a more careful migration

-- Delete all existing bookings (they reference old service types)
DELETE FROM bookings;

-- Delete all existing sitter services (they reference old service types)
DELETE FROM sitter_services;

-- Now create new enum with only the 4 core services
CREATE TYPE new_service_type AS ENUM (
  'pet_sitting_owners_home',
  'pet_sitting_sitters_home',
  'dog_walking',
  'drop_in_visits'
);

-- Update sitter_services table to use new enum
ALTER TABLE sitter_services 
ALTER COLUMN service_type TYPE new_service_type 
USING service_type::text::new_service_type;

-- Update bookings table to use new enum
ALTER TABLE bookings 
ALTER COLUMN service_type TYPE new_service_type 
USING service_type::text::new_service_type;

-- Drop old enum and rename new one
DROP TYPE service_type;
ALTER TYPE new_service_type RENAME TO service_type;

-- Add comments to clarify new pricing model (ALL rates are PER PET)
COMMENT ON COLUMN sitter_services.daily_rate IS 'Daily rate PER PET for pet sitting in owner home & sitter home';
COMMENT ON COLUMN sitter_services.hourly_rate IS 'Hourly rate PER PET for dog walking; flat rate PER VISIT for drop-in visits';
COMMENT ON COLUMN sitter_services.overnight_rate IS 'DEPRECATED - use daily_rate instead';