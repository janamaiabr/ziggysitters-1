# Email Functions Inventory & Test Status

## All Email-Sending Edge Functions

### 1. **send-auth-email** ✅
- **Purpose**: Handles authentication emails (magic link, signup confirmation, password reset)
- **Trigger**: Automatic via Supabase Auth hooks
- **Recipients**: Users signing up/logging in
- **Templates**: 
  - Magic Link
  - Confirm Signup
  - Reset Password
  - Change Email
- **From**: `ZiggySitters <onboarding@resend.dev>`

---

### 2. **send-welcome-email** ✅
- **Purpose**: Welcome email after user registration
- **Trigger**: After user signs up
- **Recipients**: New users
- **Parameters**: `user_email`, `user_name`
- **From**: `ZiggySitters <onboarding@resend.dev>`

---

### 3. **send-booking-notification** ✅
- **Purpose**: Notify sitter of new booking request
- **Trigger**: When pet owner creates a booking
- **Recipients**: Sitter
- **Parameters**: 
  - `sitter_email`
  - `sitter_name`
  - `owner_name`
  - `service_type`
  - `start_date`
  - `end_date`
  - `booking_reference`
- **From**: `Ziggy Sitters <notifications@ziggysitters.com>`

---

### 4. **send-booking-notification-no-stripe** ✅
- **Purpose**: Alternative booking notification (non-Stripe flow)
- **Trigger**: Booking creation without Stripe
- **Recipients**: Sitter
- **Parameters**: Same as send-booking-notification
- **From**: `Ziggy Sitters <notifications@ziggysitters.com>`

---

### 5. **send-booking-acceptance-email** ⚠️ FIXED
- **Purpose**: Notify owner that sitter accepted booking
- **Trigger**: When sitter accepts booking
- **Recipients**: Pet owner
- **Parameters**: 
  - `owner_email`
  - `owner_name`
  - `sitter_name`
  - `service_type`
  - `start_date`
  - `end_date`
  - `booking_reference`
  - `total_amount`
- **From**: `Ziggy Sitters <notifications@ziggysitters.com>`
- **Status**: Fixed parameter mismatch

---

### 6. **send-booking-decline-notification** ✅
- **Purpose**: Notify owner that sitter declined booking
- **Trigger**: When sitter declines booking
- **Recipients**: Pet owner
- **Parameters**:
  - `owner_email`
  - `owner_name`
  - `sitter_name`
  - `service_type`
  - `start_date`
  - `end_date`
  - `booking_reference`
- **From**: `Ziggy Sitters <notifications@ziggysitters.com>`

---

### 7. **send-booking-cancellation** ✅
- **Purpose**: Notify about booking cancellation
- **Trigger**: When booking is cancelled
- **Recipients**: Owner or Sitter
- **Parameters**:
  - `recipient_email`
  - `recipient_name`
  - `booking_reference`
  - `service_type`
  - `start_date`
  - `end_date`
  - `cancellation_reason`
- **From**: `Ziggy Sitters <notifications@ziggysitters.com>`

---

### 8. **send-admin-booking-notification** ✅
- **Purpose**: Notify admin of new bookings
- **Trigger**: New booking created
- **Recipients**: Admin (`admin@ziggysitters.com`)
- **Parameters**:
  - `owner_name`
  - `sitter_name`
  - `service_type`
  - `start_date`
  - `end_date`
  - `booking_reference`
  - `total_amount`
- **From**: `Ziggy Sitters <notifications@ziggysitters.com>`

---

### 9. **send-contact-email** ✅
- **Purpose**: Handle contact form submissions
- **Trigger**: Contact form submission
- **Recipients**: 
  - User (confirmation)
  - Admin (notification)
- **Parameters**:
  - `name`
  - `email`
  - `message`
- **From**: `ZiggySitters <onboarding@resend.dev>`

---

### 10. **send-daily-report-email** ✅
- **Purpose**: Send daily pet care reports to owners
- **Trigger**: Sitter submits daily report
- **Recipients**: Pet owner
- **Parameters**:
  - `owner_email`
  - `owner_name`
  - `pet_name`
  - `report_date`
  - `sitter_name`
  - Report details (food, exercise, mood, etc.)
- **From**: `ZiggySitters <reports@ziggysitters.co.nz>`

---

### 11. **send-daily-report-reminder** ✅
- **Purpose**: Remind sitter to submit daily report
- **Trigger**: Scheduled (for active bookings)
- **Recipients**: Sitter
- **Parameters**:
  - `sitter_email`
  - `sitter_name`
  - `booking_reference`
  - `pet_name`
  - `report_date`
- **From**: `ZiggySitters <reminders@resend.dev>`

---

### 12. **send-verification-request-email** ✅
- **Purpose**: Notify admin & user about verification document upload
- **Trigger**: User uploads verification documents
- **Recipients**: 
  - Admin (review request)
  - User (confirmation)
- **Parameters**:
  - `user_id`
  - `documents_uploaded`
- **From**: `ZiggySitters <noreply@ziggysitters.com>`

---

### 13. **send-verification-update** ✅
- **Purpose**: Notify user of verification status change
- **Trigger**: Admin approves/rejects verification
- **Recipients**: User
- **Parameters**:
  - `user_email`
  - `user_name`
  - `verification_status` (approved/rejected)
  - `rejection_reason` (if rejected)
- **From**: `Ziggy Sitters <notifications@ziggysitters.com>`

---

### 14. **send-go-live-notification** ✅
- **Purpose**: Notify admin when ready to go live
- **Trigger**: Manual trigger
- **Recipients**: Admin
- **Parameters**: None specific
- **From**: `ZiggySitters <onboarding@resend.dev>`

---

### 15. **send-onboarding-reminder** ✅
- **Purpose**: Remind users to complete onboarding
- **Trigger**: Scheduled/manual
- **Recipients**: Users with incomplete onboarding
- **Parameters**: User details
- **From**: `ZiggySitters <onboarding@resend.dev>`

---

### 16. **send-penalty-notification** ✅
- **Purpose**: Notify sitter about penalties
- **Trigger**: Penalty applied
- **Recipients**: Sitter
- **Parameters**:
  - `sitter_email`
  - `sitter_name`
  - `booking_reference`
  - `penalty_amount`
  - `penalty_reason`
- **From**: `ZiggySitters <notifications@ziggysitters.co.nz>`

---

### 17. **send-police-vet-reminder** ✅
- **Purpose**: Remind user to complete police vetting
- **Trigger**: Manual/scheduled
- **Recipients**: User
- **Parameters**:
  - `user_email`
  - `user_name`
- **From**: `ZiggySitters <onboarding@resend.dev>`

---

## Common Issues Found

### ✅ Fixed Issues
1. **send-booking-acceptance-email**: Parameter mismatch fixed
   - Was sending: `bookingId`, `ownerEmail`, etc. (camelCase)
   - Expected: `owner_email`, `owner_name`, etc. (snake_case)

### ⚠️ Potential Issues to Check

1. **Domain Configuration**
   - Multiple "from" addresses used:
     - `onboarding@resend.dev` (Resend test domain)
     - `notifications@ziggysitters.com`
     - `reports@ziggysitters.co.nz`
     - `noreply@ziggysitters.com`
   - **Action Required**: Verify all domains in Resend dashboard

2. **Inconsistent Email Domains**
   - `.com` vs `.co.nz` domains
   - **Recommendation**: Standardize to one domain

---

## Testing Checklist

- [ ] Verify Resend API key is set
- [ ] Verify all sending domains in Resend dashboard
- [ ] Test each email function with sample data
- [ ] Check email deliverability
- [ ] Verify email templates render correctly
- [ ] Test error handling for failed sends
- [ ] Check spam folder for test emails

---

## Next Steps

1. **Domain Verification**: Ensure all email domains are verified in Resend
2. **Test Suite**: Create automated tests for each email function
3. **Monitoring**: Set up logging/monitoring for email delivery
4. **Templates**: Consider using React Email for consistent templates
