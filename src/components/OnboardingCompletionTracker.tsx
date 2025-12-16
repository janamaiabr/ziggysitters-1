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
    // Only run auto-completion logic when NOT on onboarding or profile pages
    if (location.pathname.includes('/onboarding') || location.pathname.includes('/profile')) {
      console.log('OnboardingCompletionTracker: Skipping - on onboarding or profile page');
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

      // For pet owners, basic info + at least 1 pet is required
      if (profile.role === 'pet_owner') {
        try {
          // Check if pet owner has at least one pet
          const { data: pets, error: petsError } = await supabase
            .from('pets')
            .select('id')
            .eq('owner_id', profile.id)
            .limit(1);

          if (petsError) throw petsError;

          const hasPets = pets && pets.length > 0;
          
          if (!hasPets) {
            console.log('Pet owner has no pets - cannot auto-complete onboarding');
            return;
          }

          console.log('Auto-completing onboarding for pet owner with complete profile and pets');
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
          // ID document is REQUIRED - police vet is optional for gold badge
          const hasRequiredDoc = !!profile.id_document_url;
          // Accept Stripe setup as complete if onboarding is done (enabled status may take time)
          const hasStripeSetup = profile.stripe_onboarding_completed === true;

          // Only auto-complete if sitter has ALL requirements
          if (hasServices && hasRequiredDoc && hasStripeSetup) {
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
              hasRequiredDoc: hasRequiredDoc,
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