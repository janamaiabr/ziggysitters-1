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

// Full search context to preserve across login
interface SearchContext {
  location?: string;
  serviceType?: string;
  checkIn?: string;
  checkOut?: string;
  clickedSitterId?: string;
  clickedSitterName?: string;
}

const SEARCH_CONTEXT_KEY = 'pre_login_search_context';

export const useSearchTracking = () => {
  const { user } = useAuth();
  const [clickedSitters, setClickedSitters] = useState<string[]>([]);
  const [hasLinkedSession, setHasLinkedSession] = useState(false);

  // CRITICAL: Link previous anonymous searches to user after login
  // Uses auth user.id (NOT profile.id) to match onboarding_funnel view
  useEffect(() => {
    const linkPreviousSearches = async () => {
      if (!user?.id || hasLinkedSession) return;
      
      const sessionId = getSessionId();
      console.log('Linking previous searches for session:', sessionId, 'to auth user:', user.id);
      
      try {
        // Update all search events from this session that don't have a user_id
        const { error } = await supabase
          .from('search_events')
          .update({ user_id: user.id })
          .eq('session_id', sessionId)
          .is('user_id', null);
        
        if (error) {
          console.error('Error linking previous searches:', error);
        } else {
          console.log('Successfully linked previous searches to auth user');
          setHasLinkedSession(true);
        }
      } catch (err) {
        console.error('Failed to link previous searches:', err);
      }
    };
    
    linkPreviousSearches();
  }, [user?.id, hasLinkedSession]);

  const trackSearch = async (params: SearchParams) => {
    try {
      const sessionId = getSessionId();
      
      // CRITICAL: Use auth user.id (NOT profile.id) to match onboarding_funnel view
      const { error } = await supabase
        .from('search_events')
        .insert({
          user_id: user?.id || null, // Use auth user.id for consistency with onboarding_funnel
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
      } else {
        console.log('Search tracked successfully for user:', user?.id || 'anonymous');
      }
    } catch (err) {
      console.error('Failed to track search:', err);
    }
  };

  // Save the FULL search context before login (location, dates, service type, clicked sitter)
  const saveSearchContext = (context: SearchContext) => {
    const existing = getSearchContext() || {};
    const merged = { ...existing, ...context };
    sessionStorage.setItem(SEARCH_CONTEXT_KEY, JSON.stringify(merged));
    console.log('Saved search context:', merged);
  };

  // Get the preserved search context
  const getSearchContext = (): SearchContext | null => {
    try {
      const stored = sessionStorage.getItem(SEARCH_CONTEXT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  // Clear after use (after successful redirect post-login)
  const clearSearchContext = () => {
    sessionStorage.removeItem(SEARCH_CONTEXT_KEY);
    sessionStorage.removeItem('last_clicked_sitter_id');
    console.log('Cleared search context');
  };

  const trackSitterClick = async (sitterId: string, sitterName?: string) => {
    setClickedSitters(prev => {
      if (prev.includes(sitterId)) return prev;
      return [...prev, sitterId];
    });

    // Store clicked sitter in context so user can return after registration
    saveSearchContext({ 
      clickedSitterId: sitterId,
      clickedSitterName: sitterName 
    });
    
    // Also keep legacy storage for backwards compatibility
    sessionStorage.setItem('last_clicked_sitter_id', sitterId);
    console.log('Stored last clicked sitter:', sitterId, sitterName);

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

  // Get the last clicked sitter ID (for post-registration redirect)
  const getLastClickedSitter = (): string | null => {
    const context = getSearchContext();
    return context?.clickedSitterId || sessionStorage.getItem('last_clicked_sitter_id');
  };

  // Clear the last clicked sitter (after using it for redirect)
  const clearLastClickedSitter = () => {
    sessionStorage.removeItem('last_clicked_sitter_id');
    // Also clear from context
    const context = getSearchContext();
    if (context) {
      delete context.clickedSitterId;
      delete context.clickedSitterName;
      sessionStorage.setItem(SEARCH_CONTEXT_KEY, JSON.stringify(context));
    }
  };

  return {
    trackSearch,
    trackSitterClick,
    clickedSitters,
    getLastClickedSitter,
    clearLastClickedSitter,
    // NEW: Full context methods for seamless journey
    saveSearchContext,
    getSearchContext,
    clearSearchContext,
  };
};
