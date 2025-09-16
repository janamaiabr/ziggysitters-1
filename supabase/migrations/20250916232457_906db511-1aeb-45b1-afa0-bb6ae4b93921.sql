-- Update service types to include the new service
-- First, let's check what the current service_type enum contains
-- and add the new "pet_sitting_owners_home" service

-- Drop the existing enum if it exists and recreate with new values
DROP TYPE IF EXISTS service_type CASCADE;

-- Create the updated service_type enum with all three services
CREATE TYPE service_type AS ENUM (
  'pet_sitting_sitters_home',
  'pet_sitting_owners_home', 
  'drop_in_visits'
);

-- Update any existing tables that reference the old enum
-- Recreate the booking table service_type column
ALTER TABLE bookings 
ALTER COLUMN service_type TYPE service_type 
USING service_type::text::service_type;

-- Update the sitter_services table service_type column
ALTER TABLE sitter_services 
ALTER COLUMN service_type TYPE service_type 
USING service_type::text::service_type;