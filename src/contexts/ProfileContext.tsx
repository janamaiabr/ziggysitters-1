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
        console.log('ProfileContext: Setting needsOnboarding to true due to error');
        setNeedsOnboarding(true);
      } else if (!data) {
        console.log('ProfileContext: No profile found, setting needsOnboarding to true');
        setNeedsOnboarding(true);
      } else {
        console.log('ProfileContext: Profile found:', data);
        setProfile(data);
        
        // Admin users should never need onboarding
        if (data.role === 'admin') {
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
        
        // Use the onboarding_completed flag as the primary check
        // If onboarding_completed is explicitly true, consider it completed
        const isCompleted = data.onboarding_completed === true;
        
        console.log('ProfileContext: Onboarding completion check:', {
          onboardingCompleted: data.onboarding_completed,
          isCompleted,
          hasPhone: !!data.phone,
          hasAddress: !!data.address,
          hasSuburb: !!data.suburb,
          hasFirstName: !!data.first_name,
          hasLastName: !!data.last_name,
          role: data.role
        });
        
        const needsOnboardingValue = !isCompleted;
        console.log('ProfileContext: Setting needsOnboarding to:', needsOnboardingValue);
        setNeedsOnboarding(needsOnboardingValue);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      console.log('ProfileContext: Setting needsOnboarding to true due to catch error');
      setNeedsOnboarding(true);
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