# Stripe Connect Onboarding Issues - Comprehensive Analysis

## Executive Summary

**Date**: 2025-10-22  
**Status**: Issues Identified & Diagnostic Tool Created  
**Severity**: High - Blocks sitter onboarding completion

## Reported Issues

1. **Loading Screen Stuck**: Stripe Connect setup initially gets stuck on loading, works on retry
2. **Re-Onboarding After Completion**: System prompts user to go through onboarding again after successful setup
3. **Stripe Setup Not Saved**: Completion state not persisted after "Stripe setup completed" message
4. **Complete Setup Loop**: Profile shows "Complete Setup" even after completion; confirming redirects to onboarding
5. **Terms Re-Prompt**: Users prompted to accept Terms of Use again

## Root Cause Analysis

### Issue 1: Loading Screen Stuck
**Location**: `src/pages/Profile.tsx` (lines 597-636)

**Cause**:
- Stripe Connect URL opens in new tab via `window.open(data.url, '_blank')`
- If pop-up blocked or user closes tab without completing, frontend shows loading indefinitely
- No timeout or error handling for abandoned sessions

**Code**:
```typescript
const handleStripeConnect = async () => {
  setConnectingStripe(true);
  // ... opens window.open(data.url, '_blank')
  // Never sets setConnectingStripe(false) if window is closed
}
```

### Issue 2: Re-Onboarding After Completion
**Location**: `src/components/OnboardingCheck.tsx` (lines 37-52)

**Cause**:
- OnboardingCheck redirects to `/onboarding` if:
  - User is authenticated
  - Profile loaded
  - `needsOnboarding === true`
  - Missing basic info (name, phone, address)
  - Not on excluded path
- After Stripe completion, `onboarding_completed` flag may not be set, causing redirect loop

**Logic Flow**:
```typescript
const hasBasicInfo = profile && profile.first_name && profile.last_name && profile.phone && profile.address;

if (user && !loading && needsOnboarding && !hasBasicInfo && !isExcludedPath) {
  navigate('/onboarding', { replace: true });
}
```

**Problem**: If Stripe completes but `onboarding_completed` isn't set, user gets redirected even with complete profile.

### Issue 3: Stripe Setup Not Saved
**Location**: `src/pages/Profile.tsx` (lines 67-107), `supabase/functions/stripe-connect-webhook/index.ts`

**Cause - Race Condition**:
1. User completes Stripe setup in new tab
2. Stripe redirects to `?stripe_success=true`
3. Profile.tsx tries to update `onboarding_completed`
4. BUT webhook hasn't fired yet to set `stripe_onboarding_completed`
5. Condition check fails:
   ```typescript
   if (hasBasicInfo && hasDocuments && hasServices && !profile.onboarding_completed) {
   ```

**Timing Issue**:
- **Frontend Check** (Profile.tsx line 79): Runs immediately on return
- **Webhook Update** (stripe-connect-webhook): Fires asynchronously, 1-5 seconds later
- **Result**: Frontend checks before webhook updates `stripe_onboarding_completed`

### Issue 4: Complete Setup Loop
**Location**: `src/pages/Profile.tsx` (Payment Tab)

**Cause**:
- Profile page shows "Complete Setup" button if `!stripe_onboarding_completed`
- When user clicks button, it calls `checkStripeStatus()` but doesn't update `onboarding_completed`
- After checking, if all requirements met, should auto-complete but doesn't
- OnboardingCheck then redirects back to onboarding

**Missing Logic**:
```typescript
// In checkStripeStatus - should check and complete onboarding
const checkStripeStatus = async () => {
  // Gets status but doesn't trigger onboarding completion check
  setStripeStatus(data);
  // MISSING: Check if all requirements met and complete onboarding
}
```

### Issue 5: Terms Re-Prompt
**Location**: `src/pages/Onboarding.tsx` (lines 120-133)

**Cause**:
- On every visit to `/onboarding`, code checks `profile.terms_accepted`
- If false, forces user to step 0 (terms acceptance)
- Even if user already onboarded, going back to `/onboarding` triggers this

## Data Flow Analysis

### Onboarding Completion Paths (Multiple competing logics)

**Path 1: Profile.tsx on Stripe Return** (lines 74-106)
```typescript
if (urlParams.get('stripe_success') === 'true') {
  setTimeout(async () => {
    await checkStripeStatus();
    await refetch();
    
    if (hasBasicInfo && hasDocuments && hasServices && !profile.onboarding_completed) {
      await supabase.from('profiles').update({ onboarding_completed: true })
    }
  }, 3000);
}
```

**Path 2: Webhook Handler** (stripe-connect-webhook lines 54-85)
```typescript
if (onboardingCompleted) {
  if (hasBasicInfo && hasDocuments && hasServices) {
    updateData.onboarding_completed = true;
  }
}
```

**Path 3: OnboardingCompletionTracker** (src/components/OnboardingCompletionTracker.tsx)
- Runs on every page except `/onboarding` and `/profile`
- Checks conditions and auto-completes

**Path 4: Onboarding Page** (src/pages/Onboarding.tsx line 331)
```typescript
handleSitterOnboardingComplete() {
  await updateProfile({ onboarding_completed: true });
  navigate('/onboarding-pending-approval');
}
```

**PROBLEM**: 4 different places trying to complete onboarding = race conditions and conflicts

## Database State vs Context State

### ProfileContext Logic (src/contexts/ProfileContext.tsx lines 109-126)

```typescript
const isCompleted = data.onboarding_completed === true;
const needsOnboardingValue = !isCompleted;
setNeedsOnboarding(needsOnboardingValue);
```

**Issue**: If database has `onboarding_completed = false` but user has completed everything:
- Context sets `needsOnboarding = true`
- OnboardingCheck redirects to `/onboarding`
- Loop continues

## Webhook Configuration Status

**Critical**: Stripe webhooks must be configured for these events:
- `account.updated`
- `account.external_account.created`
- `account.application.authorized`
- `account.application.deauthorized`

**Webhook URL**: `https://qermxzepyzbenemcordv.supabase.co/functions/v1/stripe-connect-webhook`

**If not configured**: `stripe_onboarding_completed` never gets set, breaking entire flow.

## Test Suite Created

**File**: `src/components/testing/StripeOnboardingTestSuite.tsx`  
**Access**: `/stripe-onboarding-tests`

### 20 Comprehensive Test Cases Implemented:

#### Tests 1-10: Core Onboarding Validation
1. **Profile Data Integrity**: Verifies all required fields present
2. **Sitter Services Configuration**: Checks if services configured
3. **Stripe Account Status**: Verifies Stripe account exists in DB
4. **Stripe Account Status via API**: Real-time check via edge function
5. **Onboarding Completion Flag**: Database vs Context sync check
6. **Complete Onboarding Requirements**: All requirements validation
7. **Terms Acceptance**: Confirms terms accepted
8. **Onboarding Redirect Logic**: Simulates OnboardingCheck logic
9. **Profile Context State**: Checks if context is up-to-date
10. **Stripe Return URL Handling**: Validates URL parameter handling

#### Tests 11-15: Data Persistence Verification
11. **Step 1: Basic Profile Data Persistence**: Verifies first_name, last_name, phone, address, suburb saved in DB
12. **Step 2: Services Data Persistence (Sitter)**: Confirms sitter_services records exist with valid rates and preferences
13. **Step 3: Pet Data Persistence (Owner)**: Verifies pets table has owner's pet records
14. **Step 4: Verification Documents Persistence**: Checks ID and police vet documents saved with timestamps
15. **Step 5: Stripe Account Link Persistence**: Confirms stripe_account_id and flags saved correctly

#### Tests 16-18: Loop Prevention Checks
16. **Loop Prevention: Onboarding Flag Consistency**: Detects DB vs Context mismatches that cause loops
17. **Loop Prevention: Terms Acceptance Check**: Prevents re-prompting of accepted terms
18. **Loop Prevention: Profile Completion Requirements**: Validates all requirements vs completion flag consistency

#### Tests 19-20: Race Condition Detection
19. **Race Condition: Context vs Database Freshness**: Identifies stale context state
20. **Race Condition: Stripe Webhook Sync**: Verifies webhook has properly updated profile flags

### Test Features:
- ✅ Detailed diagnostics for each test with risk levels
- ✅ Shows exact state mismatches between DB and context
- ✅ Identifies missing or incomplete data at each step
- ✅ Detects potential infinite loop conditions
- ✅ Highlights race condition risks
- ✅ Provides force complete/reset buttons
- ✅ JSON details for debugging

## Recommendations

### Immediate Fixes Needed:

1. **Consolidate Onboarding Completion Logic**
   - Remove duplicate completion checks from Profile.tsx
   - Let webhook handler be the source of truth
   - Add explicit completion trigger in Profile when user confirms

2. **Fix Race Condition**
   - Add longer delay (5-10 seconds) after Stripe return
   - OR implement polling: check status every 2 seconds until webhook fires
   - OR show "Processing..." message while waiting for webhook

3. **Add Stripe Connect Timeout**
   - Set 60-second timeout in `handleStripeConnect()`
   - Reset loading state if no return detected

4. **Improve OnboardingCheck Logic**
   - Add more specific checks: if `stripe_account_id` exists, don't redirect
   - Trust `onboarding_completed` flag more than field checks

5. **Profile Confirm Button**
   - When user clicks confirm, trigger onboarding completion check
   - Update `onboarding_completed` if all requirements met

### Verification Checklist:

- [ ] Stripe webhook configured in Stripe Dashboard
- [ ] Webhook secret set in Supabase secrets
- [ ] Test webhook endpoint responds correctly
- [ ] Profile completion logic consolidated
- [ ] Race condition fixed with polling or delay
- [ ] Timeout added to Stripe Connect flow
- [ ] Profile confirm button triggers completion

## Testing Instructions

1. **Access Test Suite**: Navigate to `/stripe-onboarding-tests`
2. **Run All Tests**: Click "Run All Tests" button
3. **Review Results**: Check which tests fail
4. **Check Details**: Expand failed tests to see exact issues
5. **Use Force Complete**: If all requirements met but flag not set, use "Force Complete Onboarding"

## Current State (As of Analysis)

**User**: Petsitter1  
**Status**: All requirements completed but `onboarding_completed = false`  
**Stripe Setup**: Completed successfully  
**Documents**: Uploaded  
**Services**: Configured  
**Issue**: System not recognizing completion

## Next Steps

1. Run test suite on Petsitter1 account
2. Identify which specific checks are failing
3. Apply appropriate fix based on test results
4. Verify no redirect loops occur
5. Test complete flow end-to-end
