import { describe, it, expect } from 'vitest';

// Medication validation helpers (pure functions to test)
interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
}

function validateMedication(med: Medication): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!med.name || med.name.trim() === '') errors.push('Medication name is required');
  if (!med.dosage || med.dosage.trim() === '') errors.push('Dosage is required');
  return { valid: errors.length === 0, errors };
}

function validateEmergencyVetPhone(phone: string): boolean {
  if (!phone) return true; // optional
  // Accept NZ/AU formats: +64, +61, 0x-xxx, etc.
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^(\+?[0-9]{8,15})$/.test(cleaned);
}

function validateMobilityLevel(level: string | null): boolean {
  if (!level) return true; // optional
  return ['full', 'limited', 'assisted', 'minimal'].includes(level);
}

const HEALTH_CONDITIONS = [
  'arthritis', 'diabetes', 'heart condition', 'anxiety',
  'vision impaired', 'hearing impaired', 'post-surgical', 'other'
];

describe('Pet Health Profile Validation', () => {
  describe('Medication validation', () => {
    it('valid medication with name and dosage passes', () => {
      const result = validateMedication({ name: 'Rimadyl', dosage: '50mg', frequency: 'daily' });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('medication without name fails', () => {
      const result = validateMedication({ name: '', dosage: '50mg', frequency: 'daily' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Medication name is required');
    });

    it('medication without dosage fails', () => {
      const result = validateMedication({ name: 'Rimadyl', dosage: '', frequency: 'daily' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Dosage is required');
    });

    it('medication missing both name and dosage has two errors', () => {
      const result = validateMedication({ name: '', dosage: '', frequency: '' });
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });
  });

  describe('Emergency vet phone validation', () => {
    it('accepts valid NZ phone with country code', () => {
      expect(validateEmergencyVetPhone('+64 9 555 1234')).toBe(true);
    });

    it('accepts valid AU phone', () => {
      expect(validateEmergencyVetPhone('+61 7 5551 2345')).toBe(true);
    });

    it('accepts local format', () => {
      expect(validateEmergencyVetPhone('09-555-1234')).toBe(true);
    });

    it('rejects too-short phone numbers', () => {
      expect(validateEmergencyVetPhone('123')).toBe(false);
    });

    it('empty phone is valid (field is optional)', () => {
      expect(validateEmergencyVetPhone('')).toBe(true);
    });
  });

  describe('Mobility level validation', () => {
    it('accepts valid mobility levels', () => {
      expect(validateMobilityLevel('full')).toBe(true);
      expect(validateMobilityLevel('limited')).toBe(true);
      expect(validateMobilityLevel('assisted')).toBe(true);
      expect(validateMobilityLevel('minimal')).toBe(true);
    });

    it('rejects invalid mobility level', () => {
      expect(validateMobilityLevel('excellent')).toBe(false);
    });

    it('null is valid (optional field)', () => {
      expect(validateMobilityLevel(null)).toBe(true);
    });
  });

  describe('Health conditions', () => {
    it('health conditions list includes expected conditions', () => {
      expect(HEALTH_CONDITIONS).toContain('arthritis');
      expect(HEALTH_CONDITIONS).toContain('diabetes');
      expect(HEALTH_CONDITIONS).toContain('anxiety');
      expect(HEALTH_CONDITIONS).toHaveLength(8);
    });
  });
});
