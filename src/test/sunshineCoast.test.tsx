import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Test SEO constants for the Sunshine Coast page
const SUNSHINE_COAST_META = {
  title: 'Senior & High-Needs Pet Sitting | Sunshine Coast | ZiggySitters',
  description: 'Specialist pet sitters for senior and high-needs pets on the Sunshine Coast. Medication administration, vet-referred, local team in Caloundra, Maroochydore, Noosa, Mooloolaba, Buderim, Nambour & Coolum.',
  keywords: 'pet sitting sunshine coast, senior pet sitter sunshine coast, dog sitting sunshine coast, cat sitting sunshine coast',
};

const SUNSHINE_COAST_SUBURBS = [
  'Caloundra',
  'Maroochydore',
  'Noosa',
  'Mooloolaba',
  'Buderim',
  'Nambour',
  'Coolum',
];

const SUNSHINE_COAST_USP = [
  'senior pet specialists',
  'medication administration',
  'vet-referred',
  'daily updates',
  'emergency protocols',
];

// Pure logic tests (no component rendering needed)
describe('Sunshine Coast Landing Page', () => {
  describe('SEO meta data', () => {
    it('has correct title with senior pet focus', () => {
      expect(SUNSHINE_COAST_META.title).toContain('Senior');
      expect(SUNSHINE_COAST_META.title).toContain('Sunshine Coast');
      expect(SUNSHINE_COAST_META.title).toContain('ZiggySitters');
    });

    it('meta description contains primary keyword', () => {
      expect(SUNSHINE_COAST_META.description.toLowerCase()).toContain('sunshine coast');
      expect(SUNSHINE_COAST_META.description.toLowerCase()).toContain('senior');
    });

    it('keywords include primary SEO target', () => {
      expect(SUNSHINE_COAST_META.keywords).toContain('pet sitting sunshine coast');
    });
  });

  describe('suburb coverage', () => {
    const requiredSuburbs = ['Caloundra', 'Maroochydore', 'Noosa', 'Mooloolaba', 'Buderim', 'Nambour', 'Coolum'];

    it('includes all required Sunshine Coast suburbs', () => {
      for (const suburb of requiredSuburbs) {
        expect(SUNSHINE_COAST_SUBURBS).toContain(suburb);
      }
    });

    it('has at least 7 suburbs', () => {
      expect(SUNSHINE_COAST_SUBURBS.length).toBeGreaterThanOrEqual(7);
    });
  });

  describe('USP content', () => {
    it('highlights senior pet specialization', () => {
      expect(SUNSHINE_COAST_USP).toContain('senior pet specialists');
    });

    it('highlights medication administration capability', () => {
      expect(SUNSHINE_COAST_USP).toContain('medication administration');
    });

    it('highlights vet-referred credential', () => {
      expect(SUNSHINE_COAST_USP).toContain('vet-referred');
    });

    it('highlights daily updates feature', () => {
      expect(SUNSHINE_COAST_USP).toContain('daily updates');
    });
  });
});

// Component tests for the actual page
describe('SunshineCoastPage component', () => {
  it('renders without crashing', async () => {
    // Dynamically import to avoid module resolution issues in test
    const { default: SunshineCoastPage } = await import('@/pages/SunshineCoastSeniorPets');

    const { container } = render(
      <MemoryRouter>
        <SunshineCoastPage />
      </MemoryRouter>
    );

    expect(container).toBeTruthy();
  });

  it('contains Sunshine Coast in the page content', async () => {
    const { default: SunshineCoastPage } = await import('@/pages/SunshineCoastSeniorPets');

    render(
      <MemoryRouter>
        <SunshineCoastPage />
      </MemoryRouter>
    );

    // Should have Sunshine Coast text somewhere on page
    const content = document.body.textContent?.toLowerCase() || '';
    expect(content).toContain('sunshine coast');
  });

  it('contains suburb names in the page content', async () => {
    const { default: SunshineCoastPage } = await import('@/pages/SunshineCoastSeniorPets');

    render(
      <MemoryRouter>
        <SunshineCoastPage />
      </MemoryRouter>
    );

    const content = document.body.textContent?.toLowerCase() || '';
    // Check at least a few key suburbs appear
    expect(content).toContain('maroochydore');
    expect(content).toContain('noosa');
    expect(content).toContain('buderim');
  });

  it('mentions senior pets prominently', async () => {
    const { default: SunshineCoastPage } = await import('@/pages/SunshineCoastSeniorPets');

    render(
      <MemoryRouter>
        <SunshineCoastPage />
      </MemoryRouter>
    );

    const content = document.body.textContent?.toLowerCase() || '';
    expect(content).toContain('senior');
  });
});
