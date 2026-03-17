// GA4 Analytics utility for ZiggySitters
// Measurement ID: G-H9K8JN5BB9

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

/**
 * Send a custom GA4 event
 */
export function trackGA4Event(eventName: string, params?: Record<string, any>) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
      console.log('[GA4] Event:', eventName, params);
    }
  } catch (e) {
    console.warn('[GA4] Failed to track event:', eventName, e);
  }
}

// ── Conversion Events ──────────────────────────────────────────

export const ga4 = {
  /** User views a sitter profile page */
  viewSitterProfile: (sitterId: string, sitterName: string, location: string) => {
    trackGA4Event('view_sitter_profile', {
      sitter_id: sitterId,
      sitter_name: sitterName,
      sitter_location: location,
    });
  },

  /** User clicks any booking/contact button */
  clickBook: (sitterId: string, sitterName: string, source: string) => {
    trackGA4Event('click_book', {
      sitter_id: sitterId,
      sitter_name: sitterName,
      source,
    });
  },

  /** User clicks to message a sitter */
  clickMessage: (sitterId: string, sitterName: string, isGuest: boolean) => {
    trackGA4Event('click_message', {
      sitter_id: sitterId,
      sitter_name: sitterName,
      is_guest: isGuest,
    });
  },

  /** Booking form is opened/viewed */
  startBooking: (sitterId: string, sitterName: string, serviceType?: string) => {
    trackGA4Event('start_booking', {
      sitter_id: sitterId,
      sitter_name: sitterName,
      service_type: serviceType || 'unknown',
    });
  },

  /** Booking form is submitted successfully */
  completeBooking: (sitterId: string, sitterName: string, serviceType: string, totalAmount: number, currency: string = 'NZD') => {
    trackGA4Event('complete_booking', {
      sitter_id: sitterId,
      sitter_name: sitterName,
      service_type: serviceType,
      value: totalAmount,
      currency,
    });
  },

  /** User performs a search on find-sitters */
  searchSitters: (location: string, serviceType: string, resultsCount: number) => {
    trackGA4Event('search_sitters', {
      search_location: location || 'any',
      search_service: serviceType || 'any',
      results_count: resultsCount,
    });
  },

  /** Guest sends an enquiry (no account) */
  guestEnquiry: (sitterId: string, sitterName: string) => {
    trackGA4Event('guest_enquiry', {
      sitter_id: sitterId,
      sitter_name: sitterName,
    });
  },

  /** User clicks a sitter card from search results */
  clickSitterCard: (sitterId: string, sitterName: string, position: number) => {
    trackGA4Event('click_sitter_card', {
      sitter_id: sitterId,
      sitter_name: sitterName,
      position,
    });
  },

  /** User clicks signup/auth button (conversion event) */
  clickSignup: (source: string) => {
    trackGA4Event('sign_up_click', {
      source,
      event_category: 'conversion',
    });
  },

  /** User completes signup/auth (conversion event) */
  completeSignup: (method: string) => {
    trackGA4Event('sign_up', {
      method,
      event_category: 'conversion',
    });
  },

  /** Sitter lead form submitted */
  sitterLeadSubmit: (source: string) => {
    trackGA4Event('generate_lead', {
      source,
      event_category: 'conversion',
      currency: 'NZD',
      value: 1,
    });
  },

  /** CTA button clicked */
  ctaClick: (ctaText: string, page: string) => {
    trackGA4Event('cta_click', {
      cta_text: ctaText,
      page,
      event_category: 'engagement',
    });
  },
};
