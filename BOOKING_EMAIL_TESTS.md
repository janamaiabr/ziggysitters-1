# Booking Email Notification System - Test Documentation

## Overview
This system sends different email notifications to pet sitters based on whether they have completed Stripe payment setup.

## Email Types

### 1. Standard Booking Notification (With Stripe Setup)
**Function:** `send-booking-notification`
**Recipients:** Sitters who have completed Stripe onboarding
**Purpose:** Notify sitter of new booking request that they can immediately accept

**Key Features:**
- Simple "Accept or Decline Booking" call-to-action
- Standard booking details
- Safety warning about platform communication
- Direct link to bookings page

### 2. Payment Setup Required Notification (Without Stripe)
**Function:** `send-booking-notification-no-stripe`
**Recipients:** Sitters who have NOT completed Stripe onboarding
**Purpose:** Notify sitter of booking request AND prompt them to complete payment setup

**Key Features:**
- Prominent "Payment Setup Required" section
- Explanation of why Stripe is needed
- Step-by-step guide on what to do next
- "Complete Payment Setup & Accept Booking" call-to-action
- Links to profile page (where Stripe setup is initiated)
- Help and support information

## Email Content Comparison

| Element | With Stripe | Without Stripe |
|---------|-------------|----------------|
| Subject | "New Booking Request - {REF}" | "🎉 New Booking Request - Action Required - {REF}" |
| CTA Button | "Accept or Decline Booking" | "Complete Payment Setup & Accept Booking" |
| CTA Link | `/bookings` | `/profile` |
| Special Sections | - | Payment Setup Required, What happens next, Need Help |
| Urgency Level | Standard | Elevated (action required) |

## Testing

### Running the Tests

To test both email notifications:

1. **Deploy the edge functions** (automatic when you save changes)

2. **Run the test suite:**
   ```bash
   curl -X POST https://qermxzepyzbenemcordv.supabase.co/functions/v1/test-booking-emails \
     -H "apikey: YOUR_ANON_KEY"
   ```

3. **Check your test email** at `test@ziggysitters.com` for both notifications

### Expected Test Results

```json
{
  "total": 3,
  "passed": 3,
  "failed": 0,
  "results": [
    {
      "test": "Send notification WITH Stripe",
      "status": "PASS",
      "message": "Email sent successfully to sitter with Stripe setup"
    },
    {
      "test": "Send notification WITHOUT Stripe",
      "status": "PASS",
      "message": "Email sent successfully to sitter without Stripe setup"
    },
    {
      "test": "Email content verification",
      "status": "PASS",
      "message": "Both emails should be sent to test@ziggysitters.com"
    }
  ],
  "message": "✅ All tests passed! Check your email at test@ziggysitters.com"
}
```

### Manual Test Cases

#### Test Case 1: Sitter With Stripe - New Booking
**Scenario:** Pet owner books a sitter who has completed Stripe setup

**Steps:**
1. Log in as pet owner
2. Find a sitter with `stripe_account_enabled: true`
3. Complete booking request
4. Check sitter's email

**Expected Result:**
- Sitter receives standard booking notification
- Email contains "Accept or Decline Booking" button
- Button links to `/bookings`
- No payment setup warnings

#### Test Case 2: Sitter Without Stripe - New Booking
**Scenario:** Pet owner books a sitter who hasn't completed Stripe setup

**Steps:**
1. Log in as pet owner
2. Find a sitter with `stripe_account_enabled: false`
3. Complete booking request
4. Check sitter's email

**Expected Result:**
- Sitter receives payment setup notification
- Email contains "Payment Setup Required" section
- Email contains "Complete Payment Setup & Accept Booking" button
- Button links to `/profile`
- Includes step-by-step instructions

#### Test Case 3: Booking Creation - No Stripe Block
**Scenario:** Verify that bookings are not blocked for sitters without Stripe

**Steps:**
1. Log in as pet owner
2. Attempt to book sitter without Stripe setup
3. Submit booking request

**Expected Result:**
- Booking is created successfully
- No "payment setup not complete" error
- Booking status is "pending"
- Sitter receives appropriate email

### Edge Cases

1. **Email Delivery Failure**
   - Booking should still be created
   - Error logged but doesn't block booking
   - Admin notified of email failure

2. **Sitter Completes Stripe After Booking**
   - Sitter can accept booking after completing setup
   - System checks Stripe status at acceptance time
   - Payment flow proceeds normally

3. **Multiple Pending Bookings**
   - Sitter receives separate emails for each booking
   - All emails include Stripe setup prompt if not completed
   - One Stripe setup enables all pending bookings

## Implementation Details

### Booking Flow Changes

**Before:**
```
Create Booking → Check Stripe → ❌ Reject if no Stripe
```

**After:**
```
Create Booking → Check Stripe → ✓ Allow booking
                              → Send appropriate email
```

### Edge Function Routing

```typescript
// In create-booking/index.ts
const notificationFunction = hasStripeSetup 
  ? 'send-booking-notification' 
  : 'send-booking-notification-no-stripe';

await supabaseClient.functions.invoke(notificationFunction, {
  body: { /* booking details */ }
});
```

## Monitoring

### Success Metrics
- Email delivery rate (target: >99%)
- Stripe setup completion after receiving email (target: >60% within 24h)
- Booking acceptance rate (with vs without Stripe)

### Key Logs to Monitor
```
[CREATE-BOOKING] Sitter Stripe status checked
[CREATE-BOOKING] Booking notification email sent to sitter (send-booking-notification-no-stripe)
```

## Troubleshooting

### Emails Not Sending
1. Check RESEND_API_KEY is set
2. Verify email domain is verified in Resend
3. Check edge function logs for errors

### Wrong Email Template
1. Verify `stripe_account_enabled` flag in database
2. Check edge function routing logic
3. Review booking creation logs

### Sitter Can't Complete Stripe Setup
1. Direct to `/profile` page
2. Verify Stripe Connect is properly configured
3. Check for browser console errors

## Future Enhancements

1. **Email Reminders:** Send follow-up email if Stripe not completed within 24h
2. **In-App Notifications:** Add dashboard notifications alongside emails
3. **Analytics:** Track conversion rate from email to Stripe completion
4. **Personalization:** Include booking value in subject line for urgency
