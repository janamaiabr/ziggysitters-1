import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/contexts/ProfileContext';

type EventType = 'page_view' | 'button_click' | 'form_submit' | 'form_abandon' | 'onboarding' | 'search' | 'booking' | 'conversion';

interface TrackEventParams {
  eventType: EventType;
  eventName: string;
  eventData?: Record<string, any>;
  pagePath?: string;
}

// Generate or retrieve session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('ziggy_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('ziggy_session_id', sessionId);
  }
  return sessionId;
};

export function useEventTracking() {
  const { profile } = useProfile();
  const sessionStartTime = useRef<number>(Date.now());

  // Track session duration on page unload
  useEffect(() => {
    const handleUnload = () => {
      const duration = Math.round((Date.now() - sessionStartTime.current) / 1000);
      // Use sendBeacon for reliable tracking on page close
      const data = {
        user_id: profile?.id || null,
        session_id: getSessionId(),
        event_type: 'page_view',
        event_name: 'session_end',
        event_data: { duration_seconds: duration },
        page_path: window.location.pathname,
      };
      
      navigator.sendBeacon(
        `${import.meta.env.VITE_SUPABASE_URL || 'https://qermxzepyzbenemcordv.supabase.co'}/rest/v1/user_events`,
        JSON.stringify(data)
      );
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [profile?.id]);

  const trackEvent = useCallback(async ({ eventType, eventName, eventData = {}, pagePath }: TrackEventParams) => {
    try {
      const payload = {
        user_id: profile?.id || null,
        session_id: getSessionId(),
        event_type: eventType,
        event_name: eventName,
        event_data: eventData,
        page_path: pagePath || window.location.pathname,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
      };
      
      console.log('[EventTracking] Inserting event:', eventName, payload);
      
      const { error } = await supabase.from('user_events').insert(payload);
      
      if (error) {
        console.error('[EventTracking] Insert error:', error);
      } else {
        console.log('[EventTracking] Event inserted successfully:', eventName);
      }
    } catch (error) {
      console.error('[EventTracking] Exception:', error);
    }
  }, [profile?.id]);

  // Convenience methods
  const trackPageView = useCallback((pageName: string, data?: Record<string, any>) => {
    trackEvent({ eventType: 'page_view', eventName: pageName, eventData: data });
  }, [trackEvent]);

  const trackButtonClick = useCallback((buttonName: string, data?: Record<string, any>) => {
    trackEvent({ eventType: 'button_click', eventName: buttonName, eventData: data });
  }, [trackEvent]);

  const trackOnboarding = useCallback((step: string, data?: Record<string, any>) => {
    trackEvent({ eventType: 'onboarding', eventName: step, eventData: data });
  }, [trackEvent]);

  const trackFormSubmit = useCallback((formName: string, data?: Record<string, any>) => {
    trackEvent({ eventType: 'form_submit', eventName: formName, eventData: data });
  }, [trackEvent]);

  const trackFormAbandon = useCallback((formName: string, data?: Record<string, any>) => {
    trackEvent({ eventType: 'form_abandon', eventName: formName, eventData: data });
  }, [trackEvent]);

  const trackConversion = useCallback((conversionName: string, data?: Record<string, any>) => {
    trackEvent({ eventType: 'conversion', eventName: conversionName, eventData: data });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackButtonClick,
    trackOnboarding,
    trackFormSubmit,
    trackFormAbandon,
    trackConversion,
  };
}
