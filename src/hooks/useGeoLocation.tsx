import { useState, useEffect } from 'react';

interface GeoLocation {
  country: string | null;
  countryCode: string | null;
  isLoading: boolean;
  isNZ: boolean;
}

// Use a free geo IP service
export function useGeoLocation(): GeoLocation {
  const [location, setLocation] = useState<GeoLocation>({
    country: null,
    countryCode: null,
    isLoading: true,
    isNZ: true, // Default to true to not show warning unnecessarily
  });

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        // Check if we already have cached location
        const cached = sessionStorage.getItem('geo_location');
        if (cached) {
          const parsed = JSON.parse(cached);
          setLocation({
            ...parsed,
            isLoading: false,
          });
          return;
        }

        // Use ipapi.co free tier (1000 req/day, no API key needed)
        const response = await fetch('https://ipapi.co/json/', {
          signal: AbortSignal.timeout(3000), // 3 second timeout
        });
        
        if (!response.ok) throw new Error('Geo lookup failed');
        
        const data = await response.json();
        const countryCode = data.country_code || data.country;
        const isNZ = countryCode === 'NZ';
        
        const result = {
          country: data.country_name || null,
          countryCode: countryCode || null,
          isNZ,
        };
        
        // Cache the result
        sessionStorage.setItem('geo_location', JSON.stringify(result));
        
        setLocation({
          ...result,
          isLoading: false,
        });
      } catch (error) {
        console.log('[GeoLocation] Could not determine location:', error);
        // On error, assume NZ to not show warning
        setLocation({
          country: null,
          countryCode: null,
          isLoading: false,
          isNZ: true,
        });
      }
    };

    fetchLocation();
  }, []);

  return location;
}
