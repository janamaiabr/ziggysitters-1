import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuth } from '@/hooks/useAuth';
import { OnboardingCompletionTracker } from './OnboardingCompletionTracker';

export function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { profile, loading, needsOnboarding } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();

  console.log('OnboardingCheck Debug:', {
    user: !!user,
    loading,
    needsOnboarding,
    currentPath: location.pathname,
    profile: !!profile
  });

  useEffect(() => {
    // Only redirect if user is authenticated and we have profile info
    if (user && !loading && needsOnboarding && location.pathname !== '/onboarding') {
      console.log('Redirecting to onboarding...');
      navigate('/onboarding');
    }
  }, [user, loading, needsOnboarding, navigate, location.pathname]);

  // Show loading while checking profile
  if (user && loading) {
    console.log('OnboardingCheck: Showing loading screen');
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <>
      <OnboardingCompletionTracker />
      {children}
    </>
  );
}