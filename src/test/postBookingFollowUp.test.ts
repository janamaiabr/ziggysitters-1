import { describe, it, expect } from 'vitest';

// --- Pure logic helpers ---
type FollowUpStatus = 'pending' | 'sent' | 'skipped';

function getFollowUpStatus(booking: {
  end_date: string;
  follow_up_sent: boolean;
  follow_up_sent_at: string | null;
}, now: Date = new Date()): FollowUpStatus {
  if (booking.follow_up_sent) return 'sent';
  const endDate = new Date(booking.end_date);
  const hoursSinceEnd = (now.getTime() - endDate.getTime()) / (1000 * 60 * 60);
  // Only pending if ended and within 48h window
  if (hoursSinceEnd > 0 && hoursSinceEnd <= 48) return 'pending';
  if (hoursSinceEnd > 48) return 'skipped';
  return 'pending'; // hasn't ended yet but in the list
}

function isReadyForFollowUp(booking: {
  end_date: string;
  follow_up_sent: boolean;
}, now: Date = new Date()): boolean {
  if (booking.follow_up_sent) return false;
  const endDate = new Date(booking.end_date);
  const hoursSinceEnd = (now.getTime() - endDate.getTime()) / (1000 * 60 * 60);
  return hoursSinceEnd >= 24 && hoursSinceEnd <= 48;
}

function getBookingsEndedInLast48h<T extends { end_date: string }>(
  bookings: T[],
  now: Date = new Date()
): T[] {
  const cutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  return bookings.filter(b => {
    const end = new Date(b.end_date);
    return end >= cutoff && end <= now;
  });
}

// --- Tests ---
describe('Post-Booking Follow-Up', () => {
  const now = new Date('2026-03-08T12:00:00Z');

  describe('getFollowUpStatus', () => {
    it('returns sent when follow_up_sent is true', () => {
      expect(getFollowUpStatus({
        end_date: '2026-03-07T00:00:00Z',
        follow_up_sent: true,
        follow_up_sent_at: '2026-03-08T10:00:00Z',
      }, now)).toBe('sent');
    });

    it('returns pending when ended within 48h and not sent', () => {
      expect(getFollowUpStatus({
        end_date: '2026-03-07T00:00:00Z',
        follow_up_sent: false,
        follow_up_sent_at: null,
      }, now)).toBe('pending');
    });

    it('returns skipped when ended more than 48h ago and not sent', () => {
      expect(getFollowUpStatus({
        end_date: '2026-03-05T00:00:00Z',
        follow_up_sent: false,
        follow_up_sent_at: null,
      }, now)).toBe('skipped');
    });
  });

  describe('isReadyForFollowUp', () => {
    it('returns true when 24-48h after end and not sent', () => {
      expect(isReadyForFollowUp({
        end_date: '2026-03-07T06:00:00Z', // 30h ago
        follow_up_sent: false,
      }, now)).toBe(true);
    });

    it('returns false when less than 24h after end', () => {
      expect(isReadyForFollowUp({
        end_date: '2026-03-08T00:00:00Z', // 12h ago
        follow_up_sent: false,
      }, now)).toBe(false);
    });

    it('returns false when already sent', () => {
      expect(isReadyForFollowUp({
        end_date: '2026-03-07T06:00:00Z',
        follow_up_sent: true,
      }, now)).toBe(false);
    });
  });

  describe('getBookingsEndedInLast48h', () => {
    const bookings = [
      { id: '1', end_date: '2026-03-07T00:00:00Z' }, // 36h ago - yes
      { id: '2', end_date: '2026-03-05T00:00:00Z' }, // 84h ago - no
      { id: '3', end_date: '2026-03-08T10:00:00Z' }, // 2h ago - yes
      { id: '4', end_date: '2026-03-10T00:00:00Z' }, // future - no
    ];

    it('returns only bookings ended in last 48h', () => {
      const result = getBookingsEndedInLast48h(bookings, now);
      expect(result).toHaveLength(2);
      expect(result.map(b => b.id)).toContain('1');
      expect(result.map(b => b.id)).toContain('3');
    });
  });
});
