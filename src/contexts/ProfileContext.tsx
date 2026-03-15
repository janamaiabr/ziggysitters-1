import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'pet_owner' | 'pet_sitter' | 'admin';
  phone?: string;
  address?: string;
  suburb?: string;
  city?: string;
  postal_code?: string;
  bio?: string;
  avatar_url?: string;
  is_verified?: boolean;
  verification_status?: 'pending' | 'verified' | 'rejected';
  rating?: number;
  total_reviews?: number;
  onboarding_completed?: boolean;
  
  id_document_url?: string;
  blue_card_document_url?: string;
  verification_documents_uploaded_at?: string;
  stripe_account_id?: string;
  stripe_account_enabled?: boolean;
  stripe_onboarding_completed?: boolean;
  created_at: string;
  updated_at: string;
}

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  needsOnboarding: boolean;
  updateProfile: (updates: Partial<Profile>) => Promise<{ data: any; error: any }>;
  refetch: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
      setNeedsOnboarding(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    console.log('ProfileContext: Fetching profile for user:', user?.id);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        // Don't set needsOnboarding on transient errors - this can cause redirect loops
        // Only set it when we're sure the profile doesn't exist
        console.log('ProfileContext: Error fetching profile, keeping needsOnboarding as false to prevent loops');
        setNeedsOnboarding(false);
      } else if (!data) {
        console.log('ProfileContext: No profile found, setting needsOnboarding to true');
        setNeedsOnboarding(true);
      } else {
        console.log('=== ProfileContext: Profile found ===', {
          id: data.id,
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          address: data.address,
          onboarding_completed: data.onboarding_completed,
          terms_accepted: data.terms_accepted,
          role: data.role
        });
        setProfile(data);
        
        // Simple admin check using email - avoid RLS recursion
        const isAdmin = user?.email === 'admin@ziggysitters.com';
        
        // Admin users should never need onboarding
        if (isAdmin) {
          // Ensure admin users have onboarding_completed set to true
          if (!data.onboarding_completed) {
            await supabase
              .from('profiles')
              .update({ onboarding_completed: true })
              .eq('user_id', user?.id);
            data.onboarding_completed = true;
          }
          
          console.log('ProfileContext: Admin user detected, skipping onboarding');
          setNeedsOnboarding(false);
          setProfile(data);
          setLoading(false);
          return;
        }
        
        // Check if user has completed basic profile info
        // If they have basic info, consider onboarding complete regardless of flag
        const hasBasicInfo = !!(data.first_name && data.last_name && data.phone && data.address);
        const onboardingFlagSet = data.onboarding_completed === true;
        
        // User needs onboarding only if they lack basic info AND flag is not set
        const isCompleted = hasBasicInfo || onboardingFlagSet;
        
        console.log('=== ProfileContext: Onboarding completion check ===', {
          onboardingCompleted: data.onboarding_completed,
          hasBasicInfo,
          onboardingFlagSet,
          isCompleted,
          hasPhone: !!data.phone,
          hasAddress: !!data.address,
          hasFirstName: !!data.first_name,
          hasLastName: !!data.last_name,
          role: data.role
        });
        
        const needsOnboardingValue = !isCompleted;
        console.log('=== ProfileContext: FINAL needsOnboarding ===', needsOnboardingValue);
        setNeedsOnboarding(needsOnboardingValue);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      // Don't set needsOnboarding on errors - this causes redirect loops
      console.log('ProfileContext: Catch error, keeping needsOnboarding as false to prevent loops');
      setNeedsOnboarding(false);
    } finally {
      console.log('ProfileContext: Setting loading to false');
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return { data: null, error: 'No user or profile found' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .maybeSingle();

      if (error) throw error;

      setProfile(data);
      
      // Update needsOnboarding if onboarding_completed was updated
      if ('onboarding_completed' in updates) {
        setNeedsOnboarding(!updates.onboarding_completed);
      }
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const contextValue: ProfileContextType = {
    profile,
    loading,
    needsOnboarding,
    updateProfile,
    refetch: fetchProfile
  };

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}