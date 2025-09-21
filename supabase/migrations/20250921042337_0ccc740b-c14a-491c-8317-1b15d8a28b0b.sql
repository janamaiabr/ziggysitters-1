UPDATE bookings 
SET status = 'confirmed', 
    payment_status = 'paid',
    stripe_payment_intent_id = 'pi_manual_confirmation_' || booking_reference
WHERE booking_reference = 'BK-A8024396' 
AND status = 'pending';