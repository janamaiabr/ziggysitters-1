import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/contexts/ProfileContext';

interface BehaviorEvent {
  event_type: string;
  event_name: string;
  event_data?: Record<string, any>;
  page_path?: string;
}

// Session storage key for tracking data
const TRACKING_KEY = 'ziggy_behavior_tracking';

// Get or create session ID
export const getSessionId = () => {
  let sessionId = sessionStorage.getItem('ziggy_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('ziggy_session_id', sessionId);
  }
  return sessionId;
};

// Link all session events to a user (call after signup/login)
export const linkSessionEventsToUser = async (userId: string) => {
  const sessionId = getSessionId();
  console.log('[BehaviorTracking] Linking session events to user:', userId, 'session:', sessionId);
  
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Update all anonymous events from this session to link to the user
    const { error, count } = await supabase
      .from('user_events')
      .update({ user_id: userId })
      .eq('session_id', sessionId)
      .is('user_id', null);
    
    if (error) {
      console.error('[BehaviorTracking] Error linking session events:', error);
    } else {
      console.log('[BehaviorTracking] Linked session events to user:', count);
    }
    
    return { error, count };
  } catch (error) {
    console.error('[BehaviorTracking] Exception linking session events:', error);
    return { error, count: 0 };
  }
};

// Track scroll depth (25%, 50%, 75%, 100%)
const getScrollDepth = () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight <= 0) return 100;
  return Math.round((scrollTop / docHeight) * 100);
};

export function useBehaviorTracking() {
  const location = useLocation();
  const { profile } = useProfile();
  const pageEntryTime = useRef<number>(Date.now());
  const maxScrollDepth = useRef<number>(0);
  const scrollMilestones = useRef<Set<number>>(new Set());
  const lastInteractionTime = useRef<number>(Date.now());
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const interactionCount = useRef<number>(0);
  const clickedElements = useRef<string[]>([]);

  // Track event to database
  const trackEvent = useCallback(async (event: BehaviorEvent) => {
    try {
      const payload = {
        user_id: profile?.id || null,
        session_id: getSessionId(),
        event_type: event.event_type,
        event_name: event.event_name,
        event_data: {
          ...event.event_data,
          timestamp: new Date().toISOString(),
        },
        page_path: event.page_path || location.pathname,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
      };

      console.log('[BehaviorTracking]', event.event_name, payload);

      const { error } = await supabase.from('user_events').insert(payload);
      if (error) {
        console.error('[BehaviorTracking] Insert error:', error);
      }
    } catch (error) {
      console.error('[BehaviorTracking] Exception:', error);
    }
  }, [profile?.id, location.pathname]);

  // Track page entry
  useEffect(() => {
    pageEntryTime.current = Date.now();
    maxScrollDepth.current = 0;
    scrollMilestones.current = new Set();
    interactionCount.current = 0;
    clickedElements.current = [];
    lastInteractionTime.current = Date.now();

    trackEvent({
      event_type: 'page_view',
      event_name: 'page_entered',
      event_data: {
        page: location.pathname,
        referrer: document.referrer,
        search_params: location.search,
        is_authenticated: !!profile?.id,
        user_role: profile?.role || 'anonymous',
      },
    });

    // Track page exit
    return () => {
      const timeOnPage = Math.round((Date.now() - pageEntryTime.current) / 1000);
      
      // Use sendBeacon for reliable exit tracking
      const data = {
        user_id: profile?.id || null,
        session_id: getSessionId(),
        event_type: 'page_view',
        event_name: 'page_exited',
        event_data: {
          page: location.pathname,
          time_on_page_seconds: timeOnPage,
          max_scroll_depth: maxScrollDepth.current,
          interaction_count: interactionCount.current,
          clicked_elements: clickedElements.current.slice(0, 20), // Limit to 20
        },
        page_path: location.pathname,
      };

      // Try to send via beacon, fall back to regular tracking
      try {
        navigator.sendBeacon(
          `${import.meta.env.VITE_SUPABASE_URL || 'https://qermxzepyzbenemcordv.supabase.co'}/rest/v1/user_events`,
          JSON.stringify(data)
        );
      } catch {
        // Beacon failed, track normally (may not complete)
        trackEvent({
          event_type: 'page_view',
          event_name: 'page_exited',
          event_data: data.event_data,
        });
      }
    };
  }, [location.pathname]);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const depth = getScrollDepth();
      if (depth > maxScrollDepth.current) {
        maxScrollDepth.current = depth;
      }

      // Track milestones: 25%, 50%, 75%, 100%
      const milestones = [25, 50, 75, 100];
      for (const milestone of milestones) {
        if (depth >= milestone && !scrollMilestones.current.has(milestone)) {
          scrollMilestones.current.add(milestone);
          trackEvent({
            event_type: 'engagement',
            event_name: 'scroll_milestone',
            event_data: {
              milestone,
              time_to_milestone_seconds: Math.round((Date.now() - pageEntryTime.current) / 1000),
            },
          });
        }
      }

      lastInteractionTime.current = Date.now();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackEvent]);

  // Track clicks and interactions with heatmap coordinates
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      interactionCount.current++;
      lastInteractionTime.current = Date.now();

      const target = e.target as HTMLElement;
      const elementInfo = getElementInfo(target);
      
      // Get viewport-relative coordinates for heatmap
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const xPercent = Math.round((e.clientX / viewportWidth) * 100);
      const yPercent = Math.round((e.clientY / viewportHeight) * 100);
      const scrollY = window.scrollY;
      const pageY = e.pageY;
      
      if (elementInfo) {
        clickedElements.current.push(elementInfo);
        
        // Track ALL clicks with heatmap data
        trackEvent({
          event_type: 'interaction',
          event_name: 'click_heatmap',
          event_data: {
            element: elementInfo,
            text: target.textContent?.substring(0, 50),
            href: (target as HTMLAnchorElement).href || null,
            // Heatmap coordinates
            x: e.clientX,
            y: e.clientY,
            x_percent: xPercent,
            y_percent: yPercent,
            page_y: pageY,
            scroll_y: scrollY,
            viewport_width: viewportWidth,
            viewport_height: viewportHeight,
            time_on_page: Math.round((Date.now() - pageEntryTime.current) / 1000),
            is_important: isImportantClick(target),
          },
        });
      }
    };

    document.addEventListener('click', handleClick, { capture: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, [trackEvent]);

  // Track idle time (user inactive for 30+ seconds)
  useEffect(() => {
    const checkIdle = () => {
      const idleTime = Date.now() - lastInteractionTime.current;
      if (idleTime >= 30000) {
        trackEvent({
          event_type: 'engagement',
          event_name: 'user_idle',
          event_data: {
            idle_duration_seconds: Math.round(idleTime / 1000),
            last_scroll_depth: maxScrollDepth.current,
            interaction_count: interactionCount.current,
          },
        });
      }
    };

    idleTimerRef.current = setInterval(checkIdle, 30000);
    return () => {
      if (idleTimerRef.current) {
        clearInterval(idleTimerRef.current);
      }
    };
  }, [trackEvent]);

  // Track visibility changes (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackEvent({
          event_type: 'engagement',
          event_name: 'tab_hidden',
          event_data: {
            time_on_page: Math.round((Date.now() - pageEntryTime.current) / 1000),
            scroll_depth: maxScrollDepth.current,
          },
        });
      } else {
        trackEvent({
          event_type: 'engagement',
          event_name: 'tab_visible',
          event_data: {
            was_hidden_for: Math.round((Date.now() - lastInteractionTime.current) / 1000),
          },
        });
        lastInteractionTime.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [trackEvent]);

  // Manual tracking methods
  const trackAction = useCallback((actionName: string, data?: Record<string, any>) => {
    trackEvent({
      event_type: 'action',
      event_name: actionName,
      event_data: {
        ...data,
        time_on_page: Math.round((Date.now() - pageEntryTime.current) / 1000),
        scroll_depth: maxScrollDepth.current,
      },
    });
  }, [trackEvent]);

  const trackFormInteraction = useCallback((formName: string, action: 'started' | 'field_focused' | 'field_blurred' | 'submitted' | 'abandoned', fieldName?: string, data?: Record<string, any>) => {
    trackEvent({
      event_type: 'form',
      event_name: `form_${action}`,
      event_data: {
        form_name: formName,
        field_name: fieldName,
        ...data,
        time_on_page: Math.round((Date.now() - pageEntryTime.current) / 1000),
      },
    });
  }, [trackEvent]);

  const trackNavigation = useCallback((from: string, to: string, trigger: string) => {
    trackEvent({
      event_type: 'navigation',
      event_name: 'navigated',
      event_data: {
        from,
        to,
        trigger,
        time_on_previous_page: Math.round((Date.now() - pageEntryTime.current) / 1000),
        scroll_depth_at_navigation: maxScrollDepth.current,
      },
    });
  }, [trackEvent]);

  const trackDropoff = useCallback((stage: string, reason?: string, data?: Record<string, any>) => {
    trackEvent({
      event_type: 'dropoff',
      event_name: 'user_dropoff',
      event_data: {
        stage,
        reason,
        ...data,
        time_on_page: Math.round((Date.now() - pageEntryTime.current) / 1000),
        scroll_depth: maxScrollDepth.current,
        interaction_count: interactionCount.current,
      },
    });
  }, [trackEvent]);

  return {
    trackAction,
    trackFormInteraction,
    trackNavigation,
    trackDropoff,
    trackEvent,
  };
}

// Helper to get element info for tracking
function getElementInfo(element: HTMLElement): string | null {
  // Build a selector-like string for the element
  const tag = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : '';
  const classes = element.className && typeof element.className === 'string' 
    ? `.${element.className.split(' ').slice(0, 3).join('.')}` 
    : '';
  const dataTestId = element.getAttribute('data-testid') ? `[data-testid="${element.getAttribute('data-testid')}"]` : '';
  const ariaLabel = element.getAttribute('aria-label') ? `[aria-label="${element.getAttribute('aria-label')?.substring(0, 30)}"]` : '';
  
  // Get the role or element purpose
  const role = element.getAttribute('role') || '';
  const href = (element as HTMLAnchorElement).href ? `[href]` : '';
  
  const selector = `${tag}${id}${classes}${dataTestId}${ariaLabel}${href}`.substring(0, 100);
  
  return selector || null;
}

// Check if click is important enough to track individually
function isImportantClick(element: HTMLElement): boolean {
  const tag = element.tagName.toLowerCase();
  const isInteractive = ['a', 'button', 'input', 'select', 'textarea'].includes(tag);
  const hasRole = element.getAttribute('role') === 'button' || element.getAttribute('role') === 'link';
  const isClickable = element.classList.contains('cursor-pointer') || element.onclick !== null;
  const isNavItem = element.closest('nav') !== null;
  const isCTA = element.textContent?.toLowerCase().includes('book') || 
                element.textContent?.toLowerCase().includes('search') ||
                element.textContent?.toLowerCase().includes('sign') ||
                element.textContent?.toLowerCase().includes('get started') ||
                element.textContent?.toLowerCase().includes('find');
  
  return isInteractive || hasRole || isClickable || isNavItem || isCTA;
}
