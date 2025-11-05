-- Remove the old check constraint if it exists
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;

-- Add the updated check constraint to allow 'paid_out' status
ALTER TABLE bookings ADD CONSTRAINT bookings_payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'paid_out', 'refunded', 'failed'));