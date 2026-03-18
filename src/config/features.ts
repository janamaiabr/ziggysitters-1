/**
 * Feature Flags Configuration
 * 
 * Toggle features on/off easily without code changes.
 * Set to `false` to disable a feature completely.
 */

export const FEATURES = {
  /**
   * Young Dog Walker Program
   * 
   * Enables:
   * - Parent/child registration flow
   * - Young walker landing pages (supply + demand)
   * - Dog walking service for children (with NZ compliance)
   * - Special display badges for young walkers
   * 
   * NZ Rules Enforced:
   * - Under 16: Cannot work during school hours (9am-3pm weekdays)
   * - Under 16: Cannot work between 10pm and 6am
   * - Requires parent/caregiver consent
   * - Single dog only (no multiple dogs)
   * - Limited walk duration (max 30 mins)
   * - Distance restrictions from home
   */
  YOUNG_DOG_WALKERS: true,

  /**
   * Dog Walking Service (General)
   * Currently disabled for adult sitters
   */
  DOG_WALKING_GENERAL: false,
} as const;

/**
 * Young Dog Walker Configuration
 * Based on NZ employment law for children under 16
 */
export const YOUNG_WALKER_CONFIG = {
  // Age restrictions
  MIN_AGE: 12, // Minimum age for young walkers
  MAX_AGE: 17, // Maximum age (18+ uses regular sitter flow)
  ADULT_SUPERVISION_REQUIRED_UNDER: 14, // Under 14 needs adult supervision

  // Time restrictions (NZ law for under-16s)
  RESTRICTED_HOURS: {
    // Cannot work between these hours
    NIGHT_START: 22, // 10 PM
    NIGHT_END: 6,    // 6 AM
    // Cannot work during school hours on weekdays
    SCHOOL_START: 9,  // 9 AM
    SCHOOL_END: 15,   // 3 PM
  },

  // Service restrictions
  MAX_DOGS: 1,           // Only one dog at a time for safety
  MAX_WALK_DURATION: 40, // Maximum 40 minutes per walk
  MAX_DISTANCE_KM: 2,    // Maximum distance from home
  
  // Pricing - fixed rate
  SUGGESTED_RATE_PER_WALK: 10, // $10 per walk (fixed price)
  MIN_RATE: 10,
  MAX_RATE: 10, // Fixed rate

  // Safety requirements
  REQUIRES_PARENT_CONSENT: true,
  REQUIRES_DOG_TEMPERAMENT_CHECK: true, // Dog must be well-behaved
  ALLOWED_DOG_SIZES: ['small', 'medium'] as const, // No large/extra large dogs
  
  // Terms specific to young walkers
  PARENT_CHECKLIST: [
    'Confirm child\'s age and school schedule',
    'Provide emergency contact information',
    'Acknowledge work hour restrictions',
    'Agree to safety guidelines',
    'Confirm child has been briefed on dog handling',
  ],

  HIRER_CHECKLIST: [
    'Confirm dog is well-trained and manageable for a child',
    'Dog does not have a history of aggression or strong pulling',
    'Walking routes are safe (footpaths, low traffic, daylight)',
    'Only one dog per walk',
    'Provide emergency contact numbers',
    'Agree to weather-appropriate scheduling',
  ],
} as const;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature] ?? false;
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): (keyof typeof FEATURES)[] {
  return (Object.keys(FEATURES) as (keyof typeof FEATURES)[])
    .filter(key => FEATURES[key]);
}
