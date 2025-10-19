-- Clean up the stale awaiting_payment booking that's blocking the calendar
UPDATE bookings
SET status = 'cancelled',
    sitter_notes = COALESCE(sitter_notes || ' | ', '') || 'Auto-cancelled: Stale booking from testing phase'
WHERE id = '6f8d76f8-fbee-444e-90bb-3c3398379e31'
  AND status = 'awaiting_payment';

-- Update the service_type enum to remove dog_walking
-- First, add a temporary column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_type_new service_type;

-- Copy data, converting dog_walking to drop_in_visits
UPDATE bookings 
SET service_type_new = CASE 
  WHEN service_type::text = 'dog_walking' THEN 'drop_in_visits'::service_type
  ELSE service_type::text::service_type
END;

-- Drop the old column and rename the new one
ALTER TABLE bookings DROP COLUMN IF EXISTS service_type CASCADE;
ALTER TABLE bookings RENAME COLUMN service_type_new TO service_type;
ALTER TABLE bookings ALTER COLUMN service_type SET NOT NULL;

-- Do the same for sitter_services table
ALTER TABLE sitter_services ADD COLUMN IF NOT EXISTS service_type_new service_type;

UPDATE sitter_services 
SET service_type_new = CASE 
  WHEN service_type::text = 'dog_walking' THEN 'drop_in_visits'::service_type
  ELSE service_type::text::service_type
END;

ALTER TABLE sitter_services DROP COLUMN IF EXISTS service_type CASCADE;
ALTER TABLE sitter_services RENAME COLUMN service_type_new TO service_type;
ALTER TABLE sitter_services ALTER COLUMN service_type SET NOT NULL;

-- Recreate the service_type enum without dog_walking
DROP TYPE IF EXISTS service_type_old CASCADE;
CREATE TYPE service_type_old AS ENUM ('pet_sitting_owners_home', 'pet_sitting_sitters_home', 'drop_in_visits');

-- Update both tables to use the new enum
ALTER TABLE bookings ALTER COLUMN service_type TYPE service_type_old USING service_type::text::service_type_old;
ALTER TABLE sitter_services ALTER COLUMN service_type TYPE service_type_old USING service_type::text::service_type_old;

-- Drop old enum and rename new one
DROP TYPE IF EXISTS service_type CASCADE;
ALTER TYPE service_type_old RENAME TO service_type;