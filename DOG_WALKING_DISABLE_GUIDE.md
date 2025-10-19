# Dog Walking Service - Disable/Enable Guide

This document tracks all locations where dog walking service is referenced in the platform.

## How to Disable/Enable

**To Disable:** Comment out the lines marked with `// DOG_WALKING`  
**To Enable:** Uncomment those same lines

---

## Files and Locations

### 1. **src/components/home/HeroSectionOriginal.tsx**
- **Line 96:** SelectItem for "Dog Walking" in search dropdown
```tsx
{/* DOG_WALKING */ <SelectItem value="dog_walking">🚶‍♂️ Dog Walking</SelectItem> /* END_DOG_WALKING */}
```

### 2. **src/components/home/HeroSectionPlayful.tsx**
- **Line 152:** SelectItem for "Dog Walking" in search dropdown
```tsx
{/* DOG_WALKING */ <SelectItem value="dog_walking">🚶‍♂️ Dog Walking</SelectItem> /* END_DOG_WALKING */}
```

### 3. **src/components/home/HeroSectionV2.tsx**
- **Line 127:** SelectItem for "Dog Walking" in search dropdown
```tsx
{/* DOG_WALKING */ <SelectItem value="dog_walking">🚶‍♂️ Dog Walking</SelectItem> /* END_DOG_WALKING */}
```

### 4. **src/components/booking/BookingAccordion.tsx**
- **Lines 41, 48, 55:** Service configuration (rates, labels, units)
- **Lines 160-183:** Dog walking calculation logic
- **Lines 272-273:** Time field inclusion in booking data
- **Line 393:** Service label display
- **Lines 465-466:** End date conditional display
- **Lines 492-510:** Repeat toggle section
- **Lines 522-523:** Hourly service detection
- **Line 671:** Duration display

### 5. **src/components/booking/BookingDialog.tsx**
- **Line 49:** Service label mapping
- **Lines 80, 210-243:** Dog walking calculation logic
- **Lines 295-309:** Validation logic for time and date
- **Lines 386-387:** Booking submission data
- **Lines 566-567:** Service name display
- **Lines 596-597, 599, 601:** Date selection grid
- **Lines 632-634:** End date conditional
- **Lines 670-696:** Repeat across days toggle
- **Lines 698-744:** Time selection section
- **Lines 1002-1004:** Hourly summary display
- **Lines 1129-1130:** Submit button validation

### 6. **src/components/onboarding/EnhancedSitterOnboarding.tsx**
- **Line 16:** TypeScript interface for service type
- **Line 35:** Service configuration array

### 7. **src/components/onboarding/ImprovedSitterOnboarding.tsx**
- **Line 17:** TypeScript interface for service type
- **Line 38:** Service configuration array

### 8. **src/components/onboarding/SitterOnboarding.tsx**
- **Line 14:** TypeScript interface for service type
- Service definition in services array (needs review for exact line)

### 9. **src/pages/FindSitters.tsx** (search functionality)
- Service type filter options

### 10. **Database Tables**
- `sitter_services` table contains dog_walking records
- `bookings` table can have dog_walking as service_type

---

## Summary of Changes Needed

1. **Hero/Search Components (3 files):** Comment out dog walking option in dropdowns
2. **Booking Components (2 files):** Comment out dog walking specific logic
3. **Onboarding Components (3 files):** Comment out from service type options
4. **Database:** No changes needed - data remains intact

---

## Important Notes

- **DO NOT delete code** - only comment it out for easy re-enabling
- **Database records** for existing dog walking bookings will remain untouched
- **Existing bookings** with dog_walking service_type will still be viewable
- **Sitters with dog walking services** will keep their data but won't be able to add new ones
- **Payment flow** works the same for all service types including dog_walking

---

## Re-enabling Checklist

When ready to re-enable:
1. Search for `/* DOG_WALKING */` comments
2. Uncomment all marked sections
3. Test service creation in onboarding
4. Test booking flow end-to-end
5. Verify search filters work correctly
