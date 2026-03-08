import { describe, it, expect } from 'vitest';

// --- KPI Calculation Logic ---

export interface KPIBooking {
  id: string;
  client_id: string;
  status: string;
  total_amount: number;
  is_senior_pet?: boolean;
  referral_source?: string;
  daily_reports_completed?: number;
  daily_reports_required?: number;
  created_at: string;
}

export interface KPIReview {
  rating: number; // 1-5
}

export interface KPISitter {
  id: string;
  last_active_at?: string; // ISO date
}

// 1. Repeat Booking Rate: % of clients who booked more than once
export function calcRepeatBookingRate(bookings: KPIBooking[]): number {
  const clientCounts: Record<string, number> = {};
  for (const b of bookings) {
    clientCounts[b.client_id] = (clientCounts[b.client_id] || 0) + 1;
  }
  const clientIds = Object.keys(clientCounts);
  if (clientIds.length === 0) return 0;
  const repeatClients = clientIds.filter(id => clientCounts[id] > 1).length;
  return Math.round((repeatClients / clientIds.length) * 100);
}

// 2. Daily Update Compliance: % bookings where completed >= required
export function calcDailyUpdateCompliance(bookings: KPIBooking[]): number {
  const withRequirements = bookings.filter(
    b => b.daily_reports_required !== undefined && b.daily_reports_required > 0
  );
  if (withRequirements.length === 0) return 0;
  const compliant = withRequirements.filter(
    b => (b.daily_reports_completed ?? 0) >= (b.daily_reports_required ?? 0)
  ).length;
  return Math.round((compliant / withRequirements.length) * 100);
}

// 3. Client LTV: average total spend per client
export function calcClientLTV(bookings: KPIBooking[]): number {
  const clientSpend: Record<string, number> = {};
  for (const b of bookings) {
    clientSpend[b.client_id] = (clientSpend[b.client_id] || 0) + b.total_amount;
  }
  const clients = Object.keys(clientSpend);
  if (clients.length === 0) return 0;
  const totalSpend = clients.reduce((sum, id) => sum + clientSpend[id], 0);
  return Math.round(totalSpend / clients.length);
}

// 4. Senior Pet Booking %: bookings marked as senior / total
export function calcSeniorPetBookingPct(bookings: KPIBooking[]): number {
  if (bookings.length === 0) return 0;
  const seniorCount = bookings.filter(b => b.is_senior_pet).length;
  return Math.round((seniorCount / bookings.length) * 100);
}

// 5. NPS: (promoters - detractors) / total * 100
// promoter = 5 stars, passive = 3-4, detractor = 1-2
export function calcNPS(reviews: KPIReview[]): number {
  if (reviews.length === 0) return 0;
  const promoters = reviews.filter(r => r.rating === 5).length;
  const detractors = reviews.filter(r => r.rating <= 2).length;
  return Math.round(((promoters - detractors) / reviews.length) * 100);
}

// 6. Sitter Churn: sitters inactive >90 days / total
export function calcSitterChurn(sitters: KPISitter[], now: Date = new Date()): number {
  if (sitters.length === 0) return 0;
  const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const inactive = sitters.filter(s => {
    if (!s.last_active_at) return true; // never active = inactive
    return new Date(s.last_active_at) < cutoff;
  }).length;
  return Math.round((inactive / sitters.length) * 100);
}

// 7. KPI color: green if hitting target, red if not
export function getKPIColor(value: number, target: number, higherIsBetter = true): 'green' | 'red' {
  if (higherIsBetter) {
    return value >= target ? 'green' : 'red';
  }
  return value <= target ? 'green' : 'red';
}

// 8. Monthly bookings filter
export function getMonthlyBookings(bookings: KPIBooking[], now: Date = new Date()): KPIBooking[] {
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return bookings.filter(b => new Date(b.created_at) >= startOfMonth);
}

// --- Tests ---

describe('KPI Dashboard calculations', () => {
  describe('calcRepeatBookingRate', () => {
    it('returns 0 for empty bookings', () => {
      expect(calcRepeatBookingRate([])).toBe(0);
    });

    it('returns 0 when no client has booked more than once', () => {
      const bookings = [
        { id: '1', client_id: 'a', status: 'completed', total_amount: 100, created_at: '2026-03-01' },
        { id: '2', client_id: 'b', status: 'completed', total_amount: 150, created_at: '2026-03-02' },
      ];
      expect(calcRepeatBookingRate(bookings)).toBe(0);
    });

    it('returns 50 when half clients have repeat bookings', () => {
      const bookings = [
        { id: '1', client_id: 'a', status: 'completed', total_amount: 100, created_at: '2026-03-01' },
        { id: '2', client_id: 'a', status: 'completed', total_amount: 120, created_at: '2026-03-05' }, // repeat
        { id: '3', client_id: 'b', status: 'completed', total_amount: 150, created_at: '2026-03-02' },
      ];
      expect(calcRepeatBookingRate(bookings)).toBe(50);
    });

    it('returns 100 when all clients have repeat bookings', () => {
      const bookings = [
        { id: '1', client_id: 'a', status: 'completed', total_amount: 100, created_at: '2026-03-01' },
        { id: '2', client_id: 'a', status: 'completed', total_amount: 120, created_at: '2026-03-05' },
      ];
      expect(calcRepeatBookingRate(bookings)).toBe(100);
    });
  });

  describe('calcDailyUpdateCompliance', () => {
    it('returns 0 for empty bookings', () => {
      expect(calcDailyUpdateCompliance([])).toBe(0);
    });

    it('returns 100 when all bookings are compliant', () => {
      const bookings = [
        { id: '1', client_id: 'a', status: 'completed', total_amount: 100, created_at: '2026-03-01', daily_reports_required: 3, daily_reports_completed: 3 },
        { id: '2', client_id: 'b', status: 'completed', total_amount: 150, created_at: '2026-03-02', daily_reports_required: 2, daily_reports_completed: 2 },
      ];
      expect(calcDailyUpdateCompliance(bookings)).toBe(100);
    });

    it('returns 50 when half are compliant', () => {
      const bookings = [
        { id: '1', client_id: 'a', status: 'completed', total_amount: 100, created_at: '2026-03-01', daily_reports_required: 3, daily_reports_completed: 3 },
        { id: '2', client_id: 'b', status: 'completed', total_amount: 150, created_at: '2026-03-02', daily_reports_required: 3, daily_reports_completed: 1 },
      ];
      expect(calcDailyUpdateCompliance(bookings)).toBe(50);
    });
  });

  describe('calcClientLTV', () => {
    it('returns 0 for empty bookings', () => {
      expect(calcClientLTV([])).toBe(0);
    });

    it('calculates correct average spend per client', () => {
      const bookings = [
        { id: '1', client_id: 'a', status: 'completed', total_amount: 200, created_at: '2026-03-01' },
        { id: '2', client_id: 'a', status: 'completed', total_amount: 300, created_at: '2026-03-05' }, // client a total = 500
        { id: '3', client_id: 'b', status: 'completed', total_amount: 100, created_at: '2026-03-02' }, // client b total = 100
        // average LTV = (500 + 100) / 2 = 300
      ];
      expect(calcClientLTV(bookings)).toBe(300);
    });
  });

  describe('calcSeniorPetBookingPct', () => {
    it('returns 0 for empty bookings', () => {
      expect(calcSeniorPetBookingPct([])).toBe(0);
    });

    it('returns correct percentage of senior pet bookings', () => {
      const bookings = [
        { id: '1', client_id: 'a', status: 'completed', total_amount: 100, created_at: '2026-03-01', is_senior_pet: true },
        { id: '2', client_id: 'b', status: 'completed', total_amount: 150, created_at: '2026-03-02', is_senior_pet: false },
        { id: '3', client_id: 'c', status: 'completed', total_amount: 200, created_at: '2026-03-03', is_senior_pet: true },
        { id: '4', client_id: 'd', status: 'completed', total_amount: 250, created_at: '2026-03-04', is_senior_pet: false },
      ];
      expect(calcSeniorPetBookingPct(bookings)).toBe(50);
    });
  });

  describe('calcNPS', () => {
    it('returns 0 for empty reviews', () => {
      expect(calcNPS([])).toBe(0);
    });

    it('returns 100 when all reviews are 5 stars', () => {
      const reviews = [{ rating: 5 }, { rating: 5 }, { rating: 5 }];
      expect(calcNPS(reviews)).toBe(100);
    });

    it('returns -100 when all reviews are 1-2 stars', () => {
      const reviews = [{ rating: 1 }, { rating: 2 }, { rating: 1 }];
      expect(calcNPS(reviews)).toBe(-100);
    });

    it('calculates mixed NPS correctly', () => {
      // 3 promoters (5★), 1 passive (4★), 1 detractor (2★)
      const reviews = [{ rating: 5 }, { rating: 5 }, { rating: 5 }, { rating: 4 }, { rating: 2 }];
      // NPS = (3-1)/5*100 = 40
      expect(calcNPS(reviews)).toBe(40);
    });
  });

  describe('calcSitterChurn', () => {
    const now = new Date('2026-03-08T12:00:00Z');

    it('returns 0 for empty sitters', () => {
      expect(calcSitterChurn([], now)).toBe(0);
    });

    it('counts sitters without last_active_at as inactive', () => {
      const sitters = [
        { id: '1' }, // no last_active_at
        { id: '2', last_active_at: '2026-03-01' }, // recent
      ];
      expect(calcSitterChurn(sitters, now)).toBe(50);
    });

    it('counts sitters inactive >90 days as churned', () => {
      const sitters = [
        { id: '1', last_active_at: '2025-12-01' }, // >90 days ago
        { id: '2', last_active_at: '2026-03-01' }, // recent
        { id: '3', last_active_at: '2025-11-01' }, // way old
      ];
      expect(calcSitterChurn(sitters, now)).toBe(67); // 2/3
    });
  });

  describe('getKPIColor', () => {
    it('returns green when value meets or exceeds target (higher is better)', () => {
      expect(getKPIColor(55, 50)).toBe('green');
      expect(getKPIColor(50, 50)).toBe('green');
    });

    it('returns red when value is below target (higher is better)', () => {
      expect(getKPIColor(45, 50)).toBe('red');
    });

    it('returns green when value is at or below target (lower is better)', () => {
      expect(getKPIColor(15, 20, false)).toBe('green');
      expect(getKPIColor(20, 20, false)).toBe('green');
    });

    it('returns red when value exceeds target (lower is better)', () => {
      expect(getKPIColor(25, 20, false)).toBe('red');
    });
  });

  describe('getMonthlyBookings', () => {
    const now = new Date('2026-03-08T12:00:00Z');
    const bookings: KPIBooking[] = [
      { id: '1', client_id: 'a', status: 'completed', total_amount: 100, created_at: '2026-03-01T00:00:00Z' }, // this month
      { id: '2', client_id: 'b', status: 'completed', total_amount: 150, created_at: '2026-02-28T00:00:00Z' }, // last month
      { id: '3', client_id: 'c', status: 'completed', total_amount: 200, created_at: '2026-03-07T00:00:00Z' }, // this month
    ];

    it('returns only bookings from the current month', () => {
      const result = getMonthlyBookings(bookings, now);
      expect(result).toHaveLength(2);
      expect(result.map(b => b.id)).toContain('1');
      expect(result.map(b => b.id)).toContain('3');
    });
  });
});
