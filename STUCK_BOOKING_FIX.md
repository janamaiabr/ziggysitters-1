# Fix for Stuck Test Booking

The booking `6f8d76f8-fbee-444e-90bb-3c3398379e31` was created before we fixed the metadata issue, so manual-verify-payment can't find its payment in Stripe.

## To fix this specific booking, run this SQL in Supabase SQL Editor:

```sql
-- Update the stuck test booking to confirmed
UPDATE bookings
SET 
  status = 'confirmed',
  payment_status = 'paid'
WHERE id = '6f8d76f8-fbee-444e-90bb-3c3398379e31';
```

## Future Bookings
All NEW bookings created from now on will work correctly because:
- `create-payment-after-acceptance` now adds `booking_id`, `booking_reference`, and `service_type` to the payment intent metadata
- `manual-verify-payment` searches by these metadata fields
- The automatic `verify-payment` flow also uses this metadata

## Test the Fixed Flow
To verify the automatic flow works:
1. Create a NEW booking as a pet owner
2. Accept it as a sitter  
3. Pay via Stripe checkout
4. The booking should automatically update to "confirmed"
