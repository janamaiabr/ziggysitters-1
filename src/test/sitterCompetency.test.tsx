import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Competency tag definitions
const COMPETENCY_TAGS = [
  { id: 'medication_admin', label: 'Medication Administration' },
  { id: 'first_aid_certified', label: 'First Aid Certified' },
  { id: 'senior_pet_experience', label: 'Senior Pet Experience' },
  { id: 'anxiety_specialist', label: 'Anxiety Specialist' },
  { id: 'post_surgical_care', label: 'Post-Surgical Care' },
  { id: 'diabetic_pet_care', label: 'Diabetic Pet Care' },
  { id: 'mobility_assistance', label: 'Mobility Assistance' },
];

// Minimal badge component for testing
function CompetencyBadge({ tag }: { tag: typeof COMPETENCY_TAGS[number] }) {
  return <span data-testid={`badge-${tag.id}`} className="badge">{tag.label}</span>;
}

function SitterCompetencyBadges({ tags }: { tags: string[] }) {
  const matched = COMPETENCY_TAGS.filter(t => tags.includes(t.id));
  return (
    <div data-testid="competency-badges">
      {matched.map(tag => <CompetencyBadge key={tag.id} tag={tag} />)}
    </div>
  );
}

describe('Sitter Competency Tags', () => {
  describe('tag definitions', () => {
    it('has all 7 required competency tags', () => {
      expect(COMPETENCY_TAGS).toHaveLength(7);
    });

    it('includes medication_admin tag', () => {
      expect(COMPETENCY_TAGS.find(t => t.id === 'medication_admin')).toBeDefined();
    });

    it('includes senior_pet_experience tag', () => {
      expect(COMPETENCY_TAGS.find(t => t.id === 'senior_pet_experience')).toBeDefined();
    });
  });

  describe('SitterCompetencyBadges rendering', () => {
    it('renders badges for matching tags', () => {
      render(<SitterCompetencyBadges tags={['medication_admin', 'first_aid_certified']} />);
      expect(screen.getByTestId('badge-medication_admin')).toBeInTheDocument();
      expect(screen.getByTestId('badge-first_aid_certified')).toBeInTheDocument();
    });

    it('does not render badges for unselected tags', () => {
      render(<SitterCompetencyBadges tags={['medication_admin']} />);
      expect(screen.queryByTestId('badge-anxiety_specialist')).not.toBeInTheDocument();
    });

    it('renders empty container when no tags selected', () => {
      render(<SitterCompetencyBadges tags={[]} />);
      const container = screen.getByTestId('competency-badges');
      expect(container.children).toHaveLength(0);
    });

    it('renders correct label text', () => {
      render(<SitterCompetencyBadges tags={['senior_pet_experience']} />);
      expect(screen.getByText('Senior Pet Experience')).toBeInTheDocument();
    });
  });
});
