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
  rating?: number;
  total_reviews?: number;
  
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
        // Check if profile needs completion - more comprehensive check
        const isIncomplete = !data.phone || !data.address || !data.suburb || 
                             !data.first_name || !data.last_name;
        
        // Additional check for role-specific completion
        let roleSpecificIncomplete = false;
        if (data.role === 'pet_owner' || data.role === 'both') {
          // Check if user has pets registered (simplified check)
          roleSpecificIncomplete = false; // We'll check this in the onboarding flow
        }
        
        console.log('useProfile: Profile incomplete?', isIncomplete || roleSpecificIncomplete, {
          hasPhone: !!data.phone,
          hasAddress: !!data.address,
          hasSuburb: !!data.suburb,
          hasFirstName: !!data.first_name,
          hasLastName: !!data.last_name,
          role: data.role
        });
        setNeedsOnboarding(isIncomplete || roleSpecificIncomplete);
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