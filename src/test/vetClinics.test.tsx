import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// --- Pure logic helpers ---
interface VetClinic {
  id: string;
  clinic_name: string;
  relationship_status: string;
  next_follow_up_date: string | null;
  referral_count: number;
}

function isOverdueFollowUp(nextFollowUpDate: string | null, now: Date = new Date()): boolean {
  if (!nextFollowUpDate) return false;
  return new Date(nextFollowUpDate) < now;
}

function getRelationshipStatusColor(status: string): string {
  switch (status) {
    case 'prospect': return 'gray';
    case 'contacted': return 'blue';
    case 'met': return 'yellow';
    case 'active_referrer': return 'green';
    case 'inactive': return 'red';
    default: return 'gray';
  }
}

function validateClinicForm(clinic: { clinic_name: string }): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!clinic.clinic_name || clinic.clinic_name.trim() === '') {
    errors.push('Clinic name is required');
  }
  return { valid: errors.length === 0, errors };
}

// --- Presentational component for testing ---
function ClinicRow({ clinic, now }: { clinic: VetClinic; now?: Date }) {
  const overdue = isOverdueFollowUp(clinic.next_follow_up_date, now);
  return (
    <tr data-testid={`clinic-row-${clinic.id}`} className={overdue ? 'overdue' : ''}>
      <td>{clinic.clinic_name}</td>
      <td data-testid={`status-${clinic.id}`}>{clinic.relationship_status}</td>
      <td>{clinic.referral_count}</td>
      <td data-testid={`followup-${clinic.id}`}>
        {clinic.next_follow_up_date || '–'}
        {overdue && <span data-testid={`overdue-${clinic.id}`} className="text-red-500"> ⚠ Overdue</span>}
      </td>
    </tr>
  );
}

// --- Tests ---
describe('Vet Clinic CRM', () => {
  describe('isOverdueFollowUp', () => {
    const now = new Date('2026-03-08T12:00:00Z');

    it('returns true when follow-up date is in the past', () => {
      expect(isOverdueFollowUp('2026-03-01', now)).toBe(true);
    });
    it('returns false when follow-up date is in the future', () => {
      expect(isOverdueFollowUp('2026-04-01', now)).toBe(false);
    });
    it('returns false when follow-up date is null', () => {
      expect(isOverdueFollowUp(null, now)).toBe(false);
    });
  });

  describe('getRelationshipStatusColor', () => {
    it('returns green for active_referrer', () => {
      expect(getRelationshipStatusColor('active_referrer')).toBe('green');
    });
    it('returns gray for prospect', () => {
      expect(getRelationshipStatusColor('prospect')).toBe('gray');
    });
    it('returns red for inactive', () => {
      expect(getRelationshipStatusColor('inactive')).toBe('red');
    });
  });

  describe('validateClinicForm', () => {
    it('valid when clinic_name is set', () => {
      expect(validateClinicForm({ clinic_name: 'Paws Vet' }).valid).toBe(true);
    });
    it('invalid when clinic_name is empty', () => {
      const result = validateClinicForm({ clinic_name: '' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Clinic name is required');
    });
  });

  describe('ClinicRow overdue highlight', () => {
    const now = new Date('2026-03-08T12:00:00Z');

    it('shows overdue indicator for past follow-up date', () => {
      const clinic: VetClinic = {
        id: '1', clinic_name: 'Paws Vet', relationship_status: 'active_referrer',
        next_follow_up_date: '2026-03-01', referral_count: 5,
      };
      render(<table><tbody><ClinicRow clinic={clinic} now={now} /></tbody></table>);
      expect(screen.getByTestId('overdue-1')).toHaveTextContent('Overdue');
    });

    it('does NOT show overdue for future follow-up date', () => {
      const clinic: VetClinic = {
        id: '2', clinic_name: 'Happy Pets', relationship_status: 'prospect',
        next_follow_up_date: '2026-04-01', referral_count: 0,
      };
      render(<table><tbody><ClinicRow clinic={clinic} now={now} /></tbody></table>);
      expect(screen.queryByTestId('overdue-2')).not.toBeInTheDocument();
    });
  });
});
