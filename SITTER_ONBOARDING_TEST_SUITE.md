# Sitter Onboarding Test Suite

## Purpose
This test suite verifies that the sitter onboarding flow does NOT create infinite loops and properly marks onboarding as complete, allowing sitters to access the rest of the application.

## Critical Flow Components

### 1. OnboardingCheck Component
- **Location**: `src/components/OnboardingCheck.tsx`
- **Purpose**: Redirects users without basic info to `/onboarding`
- **Key Logic**: Only redirects if `needsOnboarding = true` AND user lacks basic info (name, phone, address)

### 2. ProfileContext
- **Location**: `src/contexts/ProfileContext.tsx`
- **Purpose**: Manages `needsOnboarding` state
- **Key Logic**: Sets `needsOnboarding = false` when `onboarding_completed = true` in database

### 3. Onboarding Page
- **Location**: `src/pages/Onboarding.tsx`
- **Purpose**: Main onboarding flow controller
- **Key Logic**: Calls `handleSitterOnboardingComplete()` which:
  1. Updates `onboarding_completed = true` in database
  2. Updates ProfileContext state
  3. Navigates to `/onboarding-pending-approval`

### 4. ImprovedSitterOnboarding
- **Location**: `src/components/onboarding/ImprovedSitterOnboarding.tsx`
- **Purpose**: 5-step sitter onboarding form
- **Key Logic**: Calls `onComplete(profileId)` when user completes all steps

## Test Cases

### Test Case 1: Complete Onboarding - Happy Path
**Steps:**
1. New sitter signs up
2. Fills out all 3 onboarding steps (role, basic info, sitter details)
3. Completes all 5 sitter-specific steps (experience, services, availability, docs, payment)
4. Clicks "Complete Onboarding"

**Expected Result:**
- `onboarding_completed` set to `true` in database
- Redirected to `/onboarding-pending-approval`
- No redirect back to `/onboarding`
- Can navigate to other pages without being redirected

**Potential Loop Points:**
- ❌ If `onboarding_completed` not saved to database
- ❌ If ProfileContext not updated after save
- ❌ If OnboardingCheck still shows `needsOnboarding = true`

### Test Case 2: Stripe Setup and Return
**Steps:**
1. Sitter at step 5 (Payment Setup)
2. Clicks "Connect Bank Account with Stripe"
3. Completes Stripe onboarding
4. Returns via `return_url` with `?stripe_success=true`

**Expected Result:**
- Returns to `/onboarding?stripe_success=true`
- Shows success toast
- Stays on onboarding page (step 5)
- Can click "Complete Onboarding"
- No infinite redirect loop

**Potential Loop Points:**
- ✅ Fixed: Now returns to `/onboarding` instead of `/profile`
- ❌ If OnboardingCheck redirects immediately on return
- ❌ If URL params trigger unwanted navigation

### Test Case 3: Refresh Page During Onboarding
**Steps:**
1. Sitter on step 3 of 5
2. Refreshes browser (F5)

**Expected Result:**
- Stays on `/onboarding` page
- Returns to same step (via localStorage)
- Can continue and complete onboarding
- No redirect loop

**Potential Loop Points:**
- ❌ If localStorage not preserved
- ❌ If ProfileContext refetches and triggers redirect
- ❌ If step resets to 1

### Test Case 4: Direct URL Access to Onboarding When Incomplete
**Steps:**
1. Sitter with incomplete onboarding
2. Types `/onboarding` directly in browser
3. Lands on onboarding page

**Expected Result:**
- Loads onboarding page normally
- Shows correct step
- Can complete onboarding
- No redirect away

**Potential Loop Points:**
- ❌ If OnboardingCheck tries to redirect while already on `/onboarding`

### Test Case 5: Direct URL Access to Onboarding When Complete
**Steps:**
1. Sitter with `onboarding_completed = true`
2. Types `/onboarding` directly in browser

**Expected Result:**
- **Option A**: Redirects to `/onboarding-pending-approval` or `/`
- **Option B**: Shows "Already completed" message
- Does NOT allow re-doing onboarding

**Potential Loop Points:**
- ❌ If allowed to re-do onboarding
- ❌ If no protection against accessing `/onboarding`

### Test Case 6: Logout and Login After Completion
**Steps:**
1. Complete onboarding successfully
2. Logout
3. Login again

**Expected Result:**
- `onboarding_completed = true` persists
- `needsOnboarding = false`
- Not redirected to `/onboarding`
- Can access all pages normally

**Potential Loop Points:**
- ❌ If database value not persisted
- ❌ If ProfileContext resets incorrectly
- ❌ If localStorage override database value

### Test Case 7: Navigate Away Before Completion
**Steps:**
1. Sitter on step 3 of 5
2. Manually navigates to `/profile` or `/`
3. Returns to site

**Expected Result:**
- OnboardingCheck redirects back to `/onboarding`
- Resumes at saved step (via localStorage)
- Can complete onboarding

**Potential Loop Points:**
- ❌ If redirect happens continuously
- ❌ If step progress lost

### Test Case 8: Skip Steps Using Browser Back/Forward
**Steps:**
1. Sitter on step 3
2. Uses browser back button
3. Then forward button
4. Tries to complete onboarding

**Expected Result:**
- Step navigation controlled by component
- Cannot skip required fields
- Validation blocks completion if incomplete

**Potential Loop Points:**
- ❌ If browser history causes step confusion
- ❌ If can skip to step 5 without data

### Test Case 9: Multiple Browser Tabs
**Steps:**
1. Open `/onboarding` in Tab A
2. Open `/onboarding` in Tab B
3. Complete in Tab A
4. Switch to Tab B

**Expected Result:**
- Tab A: Redirected to `/onboarding-pending-approval`
- Tab B: Should detect completion (after refresh) and redirect
- No conflict between tabs

**Potential Loop Points:**
- ❌ If localStorage causes race condition
- ❌ If both tabs try to update simultaneously

### Test Case 10: Server Delay or Error on Completion
**Steps:**
1. Complete all 5 steps
2. Click "Complete Onboarding"
3. Simulate network delay or error (dev tools)

**Expected Result:**
- Shows loading state
- Shows error message if fails
- Allows retry
- Does NOT navigate away if error
- Does NOT loop between pages

**Potential Loop Points:**
- ❌ If navigates before database update confirms
- ❌ If partial update (context yes, DB no)
- ❌ If retry causes duplicate updates

### Test Case 11: Admin Account Onboarding
**Steps:**
1. Admin user (`admin@ziggysitters.com`) logs in
2. Check if redirected to onboarding

**Expected Result:**
- Admin automatically has `onboarding_completed = true`
- `needsOnboarding = false`
- No redirect to onboarding
- Full access to admin dashboard

**Potential Loop Points:**
- ❌ If admin treated as regular user
- ❌ If admin redirect to onboarding

### Test Case 12: Incomplete Stripe Setup
**Steps:**
1. Complete all steps EXCEPT Stripe connection
2. Click "Complete Onboarding" (skip Stripe when prompted)

**Expected Result:**
- Shows confirmation dialog
- If confirmed, completes onboarding
- Redirected to `/onboarding-pending-approval`
- Can set up Stripe later from profile
- No loop back to onboarding

**Potential Loop Points:**
- ❌ If blocked from completing without Stripe
- ❌ If redirects back to onboarding

### Test Case 13: Document Upload Only
**Steps:**
1. Upload only ID document (not blue card)
2. Try to complete onboarding

**Expected Result:**
- Allowed to complete (at least one doc required)
- Onboarding marked complete
- No loop

**Potential Loop Points:**
- ❌ If validation blocks completion
- ❌ If stuck on verification step

### Test Case 14: Empty Bio/Experience
**Steps:**
1. Skip optional fields (bio, experience years)
2. Complete required fields only
3. Complete onboarding

**Expected Result:**
- Allowed to complete
- Onboarding marked complete
- No validation errors for optional fields

**Potential Loop Points:**
- ❌ If optional fields treated as required
- ❌ If blocks completion

### Test Case 15: Race Condition - Quick Clicks
**Steps:**
1. Complete all steps
2. Rapidly click "Complete Onboarding" multiple times

**Expected Result:**
- Only processes once (loading state prevents duplicates)
- Single database update
- Single navigation
- No duplicate entries

**Potential Loop Points:**
- ❌ If multiple updates to database
- ❌ If navigation happens multiple times
- ❌ If creates inconsistent state

## Key Assertions for Each Test

For each test case, verify:

1. **Database State**
   ```sql
   SELECT onboarding_completed, stripe_account_enabled 
   FROM profiles 
   WHERE user_id = '<test_user_id>';
   ```
   - `onboarding_completed` should be `true` after completion

2. **Context State**
   ```javascript
   console.log('needsOnboarding:', needsOnboarding);
   ```
   - Should be `false` after completion

3. **URL/Navigation**
   ```javascript
   console.log('Current URL:', window.location.pathname);
   ```
   - Should NOT keep redirecting to `/onboarding`
   - Should be on `/onboarding-pending-approval` after completion

4. **LocalStorage**
   ```javascript
   console.log('Saved step:', localStorage.getItem('onboarding_step'));
   console.log('Saved data:', localStorage.getItem('onboarding_data'));
   ```
   - Should be cleared after completion

## Automated Test Implementation

To implement these as automated tests:

```typescript
// Example test structure
describe('Sitter Onboarding Flow', () => {
  it('TC1: Complete onboarding - happy path', async () => {
    // Setup
    const user = await createTestSitter();
    
    // Navigate through steps
    await completeRoleSelection('pet_sitter');
    await completeBasicInfo({ name, phone, address });
    await completeSitterSteps({
      experience: { bio: 'Test', years: 5 },
      services: [{ type: 'dog_walking', hourly_rate: 20 }],
      availability: [],
      documents: { id: 'url1', blue_card: 'url2' },
      payment: { skipStripe: true }
    });
    
    // Complete onboarding
    await clickCompleteOnboarding();
    
    // Assertions
    expect(window.location.pathname).toBe('/onboarding-pending-approval');
    
    const profile = await getProfileFromDB(user.id);
    expect(profile.onboarding_completed).toBe(true);
    
    const { needsOnboarding } = useProfile();
    expect(needsOnboarding).toBe(false);
    
    // Navigate away and back
    await navigate('/');
    expect(window.location.pathname).toBe('/'); // Should NOT redirect
  });
  
  // Add similar tests for all 15 test cases
});
```

## Loop Detection Checklist

When investigating a suspected loop, check:

- [ ] Database `onboarding_completed` value
- [ ] ProfileContext `needsOnboarding` state
- [ ] OnboardingCheck redirect logic
- [ ] Current URL and search params
- [ ] localStorage values
- [ ] Browser console for redirect logs
- [ ] Network tab for repeated API calls
- [ ] React DevTools component state

## Known Issues to Watch

1. **Stripe Return URL**: Previously caused loop by returning to `/profile` which redirected to `/onboarding` ✅ FIXED
2. **Context State Sync**: If ProfileContext doesn't update after database save
3. **Race Conditions**: Multiple rapid clicks or tab conflicts
4. **localStorage Persistence**: Cached values overriding database

## Success Criteria

The onboarding flow is loop-free when:
- ✅ All 15 test cases pass
- ✅ No user reports being stuck in onboarding
- ✅ Database and context state stay synchronized
- ✅ Can complete onboarding and access full site
- ✅ Stripe integration doesn't cause redirects
