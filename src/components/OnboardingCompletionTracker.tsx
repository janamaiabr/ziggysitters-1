import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function OnboardingCompletionTracker() {
  const { user } = useAuth();
  const { profile, needsOnboarding, refetch } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only run auto-completion logic when NOT on onboarding pages
    if (location.pathname.includes('/onboarding')) {
      console.log('OnboardingCompletionTracker: Skipping - on onboarding page');
      return;
    }

    // Auto-complete onboarding for users who have basic info but missing completion flag
    const autoCompleteIfReady = async () => {
      if (!user || !profile) {
        console.log('OnboardingCompletionTracker: Skipping - no user or profile');
        return;
      }
      
      if (!needsOnboarding) {
        console.log('OnboardingCompletionTracker: Skipping - onboarding already complete');
        return;
      }
      
      console.log('OnboardingCompletionTracker: Checking if auto-complete is possible...');
      
      // Check basic info requirements
      const hasBasicInfo = profile.phone && profile.address && profile.suburb && 
                          profile.first_name && profile.last_name;
      
      if (!hasBasicInfo || profile.onboarding_completed !== false) {
        return;
      }

      // For pet owners, basic info is sufficient
      if (profile.role === 'pet_owner') {
        console.log('Auto-completing onboarding for pet owner with complete profile');
        try {
          const { error } = await supabase
            .from('profiles')
            .update({ onboarding_completed: true })
            .eq('user_id', user.id);
            
          if (!error) {
            console.log('Successfully auto-completed pet owner onboarding');
            await refetch();
          }
        } catch (error) {
          console.error('Failed to auto-complete onboarding:', error);
        }
        return;
      }

      // For pet sitters, check additional requirements
      if (profile.role === 'pet_sitter') {
        try {
          // Check if sitter has configured services
          const { data: services, error: servicesError } = await supabase
            .from('sitter_services')
            .select('id')
            .eq('sitter_id', profile.id)
            .limit(1);

          if (servicesError) throw servicesError;

          const hasServices = services && services.length > 0;
          const hasVerificationDocs = profile.id_document_url || profile.blue_card_document_url;
          const hasStripeSetup = profile.stripe_account_enabled && profile.stripe_onboarding_completed;

          // Only auto-complete if sitter has ALL requirements
          if (hasServices && hasVerificationDocs && hasStripeSetup) {
            console.log('Auto-completing onboarding for sitter with complete profile');
            const { error } = await supabase
              .from('profiles')
              .update({ onboarding_completed: true })
              .eq('user_id', user.id);
              
            if (!error) {
              console.log('Successfully auto-completed sitter onboarding');
              await refetch();
            }
          } else {
            console.log('Sitter onboarding incomplete:', {
              hasServices,
              hasVerificationDocs,
              hasStripeSetup
            });
          }
        } catch (error) {
          console.error('Error checking sitter requirements:', error);
        }
      }
    };

    autoCompleteIfReady();
  }, [user, profile, needsOnboarding, location.pathname, refetch]);

  return null; // This is a utility component with no UI
}