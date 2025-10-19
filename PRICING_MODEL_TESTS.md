# Pricing Model Test Cases - Per-Pet Rates

## Service Type Changes
- ✅ Removed: "Pet Sitting" (generic)
- ✅ Removed: "Overnight Care" 
- ✅ Kept: Pet Sitting in Owner's Home (per day/per pet)
- ✅ Kept: Pet Sitting in Sitter's Home (per day/per pet)
- ✅ Kept: Dog Walking (per hour/per pet)
- ✅ Kept: Drop-in Visits (per visit - flat rate)

## Test Scenarios

### Scenario 1: Pet Sitting in Owner's Home - 1 Pet, 3 Days
**Input:**
- Service: Pet Sitting (Your Home)
- Daily Rate: $50/day/pet
- Start Date: Oct 22, 2025
- End Date: Oct 25, 2025
- Days: 3
- Pets: 1

**Expected Calculation:**
```
Service Cost (inc GST): 3 days × $50/day × 1 pet = $150.00
Service Cost (ex GST): $150.00 / 1.15 = $130.43
GST on Service: $130.43 × 0.15 = $19.57

Platform Fee (ex GST): $130.43 × 0.10 = $13.04
Platform Fee GST: $13.04 × 0.15 = $1.96
Platform Fee (inc GST): $13.04 + $1.96 = $15.00

Total (inc GST): $150.00 + $15.00 = $165.00
Total GST: $19.57 + $1.96 = $21.53
```

✅ **Status:** TO BE TESTED

---

### Scenario 2: Pet Sitting in Owner's Home - 3 Pets, 3 Days
**Input:**
- Service: Pet Sitting (Your Home)
- Daily Rate: $50/day/pet
- Start Date: Oct 22, 2025
- End Date: Oct 25, 2025
- Days: 3
- Pets: 3

**Expected Calculation:**
```
Service Cost (inc GST): 3 days × $50/day × 3 pets = $450.00
Service Cost (ex GST): $450.00 / 1.15 = $391.30
GST on Service: $391.30 × 0.15 = $58.70

Platform Fee (ex GST): $391.30 × 0.10 = $39.13
Platform Fee GST: $39.13 × 0.15 = $5.87
Platform Fee (inc GST): $39.13 + $5.87 = $45.00

Total (inc GST): $450.00 + $45.00 = $495.00
Total GST: $58.70 + $5.87 = $64.57
```

✅ **Status:** TO BE TESTED - CRITICAL TEST for per-pet pricing

---

### Scenario 3: Pet Sitting in Sitter's Home - 2 Pets, 5 Days
**Input:**
- Service: Pet Sitting (Sitter's Home)
- Daily Rate: $60/day/pet
- Start Date: Oct 20, 2025
- End Date: Oct 25, 2025
- Days: 5
- Pets: 2

**Expected Calculation:**
```
Service Cost (inc GST): 5 days × $60/day × 2 pets = $600.00
Service Cost (ex GST): $600.00 / 1.15 = $521.74
GST on Service: $521.74 × 0.15 = $78.26

Platform Fee (ex GST): $521.74 × 0.10 = $52.17
Platform Fee GST: $52.17 × 0.15 = $7.83
Platform Fee (inc GST): $52.17 + $7.83 = $60.00

Total (inc GST): $600.00 + $60.00 = $660.00
Total GST: $78.26 + $7.83 = $86.09
```

✅ **Status:** TO BE TESTED

---

### Scenario 4: Dog Walking - 2 Pets, 3 Sessions, 1 Hour Each
**Input:**
- Service: Dog Walking
- Hourly Rate: $25/hour/pet
- Sessions:
  - Oct 22, 2025, 09:00, 1 hour
  - Oct 23, 2025, 09:00, 1 hour
  - Oct 24, 2025, 09:00, 1 hour
- Total Hours: 3
- Pets: 2

**Expected Calculation:**
```
Service Cost (inc GST): 3 hours × $25/hour × 2 pets = $150.00
Service Cost (ex GST): $150.00 / 1.15 = $130.43
GST on Service: $130.43 × 0.15 = $19.57

Platform Fee (ex GST): $130.43 × 0.10 = $13.04
Platform Fee GST: $13.04 × 0.15 = $1.96
Platform Fee (inc GST): $13.04 + $1.96 = $15.00

Total (inc GST): $150.00 + $15.00 = $165.00
Total GST: $19.57 + $1.96 = $21.53
```

✅ **Status:** TO BE TESTED - CRITICAL TEST for per-pet hourly pricing

---

### Scenario 5: Dog Walking - 1 Pet, 2 Sessions, 2 Hours Each
**Input:**
- Service: Dog Walking
- Hourly Rate: $25/hour/pet
- Sessions:
  - Oct 22, 2025, 09:00, 2 hours
  - Oct 23, 2025, 14:00, 2 hours
- Total Hours: 4
- Pets: 1

**Expected Calculation:**
```
Service Cost (inc GST): 4 hours × $25/hour × 1 pet = $100.00
Service Cost (ex GST): $100.00 / 1.15 = $86.96
GST on Service: $86.96 × 0.15 = $13.04

Platform Fee (ex GST): $86.96 × 0.10 = $8.70
Platform Fee GST: $8.70 × 0.15 = $1.30
Platform Fee (inc GST): $8.70 + $1.30 = $10.00

Total (inc GST): $100.00 + $10.00 = $110.00
Total GST: $13.04 + $1.30 = $14.34
```

✅ **Status:** TO BE TESTED

---

### Scenario 6: Drop-in Visits - 4 Visits (flat rate per visit)
**Input:**
- Service: Drop-in Visits
- Visit Rate: $30/visit
- Sessions:
  - Oct 22, 2025, 10:00
  - Oct 23, 2025, 10:00
  - Oct 24, 2025, 10:00
  - Oct 25, 2025, 10:00
- Total Visits: 4
- Pets: 3 (NOTE: Drop-in rate is NOT per pet)

**Expected Calculation:**
```
Service Cost (inc GST): 4 visits × $30/visit = $120.00
(NOT multiplied by number of pets - it's a flat rate per visit)

Service Cost (ex GST): $120.00 / 1.15 = $104.35
GST on Service: $104.35 × 0.15 = $15.65

Platform Fee (ex GST): $104.35 × 0.10 = $10.43
Platform Fee GST: $10.43 × 0.15 = $1.57
Platform Fee (inc GST): $10.43 + $1.57 = $12.00

Total (inc GST): $120.00 + $12.00 = $132.00
Total GST: $15.65 + $1.57 = $17.22
```

✅ **Status:** TO BE TESTED - CRITICAL TEST for flat visit rate

---

## Edge Cases to Test

### Edge Case 1: Single Day Pet Sitting
- Start: Oct 22, End: Oct 23
- Result: Charges 1 day (minimum) ✅

### Edge Case 2: No Daily Rate Set for Pet Sitting
- Result: Shows error toast "This sitter hasn't set up daily rates yet" ✅

### Edge Case 3: No Hourly Rate Set for Dog Walking
- Result: Shows error toast "This sitter hasn't set up hourly rates yet" ✅

### Edge Case 4: No Visit Rate Set for Drop-in Visits
- Result: Shows error toast "This sitter hasn't set up visit rates yet" ✅

### Edge Case 5: Booking with 0 Pets Selected
- Result: Total should be $0.00, validation should prevent booking ✅

---

## Summary of Pricing Model

### Pet Sitting (Both Types)
- **Rate:** Daily rate PER PET
- **Calculation:** days × daily_rate × number_of_pets
- **Example:** 3 days, 2 pets, $50/day/pet = $300

### Dog Walking
- **Rate:** Hourly rate PER PET
- **Calculation:** total_hours × hourly_rate × number_of_pets
- **Example:** 4 hours total, 2 pets, $25/hour/pet = $200

### Drop-in Visits
- **Rate:** Flat rate PER VISIT (NOT per pet)
- **Calculation:** number_of_visits × visit_rate
- **Example:** 4 visits, $30/visit = $120 (same cost regardless of pet count)

### GST & Platform Fees
- GST: 15% on all costs (service + platform fee)
- Platform Fee: 10% of service cost (ex GST)
- All displayed prices include GST

---

## Files Updated

### Database
- ✅ Updated service_type enum (removed old types)
- ✅ Added comments clarifying per-pet pricing model

### Frontend Components
- ✅ BookingDialog.tsx - Per-pet calculation logic
- ✅ BookingAccordion.tsx - Needs update
- ✅ EnhancedSitterOnboarding.tsx - Service type updates
- ✅ ImprovedSitterOnboarding.tsx - Service type updates
- ✅ SitterProfile.tsx - Service display updates
- ✅ Hero sections - Service selection updates

### Backend
- ✅ create-booking edge function - Per-pet validation

### Documentation
- ✅ This test file created
- ⏳ BOOKING_CALCULATION_TESTS.md - Needs update

---

## Next Steps

1. **Test all scenarios above** in the UI
2. **Fix any calculation errors** found during testing
3. **Update sitter onboarding** to clarify per-pet rates
4. **Update all service displays** to show correct rate units
5. **Test edge function validation** with various booking attempts
