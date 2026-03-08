import { describe, it, expect } from 'vitest';
import { FEATURES, isFeatureEnabled, getEnabledFeatures } from '@/config/features';

describe('Feature Flags', () => {
  it('YOUNG_DOG_WALKERS flag should be false (turned off)', () => {
    expect(FEATURES.YOUNG_DOG_WALKERS).toBe(false);
  });

  it('isFeatureEnabled returns false for YOUNG_DOG_WALKERS', () => {
    expect(isFeatureEnabled('YOUNG_DOG_WALKERS')).toBe(false);
  });

  it('getEnabledFeatures does not include YOUNG_DOG_WALKERS', () => {
    const enabled = getEnabledFeatures();
    expect(enabled).not.toContain('YOUNG_DOG_WALKERS');
  });

  it('DOG_WALKING_GENERAL stays false', () => {
    expect(FEATURES.DOG_WALKING_GENERAL).toBe(false);
  });
});
