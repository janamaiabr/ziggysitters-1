import OnboardingTour from './OnboardingTour';

const sitterTourSteps = [
  {
    target: '[data-tour="sitter-profile"]',
    title: 'Complete Your Profile',
    description: 'Complete your profile to start getting bookings from pet owners in your area.',
    placement: 'bottom' as const,
  },
  {
    target: '[data-tour="sitter-photo"]',
    title: 'Add a Profile Photo',
    description: 'Profiles with photos get 3x more bookings! Upload a friendly photo of yourself.',
    placement: 'bottom' as const,
  },
  {
    target: '[data-tour="sitter-availability"]',
    title: 'Set Your Availability & Rates',
    description: 'Set your availability and rates so pet owners know when you\'re free and what you charge.',
    placement: 'bottom' as const,
  },
];

export default function SitterOnboardingTour() {
  return (
    <OnboardingTour
      steps={sitterTourSteps}
      storageKey="ziggy_sitter_tour_complete"
    />
  );
}
