// Meta Pixel (Facebook Pixel) tracking utilities

declare global {
  interface Window {
    fbq: any;
  }
}

export const trackEvent = (eventName: string, data?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, data);
  }
};

// Standard events
export const metaPixel = {
  // Track page view (already tracked in base code)
  trackPageView: () => {
    trackEvent('PageView');
  },

  // Track when user completes registration
  trackCompleteRegistration: () => {
    trackEvent('CompleteRegistration');
  },

  // Track when user contacts business
  trackContact: () => {
    trackEvent('Contact');
  },

  // Track search
  trackSearch: (searchString?: string) => {
    trackEvent('Search', searchString ? { search_string: searchString } : undefined);
  },

  // Track lead submission
  trackLead: (data?: Record<string, any>) => {
    trackEvent('Lead', data);
  },

  // Track when checkout is initiated
  trackInitiateCheckout: (data?: { value?: number; currency?: string }) => {
    trackEvent('InitiateCheckout', data);
  },

  // Track purchase
  trackPurchase: (value: number, currency: string = 'NZD') => {
    trackEvent('Purchase', { value, currency });
  },

  // Track content view
  trackViewContent: (contentName?: string, contentCategory?: string) => {
    trackEvent('ViewContent', {
      content_name: contentName,
      content_category: contentCategory
    });
  },

  // Track schedule/booking
  trackSchedule: () => {
    trackEvent('Schedule');
  }
};
