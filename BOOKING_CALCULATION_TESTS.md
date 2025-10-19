# Booking Cost Calculation Test Results

## Test Scenarios for All Service Types

### Scenario 1: Pet Sitting (Owner's Home) - 2 Nights
**Input:**
- Service: Pet Sitting (Your Home)
- Overnight Rate: $84/night
- Start Date: Oct 22, 2025
- End Date: Oct 24, 2025
- Nights: 2

**Expected Calculation:**
```
Service Cost (inc GST): 2 nights × $84 = $168.00
Service Cost (ex GST): $168.00 / 1.15 = $146.09
GST on Service: $146.09 × 0.15 = $21.91

Platform Fee (ex GST): $146.09 × 0.10 = $14.61
Platform Fee GST: $14.61 × 0.15 = $2.19
Platform Fee (inc GST): $14.61 + $2.19 = $16.80

Total (inc GST): $168.00 + $16.80 = $184.80
Total GST: $21.91 + $2.19 = $24.10
```

✅ **Status:** CORRECT - Fixed calculation uses nights (not days/hours)

---

### Scenario 2: Pet Sitting (Sitter's Home) - 3 Nights
**Input:**
- Service: Pet Sitting (Sitter's Home)
- Overnight Rate: $70/night
- Start Date: Oct 22, 2025
- End Date: Oct 25, 2025
- Nights: 3

**Expected Calculation:**
```
Service Cost (inc GST): 3 nights × $70 = $210.00
Service Cost (ex GST): $210.00 / 1.15 = $182.61
GST on Service: $182.61 × 0.15 = $27.39

Platform Fee (ex GST): $182.61 × 0.10 = $18.26
Platform Fee GST: $18.26 × 0.15 = $2.74
Platform Fee (inc GST): $18.26 + $2.74 = $21.00

Total (inc GST): $210.00 + $21.00 = $231.00
Total GST: $27.39 + $2.74 = $30.13
```

✅ **Status:** CORRECT

---

### Scenario 3: Dog Walking - 2 Hours (Same Day)
**Input:**
- Service: Dog Walking
- Hourly Rate: $25/hour
- Date: Oct 22, 2025
- Start Time: 09:00 AM
- End Time: 11:00 AM
- Hours: 2

**Expected Calculation:**
```
Service Cost (inc GST): 2 hours × $25 = $50.00
Service Cost (ex GST): $50.00 / 1.15 = $43.48
GST on Service: $43.48 × 0.15 = $6.52

Platform Fee (ex GST): $43.48 × 0.10 = $4.35
Platform Fee GST: $4.35 × 0.15 = $0.65
Platform Fee (inc GST): $4.35 + $0.65 = $5.00

Total (inc GST): $50.00 + $5.00 = $55.00
Total GST: $6.52 + $0.65 = $7.17
```

✅ **Status:** CORRECT

---

### Scenario 4: Drop-in Visit - 1 Hour
**Input:**
- Service: Drop-in Visits
- Hourly Rate: $30/hour
- Date: Oct 22, 2025
- Start Time: 14:00 (2:00 PM)
- End Time: 15:00 (3:00 PM)
- Hours: 1

**Expected Calculation:**
```
Service Cost (inc GST): 1 hour × $30 = $30.00
Service Cost (ex GST): $30.00 / 1.15 = $26.09
GST on Service: $26.09 × 0.15 = $3.91

Platform Fee (ex GST): $26.09 × 0.10 = $2.61
Platform Fee GST: $2.61 × 0.15 = $0.39
Platform Fee (inc GST): $2.61 + $0.39 = $3.00

Total (inc GST): $30.00 + $3.00 = $33.00
Total GST: $3.91 + $0.39 = $4.30
```

✅ **Status:** CORRECT

---

### Scenario 5: Pet Sitting - 1 Night (Minimum)
**Input:**
- Service: Pet Sitting (Owner's Home)
- Overnight Rate: $100/night
- Start Date: Oct 22, 2025
- End Date: Oct 23, 2025
- Nights: 1

**Expected Calculation:**
```
Service Cost (inc GST): 1 night × $100 = $100.00
Service Cost (ex GST): $100.00 / 1.15 = $86.96
GST on Service: $86.96 × 0.15 = $13.04

Platform Fee (ex GST): $86.96 × 0.10 = $8.70
Platform Fee GST: $8.70 × 0.15 = $1.30
Platform Fee (inc GST): $8.70 + $1.30 = $10.00

Total (inc GST): $100.00 + $10.00 = $110.00
Total GST: $13.04 + $1.30 = $14.34
```

✅ **Status:** CORRECT

---

### Scenario 6: Dog Walking - 30 Minutes (Minimum 1 Hour Applies)
**Input:**
- Service: Dog Walking
- Hourly Rate: $25/hour
- Date: Oct 22, 2025
- Start Time: 09:00 AM
- End Time: 09:30 AM
- Actual Duration: 0.5 hours
- Charged Duration: 1 hour (minimum)

**Expected Calculation:**
```
Service Cost (inc GST): 1 hour × $25 = $25.00 (minimum 1 hour)
Service Cost (ex GST): $25.00 / 1.15 = $21.74
GST on Service: $21.74 × 0.15 = $3.26

Platform Fee (ex GST): $21.74 × 0.10 = $2.17
Platform Fee GST: $2.17 × 0.15 = $0.33
Platform Fee (inc GST): $2.17 + $0.33 = $2.50

Total (inc GST): $25.00 + $2.50 = $27.50
Total GST: $3.26 + $0.33 = $3.59
```

✅ **Status:** CORRECT - Minimum 1 hour enforced

---

## Edge Cases Tested

### Edge Case 1: Same Day Booking (0 nights difference)
- Start: Oct 22, End: Oct 22
- Result: Charges minimum 1 night ✅

### Edge Case 2: No Overnight Rate Set
- Result: Shows error toast "This sitter hasn't set up overnight rates yet" ✅

### Edge Case 3: No Hourly Rate Set
- Result: Shows error toast "This sitter hasn't set up hourly rates yet" ✅

---

## GST Calculation Summary

**New Zealand GST Rate: 15%**

All prices displayed to customers include GST (inc GST).

**GST Calculation Method:**
- Service Cost (ex GST) = Service Cost (inc GST) / 1.15
- GST Component = Service Cost (ex GST) × 0.15
- Platform Fee (ex GST) = Service Cost (ex GST) × 0.10
- Platform Fee GST = Platform Fee (ex GST) × 0.15
- Total = Service Cost (inc GST) + Platform Fee (inc GST)

---

## Platform Fee Breakdown

**Platform Fee: 10% of service cost (excluding GST)**

Example for $100 service:
- Service Cost (ex GST): $86.96
- Platform Fee (ex GST): $8.70
- Platform Fee GST: $1.30
- Platform Fee (inc GST): $10.00

The 10% platform fee is calculated on the ex-GST amount, then GST is added to the platform fee itself.

---

## Verification Status: ✅ ALL TESTS PASSED

All booking cost calculations are now accurate and comply with New Zealand GST requirements.

**Key Fixes Applied:**
1. ✅ Overnight bookings now correctly calculate based on NIGHTS (not days or hours)
2. ✅ GST is properly calculated at 15% on both service cost and platform fee
3. ✅ Platform fee is 10% of ex-GST service cost, with GST added
4. ✅ Hourly services have minimum 1-hour charge
5. ✅ Error handling for missing rates
6. ✅ All amounts display with proper precision (2 decimal places)
