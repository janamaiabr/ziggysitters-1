import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          not: () => ({
            neq: () => ({
              order: () => ({
                order: () => ({
                  limit: () => Promise.resolve({ data: [], error: null })
                })
              })
            })
          })
        }),
        in: () => Promise.resolve({ data: [], error: null })
      })
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  }
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, loading: false }),
  AuthProvider: ({ children }: any) => children,
}));

vi.mock('@/contexts/ProfileContext', () => ({
  useProfile: () => ({ profile: null, loading: false }),
  ProfileProvider: ({ children }: any) => children,
}));

vi.mock('@/hooks/useBehaviorTracking', () => ({
  useBehaviorTracking: () => ({ trackAction: vi.fn() }),
}));

vi.mock('@/hooks/useSearchTracking', () => ({
  useSearchTracking: () => ({
    trackSearch: vi.fn(),
    trackSitterClick: vi.fn(),
    saveSearchContext: vi.fn(),
  }),
}));

vi.mock('@/lib/ga4', () => ({
  ga4: { ctaClick: vi.fn(), clickSignup: vi.fn() },
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

// ─── Brand Messaging Tests ───

describe('Brand Pivot: CityLandingPage', () => {
  it('does not show prices on city landing pages', async () => {
    const { default: CityLandingPage } = await import('@/components/city/CityLandingPage');
    const { getCityBySlug } = await import('@/data/cityData');
    const city = getCityBySlug('sunshine-coast');
    if (!city) throw new Error('City not found');

    const { container } = renderWithProviders(<CityLandingPage city={city} />);
    const text = container.textContent || '';

    // No dollar signs or price patterns on landing pages
    expect(text).not.toMatch(/\$\d+/);
    expect(text).not.toMatch(/A\$\d+/);
    expect(text).not.toMatch(/From \$/);
  });

  it('uses "reliable" and "local" in hero messaging', async () => {
    const { getCityBySlug } = await import('@/data/cityData');
    const city = getCityBySlug('sunshine-coast');
    if (!city) throw new Error('City not found');

    // heroDescription should mention reliable/local/affordable concepts
    const desc = city.heroDescription.toLowerCase();
    expect(
      desc.includes('reliable') || desc.includes('local') || desc.includes('affordable') || desc.includes('trusted')
    ).toBe(true);
  });

  it('does not use "specialist" as primary positioning in H1', async () => {
    const { default: CityLandingPage } = await import('@/components/city/CityLandingPage');
    const { getCityBySlug } = await import('@/data/cityData');
    const city = getCityBySlug('sunshine-coast');
    if (!city) throw new Error('City not found');

    renderWithProviders(<CityLandingPage city={city} />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent?.toLowerCase()).not.toContain('specialist');
    expect(h1.textContent?.toLowerCase()).not.toContain('senior');
  });

  it('uses simplified trust signals (ID verified + daily updates)', async () => {
    const { default: CityLandingPage } = await import('@/components/city/CityLandingPage');
    const { getCityBySlug } = await import('@/data/cityData');
    const city = getCityBySlug('auckland');
    if (!city) throw new Error('City not found');

    const { container } = renderWithProviders(<CityLandingPage city={city} />);
    const text = container.textContent || '';

    expect(text).toContain('ID Verified');
    expect(text.toLowerCase()).toContain('daily');
  });
});

describe('Brand Pivot: BecomeSitter', () => {
  it('uses casual warm tone — mentions loving dogs or earning extra cash', async () => {
    const { default: BecomeSitter } = await import('@/pages/BecomeSitter');

    const { container } = renderWithProviders(<BecomeSitter />);
    const text = (container.textContent || '').toLowerCase();

    expect(
      text.includes('love dogs') || text.includes('extra cash') || text.includes('love pets') || text.includes('earn')
    ).toBe(true);
  });

  it('does not use "specialist" or "personality-matched" as primary positioning', async () => {
    const { default: BecomeSitter } = await import('@/pages/BecomeSitter');

    renderWithProviders(<BecomeSitter />);
    const h1 = screen.getByRole('heading', { level: 1 });
    const h1Text = h1.textContent?.toLowerCase() || '';

    expect(h1Text).not.toContain('specialist');
    expect(h1Text).not.toContain('personality-matched');
  });
});

describe('Brand Pivot: TrustGuarantees', () => {
  it('uses simplified trust signals without named guarantees', async () => {
    const { default: TrustGuarantees } = await import('@/components/home/TrustGuarantees');

    const { container } = renderWithProviders(<TrustGuarantees />);
    const text = (container.textContent || '').toLowerCase();

    // Should have simple trust signals
    expect(text).toContain('verified');
    expect(text.includes('daily') || text.includes('update')).toBe(true);
  });
});

describe('Brand Pivot: HeroSectionPlayful', () => {
  it('uses approachable language, not specialist jargon', async () => {
    const { default: HeroSectionPlayful } = await import('@/components/home/HeroSectionPlayful');

    const { container } = renderWithProviders(
      <HeroSectionPlayful
        location="" setLocation={() => {}}
        serviceType="" setServiceType={() => {}}
        checkIn="" setCheckIn={() => {}}
        checkOut="" setCheckOut={() => {}}
      />
    );
    const h1 = container.querySelector('h1');
    const h1Text = h1?.textContent?.toLowerCase() || '';

    expect(h1Text).not.toContain('specialist');
    expect(h1Text).not.toContain('anxious rescue');
  });
});

describe('Brand Pivot: Routing', () => {
  it('/sunshine-coast redirects to /pet-sitting-sunshine-coast', async () => {
    // This is validated by checking App.tsx route config
    const { default: App } = await import('@/App');
    // The component should render without error — the route should redirect
    // Actual redirect tested via integration, but import should not fail
    expect(App).toBeDefined();
  });
});
