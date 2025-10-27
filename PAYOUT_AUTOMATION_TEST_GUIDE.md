# Payout Automation Test Guide

## Overview

This comprehensive test suite validates the automated booking completion and payout processing system to ensure:
- Bookings are automatically completed after their end date
- Payouts are processed correctly with appropriate penalties for incomplete daily reports
- All financial calculations are accurate (platform fees, Stripe fees, GST, penalties)
- Transactions are properly recorded
- Sitters receive the correct payout amounts

## Access the Test Suite

Navigate to: **`/test-payout-automation`**

## What Gets Tested

### 1. Database Function Tests
- ✅ `auto_complete_bookings()` function exists and is accessible
- ✅ Function can properly mark in-progress bookings as completed

### 2. Edge Function Tests  
- ✅ `auto-process-payouts` edge function is deployed
- ✅ `process-booking-payout` edge function is deployed
- ✅ Functions validate input parameters correctly

### 3. Booking Status Tests
- ✅ Finds completed bookings requiring payout
- ✅ Identifies in-progress bookings past their end date
- ✅ Verifies booking status transitions

### 4. Financial Calculation Tests
- ✅ **Penalty Calculation**: 15% of total amount for incomplete daily reports
- ✅ **Stripe Fee Calculation**: 2.9% + $0.30 per transaction
- ✅ **GST Extraction**: Calculates GST component from platform fee (fee / 1.15 × 0.15)
- ✅ **Net Payout**: Total - Platform Fee - Stripe Fee - Penalty

### 5. Daily Reports Tests
- ✅ Identifies bookings with daily report requirements
- ✅ Calculates report completion rates
- ✅ Flags bookings that should have penalties applied

### 6. Transaction Recording Tests
- ✅ Verifies transactions table structure
- ✅ Checks transaction recording functionality
- ✅ Validates transaction metadata

### 7. Stripe Integration Tests
- ✅ Verifies sitter Stripe accounts are configured
- ✅ Checks if Stripe accounts are enabled
- ✅ Validates Stripe Connect setup

### 8. Scheduled Jobs Tests
- ✅ Confirms cron job configuration
- ✅ Validates job execution times

### 9. Complete Flow Simulation
- ✅ Simulates entire payout process
- ✅ Calculates expected outcomes
- ✅ Identifies potential issues

### 10. **Critical Verification Tests** (Added for Julia/Jana Issue)
- ✅ **Email Verification**: Checks all daily reports have `email_sent_at` populated
- ✅ **Stripe Transfer Verification**: Ensures all payouts have `stripe_transfer_id`
- ✅ **Penalty Application**: Verifies bookings with incomplete reports have `penalty_applied=true`
- ✅ **Transaction Metadata**: Validates GST amount, platform earnings, and booking reference are recorded

## Test Results Interpretation

### ✅ Passed Tests (Green)
- Test executed successfully
- All validations passed
- System working as expected

### ❌ Failed Tests (Red)
- Test encountered an error
- Issue needs to be addressed
- Check error message and details for debugging

### ⏱️ Running Tests (Blue)
- Test is currently executing
- Please wait for completion

### ⚠️ Warnings (Yellow)
- Test passed but found potential issues
- Review warning messages
- May indicate configuration needed

## Example Financial Calculation

For a $180 booking:
```
Total Amount:     $180.00
Platform Fee:     $ 18.00 (10%)
  - GST in Fee:   $  2.35 (extracted from platform fee)
Stripe Fee:       $  5.52 (2.9% + $0.30)
Penalty (15%):    $ 27.00 (if reports incomplete)

Sitter Receives:  $156.48 (no penalty)
                  $129.48 (with penalty)
                  
Owner Refund:     $ 27.00 (penalty amount)
```

## Automated Process Flow

### Daily at 1:00 AM (NZST)
**Step 1: Auto-Complete Bookings**
- Database function `auto_complete_bookings()` runs
- Finds all `in_progress` bookings where `end_date < today`
- Updates status from `in_progress` → `completed`

### Daily at 2:00 AM (NZST)  
**Step 2: Process Payouts**
- Edge function `auto-process-payouts` runs
- Finds all `completed` bookings with `payment_status = 'paid'`
- For each booking:
  1. Checks daily report requirements
  2. Calculates penalty if reports incomplete (15%)
  3. Creates Stripe refund for penalty amount
  4. Updates booking with penalty info
  5. Records transaction
  6. Marks as `paid_out`

## Manual Testing

You can manually trigger the automated process:

### 1. Complete a Booking Manually
```sql
UPDATE bookings
SET status = 'completed'
WHERE id = 'your-booking-id'
  AND status = 'in_progress'
  AND end_date < CURRENT_DATE;
```

### 2. Trigger Payout Processing
Use the Admin Dashboard > Payouts tab to manually process a specific booking's payout.

### 3. Run Full Automation
Call the edge function directly:
```javascript
const { data, error } = await supabase.functions.invoke('auto-process-payouts', {
  body: {}
});
```

## Common Issues & Solutions

### Issue: "No completed bookings found"
**Solution**: Create test bookings and mark them as completed, or wait for existing bookings to reach their end date.

### Issue: "Sitter Stripe account not found"
**Solution**: Ensure the sitter has completed Stripe Connect onboarding in Profile > Payments.

### Issue: "Edge function not found"
**Solution**: Edge functions deploy automatically. Wait for deployment to complete or check deployment logs.

### Issue: "Permission denied on auto_complete_bookings"
**Solution**: This is expected for non-admin users. The function runs via cron jobs with elevated permissions.

### Issue: Penalties not being applied
**Solution**: Check that:
- `requires_daily_reports = true` on the booking
- `daily_reports_completed < daily_reports_required`
- `penalty_applied = false` (not already applied)

## Validation Checklist

Before going live, ensure:

- [ ] All 16 tests pass
- [ ] Cron jobs are scheduled correctly
- [ ] Sitters have Stripe accounts configured
- [ ] Daily reports are being tracked accurately
- [ ] **Daily report emails are being sent** (email_sent_at populated)
- [ ] **Transaction recording is working with Stripe transfer IDs**
- [ ] **Penalties are applied to bookings with incomplete reports**
- [ ] **Transaction metadata includes GST and platform earnings**
- [ ] Penalty emails are being sent
- [ ] Refunds are processing correctly
- [ ] Platform fees are calculated correctly

## Monitoring Recommendations

### Daily Checks
1. Run test suite to verify system health
2. Check Supabase Dashboard > Database > Cron Jobs for execution status
3. Review edge function logs for errors
4. Verify transactions are being recorded

### Weekly Checks
1. Audit random payouts for accuracy
2. Verify penalty calculations on incomplete bookings
3. Check for any stuck bookings (not completing or paying out)
4. Review Stripe dashboard for payout discrepancies

## Support

If tests consistently fail or you encounter issues:

1. **Check Edge Function Logs**: Supabase Dashboard > Edge Functions > Logs
2. **Review Database Logs**: Supabase Dashboard > Logs
3. **Check Cron Job Status**: Supabase Dashboard > Database > Cron Jobs
4. **Verify Stripe Configuration**: Ensure all Stripe accounts are properly set up

## Technical Details

### Database Function
- **Function**: `auto_complete_bookings()`
- **Executes**: Via pg_cron daily at 1 AM
- **Purpose**: Automatically completes bookings past their end date

### Edge Functions
- **Function 1**: `auto-process-payouts`
  - Finds all completed bookings needing payout
  - Calls process-booking-payout for each
  
- **Function 2**: `process-booking-payout`
  - Handles individual booking payout
  - Calculates penalties
  - Creates Stripe refunds
  - Records transactions

### Scheduled Jobs
```sql
-- Job 1: Complete bookings
cron.schedule('auto-complete-bookings-daily', '0 1 * * *', ...)

-- Job 2: Process payouts  
cron.schedule('auto-process-payouts-daily', '0 2 * * *', ...)
```
