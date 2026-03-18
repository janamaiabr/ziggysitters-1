import { describe, it, expect } from 'vitest';
import { FEATURES, isFeatureEnabled, getEnabledFeatures } from '@/config/features';

describe('Feature Flags', () => {
  it('YOUNG_DOG_WALKERS flag should be true (turned on)', () => {
    expect(FEATURES.YOUNG_DOG_WALKERS).toBe(true);
  });

  it('isFeatureEnabled returns true for YOUNG_DOG_WALKERS', () => {
    expect(isFeatureEnabled('YOUNG_DOG_WALKERS')).toBe(true);
  });

  it('getEnabledFeatures includes YOUNG_DOG_WALKERS', () => {
    const enabled = getEnabledFeatures();
    expect(enabled).toContain('YOUNG_DOG_WALKERS');
  });

  it('DOG_WALKING_GENERAL stays false', () => {
    expect(FEATURES.DOG_WALKING_GENERAL).toBe(false);
  });
});
