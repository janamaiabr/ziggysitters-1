import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
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
      return;
    }

    // Auto-complete onboarding for users who have basic info but missing completion flag
    const autoCompleteIfReady = async () => {
      if (!user || !profile || !needsOnboarding) return;
      
      // Check if user has all required fields but onboarding_completed is false
      const hasBasicInfo = profile.phone && profile.address && profile.suburb && 
                          profile.first_name && profile.last_name;
      
      if (hasBasicInfo && profile.onboarding_completed === false) {
        console.log('Auto-completing onboarding for user with complete profile');
        try {
          const { error } = await supabase
            .from('profiles')
            .update({ onboarding_completed: true })
            .eq('user_id', user.id);
            
          if (!error) {
            console.log('Successfully auto-completed onboarding');
            // Refetch profile instead of reloading the page
            await refetch();
          }
        } catch (error) {
          console.error('Failed to auto-complete onboarding:', error);
        }
      }
    };

    autoCompleteIfReady();
  }, [user, profile, needsOnboarding, location.pathname, refetch]);

  return null; // This is a utility component with no UI
}