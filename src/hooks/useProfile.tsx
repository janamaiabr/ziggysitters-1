import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'pet_owner' | 'pet_sitter' | 'both' | 'admin';
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

export function useProfile() {
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
    console.log('useProfile: Fetching profile for user:', user?.id);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        console.log('useProfile: Setting needsOnboarding to true due to error');
        setNeedsOnboarding(true);
      } else {
        console.log('useProfile: Profile found:', data);
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
          
          console.log('useProfile: Admin user detected, skipping onboarding');
          setNeedsOnboarding(false);
          setProfile(data);
          setLoading(false);
          return;
        }
        
        // Use the onboarding_completed flag as the primary check
        // If onboarding_completed is explicitly true, consider it completed
        const isCompleted = data.onboarding_completed === true;
        
        console.log('useProfile: Onboarding completion check:', {
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
        console.log('useProfile: Setting needsOnboarding to:', needsOnboardingValue);
        setNeedsOnboarding(needsOnboardingValue);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      console.log('useProfile: Setting needsOnboarding to true due to catch error');
      setNeedsOnboarding(true);
    } finally {
      console.log('useProfile: Setting loading to false');
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return { error: 'No user or profile found' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  return {
    profile,
    loading,
    needsOnboarding,
    updateProfile,
    refetch: fetchProfile
  };
}