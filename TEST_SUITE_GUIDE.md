# Comprehensive Test Suite Guide

## Overview
The comprehensive test suite at `/test-pricing` provides automated testing for all major features of the ZiggySitters platform.

## Test Categories

### 1. Pricing (5 tests)
Tests the core pricing calculation logic:
- **Pet Sitting - Single Pet**: Verifies daily rate × days × 1 pet
- **Pet Sitting - Multiple Pets**: CRITICAL test for per-pet pricing multiplier
- **Dog Walking - Per Pet**: CRITICAL test for hourly rate × hours × pets
- **Drop-in Visits - Flat Rate**: CRITICAL test verifying visits are NOT per-pet
- **Edge Case - Zero Pets**: Validates $0 return (should be blocked by validation)

### 2. Database (4 tests)
Tests database connectivity and structure:
- **Supabase Connection**: Verifies active connection to database
- **Service Type Enum**: Confirms only 4 valid service types exist
- **RLS Policies - Profiles**: Tests Row-Level Security access
- **Public Sitter Profiles View**: Validates public sitter query

### 3. Authentication (2 tests)
Tests user authentication system:
- **User Session Check**: Verifies session state (pass if no session exists)
- **Profile Data Integrity**: Tests profile exists for logged-in users (skipped if not logged in)

### 4. Edge Functions (5 tests)
Validates deployed edge functions:
- **create-booking**: Booking creation logic
- **stripe-connect-onboarding**: Stripe integration
- **Email Notifications**: Booking and daily report emails
- **Payment Processing**: Payment creation and payout processing
- **cleanup-stale-payments**: Automatic cleanup of expired bookings

### 5. Validations (4 tests)
Tests business rule validations:
- **Date Range Validation**: Past dates invalid, future dates valid
- **Pet Count Validation**: 1-10 pets allowed per booking
- **Amount Validation**: $0-$100,000 maximum booking amount
- **Text Field Validation**: Empty strings rejected, max 2000 chars

### 6. UI Components (2 tests)
Tests frontend structure:
- **Core Routes Defined**: Verifies all 13 main routes exist
- **Service Type Labels**: Confirms 4 service labels defined

### 7. Business Logic (3 tests)
Tests core business rules:
- **Platform Fee (10%)**: Validates 10% fee calculation
- **Booking Status Workflow**: Tests 5-stage booking lifecycle
- **Daily Reports Calculation**: Verifies one report per day

## Total Tests: 25

## Pass/Fail Criteria

### Expected Pass Rate
- **With User Logged In**: 100% (25/25 tests should pass)
- **Without User Logged In**: 92% (23/25 tests pass, 2 auth tests skipped)

### Common Issues

#### Failed Tests When Logged Out:
- ❌ **Authentication > User Session Check** - Expected: This will fail if not logged in
- ⚠️ **Authentication > Profile Data Integrity** - Skipped when not logged in

#### Failed Tests When Logged In:
- If any pricing tests fail → Check `BookingDialog.tsx` calculation logic
- If database tests fail → Check Supabase RLS policies
- If auth tests fail → Verify profile table has record for user

## Running Tests

1. Navigate to `/test-pricing`
2. Click "Run All Tests"
3. Review results by category
4. Check individual test details for failures

## Interpreting Results

### Green Badge (PASS)
✓ Test completed successfully and met expectations

### Red Badge (FAIL)
✗ Test failed - check error message for details

### Yellow Badge (PENDING)
⏳ Test was not executed (should not happen after running)

### Statistics
- **Total Tests**: Count of all tests in selected category
- **Passed**: Tests that met success criteria
- **Failed**: Tests that did not meet success criteria
- **Pending**: Tests that were not executed
- **Pass Rate**: Percentage of tests that passed

## Critical Tests

These tests MUST pass for the pricing model to work correctly:

1. ✅ **Pricing > Pet Sitting - 3 Pets, 3 Days** - Per-pet multiplier
2. ✅ **Pricing > Dog Walking - 2 Pets, 3 Hours** - Per-pet hourly
3. ✅ **Pricing > Drop-in Visits - 4 Visits, 3 Pets** - NOT per-pet

If any of these fail, the pricing calculations are broken.

## Debugging Failed Tests

### Pricing Failures
Check `src/components/booking/BookingDialog.tsx` lines 195-237 for calculation logic.

### Database Failures
1. Verify Supabase connection is active
2. Check RLS policies allow the operation
3. Confirm enum types are correct

### Auth Failures
1. Verify user is logged in (check top of test page)
2. Confirm profile exists in database
3. Check auth.users table has matching record

### Edge Function Failures
1. Check deployment status
2. Review edge function logs in Supabase dashboard
3. Verify secrets are configured

## Next Steps After Testing

1. ✅ All tests pass → Ready for production
2. ❌ Some tests fail → Review failed tests and fix issues
3. ⚠️ Tests skipped → Log in to run full suite

## Test Coverage

Current coverage includes:
- ✅ Pricing calculations (all service types)
- ✅ Database connectivity
- ✅ Authentication state
- ✅ Edge function deployment
- ✅ Input validations
- ✅ UI routes and labels
- ✅ Business logic rules

Not covered (manual testing required):
- ❌ Actual Stripe payment processing
- ❌ Email delivery
- ❌ File uploads
- ❌ UI interactions
- ❌ Responsive design
- ❌ Cross-browser compatibility

---

**Last Updated**: After pricing model migration to per-pet rates
**Test Suite Version**: 1.0
**Location**: `/test-pricing`
