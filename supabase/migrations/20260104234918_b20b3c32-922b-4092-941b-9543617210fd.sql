-- Cancel the test booking BK-52925849
UPDATE bookings 
SET status = 'cancelled', updated_at = now()
WHERE booking_reference = 'BK-52925849'