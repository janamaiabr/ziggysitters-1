import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Generate or retrieve session ID for tracking anonymous users
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('search_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('search_session_id', sessionId);
  }
  return sessionId;
};

interface SearchParams {
  suburb?: string;
  city?: string;
  serviceType?: string;
  petSpecies?: string[];
  petSize?: string[];
  resultsCount?: number;
}

export const useSearchTracking = () => {
  const { user } = useAuth();
  const [clickedSitters, setClickedSitters] = useState<string[]>([]);

  const trackSearch = async (params: SearchParams) => {
    try {
      const sessionId = getSessionId();
      
      const { error } = await supabase
        .from('search_events')
        .insert({
          user_id: user?.id || null,
          session_id: sessionId,
          search_timestamp: new Date().toISOString(),
          suburb: params.suburb,
          city: params.city,
          service_type: params.serviceType,
          pet_species: params.petSpecies,
          pet_size: params.petSize,
          results_count: params.resultsCount,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
        });

      if (error) {
        console.error('Error tracking search:', error);
      }
    } catch (err) {
      console.error('Failed to track search:', err);
    }
  };

  const trackSitterClick = async (sitterId: string) => {
    setClickedSitters(prev => {
      if (prev.includes(sitterId)) return prev;
      return [...prev, sitterId];
    });

    try {
      const sessionId = getSessionId();
      
      // Update the most recent search event with clicked sitter
      const { data: recentSearch, error: selectError } = await supabase
        .from('search_events')
        .select('id, clicked_sitter_ids')
        .eq('session_id', sessionId)
        .order('search_timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (selectError) {
        console.error('Error fetching search event:', selectError);
        return;
      }

      if (recentSearch) {
        const existingClicks = recentSearch.clicked_sitter_ids || [];
        // Avoid duplicates
        if (existingClicks.includes(sitterId)) return;
        
        const updatedClicks = [...existingClicks, sitterId];
        
        const { error: updateError } = await supabase
          .from('search_events')
          .update({ clicked_sitter_ids: updatedClicks })
          .eq('id', recentSearch.id);

        if (updateError) {
          console.error('Error updating sitter clicks:', updateError);
        }
      }
    } catch (err) {
      console.error('Failed to track sitter click:', err);
    }
  };

  return {
    trackSearch,
    trackSitterClick,
    clickedSitters,
  };
};
