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

  console.log('=== OnboardingCheck Debug ===', {
    user: !!user,
    loading,
    needsOnboarding,
    currentPath: location.pathname,
    hasProfile: !!profile,
    profileData: profile ? {
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone: profile.phone,
      address: profile.address,
      onboarding_completed: profile.onboarding_completed
    } : null
  });

  useEffect(() => {
    // Exclude password reset flow, onboarding completion pages, search pages, and test pages from redirects
    // CRITICAL: /find-sitters must be excluded so pet owners can search immediately after onboarding
    const excludedPaths = [
      '/onboarding', 
      '/reset-password', 
      '/forgot-password',
      '/onboarding-complete',
      '/onboarding-pending-approval',
      '/profile', // CRITICAL: Allow profile page access to handle Stripe returns
      '/find-sitters', // CRITICAL: Allow search page access for pet owners
      '/sitter/', // Allow viewing sitter profiles
      '/quick-setup', // Pet owner wizard
      '/stripe-onboarding-tests',
      '/manual-service-creator',
      '/test-pricing',
      '/test-payment',
      '/test-payment-flow',
      '/test-emails',
      '/test-daily-report-email'
    ];
    
    // Check if we're on an excluded path
    const isExcludedPath = excludedPaths.some(path => location.pathname.startsWith(path));
    
    // Only redirect if user is authenticated, we have profile info, AND profile lacks basic info
    // Don't redirect if they have basic info (name, phone, address) - let them use the app
    // ALSO don't redirect if profile.role is 'pet_owner' - they don't need full onboarding
    const hasBasicInfo = profile && profile.first_name && profile.last_name && profile.phone && profile.address;
    const isPetOwner = profile?.role === 'pet_owner';
    const onboardingComplete = profile?.onboarding_completed === true;
    
    console.log('=== OnboardingCheck useEffect ===', {
      user: !!user,
      loading,
      needsOnboarding,
      hasBasicInfo,
      isPetOwner,
      onboardingComplete,
      isExcludedPath,
      currentPath: location.pathname,
      shouldRedirect: user && !loading && needsOnboarding && !hasBasicInfo && !isPetOwner && !onboardingComplete && !isExcludedPath
    });
    
    // Pet owners with onboarding_completed should NEVER be redirected to onboarding
    if (user && !loading && needsOnboarding && !hasBasicInfo && !isPetOwner && !onboardingComplete && !isExcludedPath) {
      console.log('=== OnboardingCheck: REDIRECTING TO ONBOARDING ===');
      navigate('/onboarding', { replace: true });
    }
  }, [user, loading, needsOnboarding, profile, navigate, location.pathname]);

  // Show loading while checking profile - but only for a short time
  // Don't block indefinitely - after 3 seconds, just render the page
  // This prevents infinite loading screens on Safari and other edge cases
  if (user && loading) {
    console.log('OnboardingCheck: Profile loading, rendering children anyway to prevent blocking');
    // Don't block - just render children. The page can handle its own loading state.
    // This prevents the infinite "Loading..." screen issue on Safari
  }

  return (
    <>
      <OnboardingCompletionTracker />
      {children}
    </>
  );
}