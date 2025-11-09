-- Update booking BK-7BA26A49 from confirmed to completed (end date was Nov 20, now past)
UPDATE bookings 
SET 
  status = 'completed',
  updated_at = now()
WHERE id = 'c00b82c4-4c74-450a-9ba9-0218b2de1f83'
  AND status = 'confirmed';