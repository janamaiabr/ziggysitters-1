import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// --- Pure logic helpers ---
type VettingStatus = 'pending' | 'in_progress' | 'approved' | 'rejected';

function getVettingStatusColor(status: VettingStatus): string {
  switch (status) {
    case 'pending': return 'red';
    case 'in_progress': return 'yellow';
    case 'approved': return 'green';
    case 'rejected': return 'red';
    default: return 'gray';
  }
}

interface Sitter {
  id: string;
  name: string;
  vetting_status: VettingStatus;
  police_check_status: string;
}

function filterSittersByVettingStatus(sitters: Sitter[], status: VettingStatus | 'all'): Sitter[] {
  if (status === 'all') return sitters;
  return sitters.filter(s => s.vetting_status === status);
}

// --- Minimal presentational component for status badge ---
function VettingStatusBadge({ status }: { status: VettingStatus }) {
  const color = getVettingStatusColor(status);
  const colorClasses: Record<string, string> = {
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    green: 'bg-green-100 text-green-700',
    gray: 'bg-gray-100 text-gray-700',
  };
  return (
    <span data-testid={`vetting-badge-${status}`} className={colorClasses[color]}>
      {status.replace('_', ' ')}
    </span>
  );
}

// --- Tests ---
describe('Sitter Vetting Pipeline', () => {
  describe('getVettingStatusColor', () => {
    it('returns red for pending', () => {
      expect(getVettingStatusColor('pending')).toBe('red');
    });
    it('returns yellow for in_progress', () => {
      expect(getVettingStatusColor('in_progress')).toBe('yellow');
    });
    it('returns green for approved', () => {
      expect(getVettingStatusColor('approved')).toBe('green');
    });
    it('returns red for rejected', () => {
      expect(getVettingStatusColor('rejected')).toBe('red');
    });
  });

  describe('filterSittersByVettingStatus', () => {
    const sitters: Sitter[] = [
      { id: '1', name: 'Alice', vetting_status: 'pending', police_check_status: 'not_submitted' },
      { id: '2', name: 'Bob', vetting_status: 'approved', police_check_status: 'verified' },
      { id: '3', name: 'Carol', vetting_status: 'in_progress', police_check_status: 'pending' },
      { id: '4', name: 'Dave', vetting_status: 'rejected', police_check_status: 'expired' },
    ];

    it('returns all sitters when filter is "all"', () => {
      expect(filterSittersByVettingStatus(sitters, 'all')).toHaveLength(4);
    });
    it('filters by pending', () => {
      const result = filterSittersByVettingStatus(sitters, 'pending');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Alice');
    });
    it('filters by approved', () => {
      const result = filterSittersByVettingStatus(sitters, 'approved');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Bob');
    });
  });

  describe('VettingStatusBadge rendering', () => {
    it('renders pending badge with correct text', () => {
      render(<VettingStatusBadge status="pending" />);
      expect(screen.getByTestId('vetting-badge-pending')).toHaveTextContent('pending');
    });
    it('renders approved badge', () => {
      render(<VettingStatusBadge status="approved" />);
      expect(screen.getByTestId('vetting-badge-approved')).toHaveTextContent('approved');
    });
    it('renders in_progress badge with space', () => {
      render(<VettingStatusBadge status="in_progress" />);
      expect(screen.getByTestId('vetting-badge-in_progress')).toHaveTextContent('in progress');
    });
  });
});
