import { useState, useEffect } from 'react';
import { useGeoLocation } from './useGeoLocation';

interface SmartDefaults {
  suburb: string | null;
  city: string | null;
  isLoading: boolean;
  lastBookingPrefs: BookingPrefs | null;
}

interface BookingPrefs {
  sitterId?: string;
  sitterName?: string;
  serviceType?: string;
  petIds?: string[];
  lastBookedAt?: string;
}

const BOOKING_PREFS_KEY = 'ziggy_last_booking_prefs';
const LOCATION_KEY = 'ziggy_user_location';

export function useSmartDefaults(): SmartDefaults {
  const [defaults, setDefaults] = useState<SmartDefaults>({
    suburb: null,
    city: null,
    isLoading: true,
    lastBookingPrefs: null,
  });

  useEffect(() => {
    const loadDefaults = async () => {
      try {
        // Load last booking preferences
        const savedPrefs = localStorage.getItem(BOOKING_PREFS_KEY);
        const lastBookingPrefs = savedPrefs ? JSON.parse(savedPrefs) : null;

        // Load cached location
        const savedLocation = localStorage.getItem(LOCATION_KEY);
        let suburb = null;
        let city = null;

        if (savedLocation) {
          const loc = JSON.parse(savedLocation);
          suburb = loc.suburb;
          city = loc.city;
        } else {
          // Try to get location from browser geolocation
          if (navigator.geolocation) {
            try {
              const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  timeout: 5000,
                  maximumAge: 3600000, // 1 hour cache
                });
              });

              // Reverse geocode to get suburb/city
              const { latitude, longitude } = position.coords;
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                { signal: AbortSignal.timeout(3000) }
              );
              
              if (response.ok) {
                const data = await response.json();
                suburb = data.address?.suburb || data.address?.neighbourhood || data.address?.town;
                city = data.address?.city || data.address?.town || 'Auckland';
                
                // Cache for next time
                localStorage.setItem(LOCATION_KEY, JSON.stringify({ suburb, city }));
              }
            } catch (error) {
              console.log('[SmartDefaults] Geolocation unavailable:', error);
            }
          }
        }

        setDefaults({
          suburb,
          city,
          isLoading: false,
          lastBookingPrefs,
        });
      } catch (error) {
        console.error('[SmartDefaults] Error loading defaults:', error);
        setDefaults(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadDefaults();
  }, []);

  return defaults;
}

// Save booking preferences for quick rebooking
export function saveBookingPrefs(prefs: BookingPrefs) {
  try {
    localStorage.setItem(BOOKING_PREFS_KEY, JSON.stringify({
      ...prefs,
      lastBookedAt: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('[SmartDefaults] Error saving booking prefs:', error);
  }
}

// Clear booking preferences
export function clearBookingPrefs() {
  localStorage.removeItem(BOOKING_PREFS_KEY);
}

// Save user's location for smart defaults
export function saveUserLocation(suburb: string, city: string) {
  try {
    localStorage.setItem(LOCATION_KEY, JSON.stringify({ suburb, city }));
  } catch (error) {
    console.error('[SmartDefaults] Error saving location:', error);
  }
}
