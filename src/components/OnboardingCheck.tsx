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
    // Exclude password reset flow and onboarding completion pages from redirects
    const excludedPaths = [
      '/onboarding', 
      '/reset-password', 
      '/forgot-password',
      '/onboarding-complete',
      '/onboarding-pending-approval',
      '/profile' // CRITICAL: Allow profile page access to handle Stripe returns
    ];
    
    // Check if we're on an excluded path
    const isExcludedPath = excludedPaths.some(path => location.pathname.startsWith(path));
    
    // Only redirect if user is authenticated, we have profile info, AND profile lacks basic info
    // Don't redirect if they have basic info (name, phone, address) - let them use the app
    const hasBasicInfo = profile && profile.first_name && profile.last_name && profile.phone && profile.address;
    
    console.log('OnboardingCheck useEffect:', {
      user: !!user,
      loading,
      needsOnboarding,
      hasBasicInfo,
      isExcludedPath,
      currentPath: location.pathname,
      shouldRedirect: user && !loading && needsOnboarding && !hasBasicInfo && !isExcludedPath
    });
    
    if (user && !loading && needsOnboarding && !hasBasicInfo && !isExcludedPath) {
      console.log('OnboardingCheck: Redirecting to onboarding - missing basic info');
      navigate('/onboarding', { replace: true });
    }
  }, [user, loading, needsOnboarding, profile, navigate, location.pathname]);

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