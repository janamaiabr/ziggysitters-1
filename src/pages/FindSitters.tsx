import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Filter, Search, X, Home, Map, List } from 'lucide-react';
import SitterVerificationBadge from '@/components/sitter/SitterVerificationBadge';
import { supabase } from '@/integrations/supabase/client';
import FilterPanel from '@/components/search/FilterPanel';
import SuburbAutocomplete from '@/components/search/SuburbAutocomplete';
import { useIsMobile } from '@/hooks/use-mobile';
import { metaPixel } from '@/lib/metaPixel';
import { useSearchTracking } from '@/hooks/useSearchTracking';
import { useEventTracking } from '@/hooks/useEventTracking';
import EmailCaptureModal from '@/components/home/EmailCaptureModal';
import NoResultsSection from '@/components/search/NoResultsSection';
import EnhancedSitterCard from '@/components/search/EnhancedSitterCard';
import AddPetsPrompt from '@/components/search/AddPetsPrompt';
import SitterMap from '@/components/map/SitterMap';
import { format } from 'date-fns';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuth } from '@/hooks/useAuth';
import { ga4 } from '@/lib/ga4';

// No more mock data - using real database profiles

export default function FindSitters() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const { trackSearch, trackSitterClick, saveSearchContext } = useSearchTracking();
  const { trackEvent, trackPageView } = useEventTracking();
  const { user } = useAuth();
  const { profile } = useProfile();

  // Track page view on mount
  useEffect(() => {
    trackPageView('find_sitters_page', { 
      initial_location: searchParams.get('location'),
      initial_service: searchParams.get('serviceType')
    });
  }, []);
  const [location, setLocation] = useState(searchParams.get('location') || searchParams.get('suburb') || '');
  const [nameSearch, setNameSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(
    searchParams.get('checkIn') ? new Date(searchParams.get('checkIn')!) : undefined
  );
  const [checkOutDate, setCheckOutDate] = useState<Date>(
    searchParams.get('checkOut') ? new Date(searchParams.get('checkOut')!) : undefined
  );
  const [serviceType, setServiceType] = useState(searchParams.get('serviceType') || '');
  const [petType, setPetType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [allSitters, setAllSitters] = useState<any[]>([]);
  const [filteredSitters, setFilteredSitters] = useState<any[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<any>(null);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [nearbySitters, setNearbySitters] = useState<any[]>([]);
  const SITTERS_PER_PAGE = 20;
  const [displayLimit, setDisplayLimit] = useState(SITTERS_PER_PAGE);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Show email capture modal after search with delay
  useEffect(() => {
    if (searchPerformed && filteredSitters.length > 0) {
      // Check if already shown this session
      const alreadyShown = sessionStorage.getItem('emailCaptureShown');
      if (alreadyShown) return;

      // Show after 30 seconds of browsing
      const timer = setTimeout(() => {
        setShowEmailCapture(true);
        sessionStorage.setItem('emailCaptureShown', 'true');
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [searchPerformed, filteredSitters]);

  const [isLoading, setIsLoading] = useState(true);

  // Load sitters from the secure database function - OPTIMIZED with parallel queries
  useEffect(() => {
    const fetchSitters = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching sitters...');
        
        // PARALLEL queries for faster loading - including young walkers
        const [sittersResult, servicesResult, areasResult, youngWalkersResult] = await Promise.all([
          supabase.rpc('get_public_sitters'),
          supabase.from('sitter_services').select('*').eq('is_offered', true),
          supabase.from('sitter_service_areas').select('sitter_id, suburb, is_primary'),
          supabase.from('young_walkers').select('*').eq('status', 'active')
        ]);
        
        const profilesData = sittersResult.data;
        const servicesData = servicesResult.data;
        const serviceAreasData = areasResult.data;
        const youngWalkersData = youngWalkersResult.data;
        
        if (sittersResult.error) {
          console.error('Error fetching profiles:', sittersResult.error);
          setAllSitters([]);
          setFilteredSitters([]);
          setIsLoading(false);
          return;
        }

        // Transform data
        const transformedSitters = (profilesData || []).map(sitter => {
          const sitterServices = (servicesData || []).filter(s => s.sitter_id === sitter.id);
          const sitterAreas = (serviceAreasData || []).filter(a => a.sitter_id === sitter.id);
          const serviceNames = sitterServices.map(s => {
            const serviceMap: { [key: string]: string } = {
              'pet_sitting_owners_home': 'Pet Sitting (Your Home)',
              'pet_sitting_sitters_home': 'Pet Sitting (Sitter\'s Home)', 
              'drop_in_visits': 'Drop-in Visits'
            };
            return serviceMap[s.service_type] || s.service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          });
          
          const rates = sitterServices.map(s => s.hourly_rate || s.daily_rate || s.overnight_rate || 25).filter(r => r > 0);
          const minRate = rates.length > 0 ? Math.min(...rates) : 25;

          return {
            id: sitter.id,
            name: `${sitter.first_name} ${sitter.last_name.charAt(0)}.`,
            location: `${sitter.suburb || ''}, ${sitter.city || 'Auckland'}`.replace(/^, /, ''),
            city: sitter.city || '',
            suburb: sitter.suburb || '',
            serviceAreas: sitterAreas.map(a => a.suburb),
            rating: null,
            feedback_count: null,
            baseRate: minRate,
            hourlyRate: minRate,
            bio: sitter.bio || 'Experienced pet sitter who loves caring for animals.',
            image: sitter.avatar_url || null,
            services: serviceNames,
            sitterServices: sitterServices,
            age: 25,
            experience: '2+ years',
            verified: sitter.is_verified || false,
            golden_badge: sitter.golden_badge_approved || false,
            instant_booking: false,
            pet_types: ['dogs'],
            isYoungWalker: false,
            latitude: sitter.latitude || null,
            longitude: sitter.longitude || null,
          };
        });

        // Transform young walkers to match sitter format
        const transformedYoungWalkers = (youngWalkersData || []).map(walker => {
          // Calculate age
          const today = new Date();
          const birthDate = new Date(walker.child_date_of_birth);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          
          return {
            id: walker.id,
            name: `${walker.child_first_name} ${walker.child_last_name.charAt(0)}.`,
            location: `${walker.home_suburb}, ${walker.home_city}`,
            city: walker.home_city || '',
            suburb: walker.home_suburb || '',
            serviceAreas: [walker.home_suburb],
            rating: null,
            feedback_count: null,
            baseRate: walker.rate_per_walk,
            hourlyRate: walker.rate_per_walk,
            bio: walker.bio || `Young dog walker, age ${age}. ${walker.experience_with_dogs || 'Enthusiastic about walking dogs!'}`,
            image: null,
            services: ['Dog Walking'],
            sitterServices: [],
            age: age,
            experience: 'Young walker',
            verified: true, // Parent supervised
            golden_badge: false,
            instant_booking: false,
            pet_types: ['dogs'],
            isYoungWalker: true,
            youngWalkerAge: age,
            acceptedDogSizes: walker.accepted_dog_sizes
          };
        });

        // Filter to only show quality, bookable sitters
        // Must have: completed onboarding, profile photo, and at least one service
        // This prevents "Sitter Not Found" errors on profile pages
        const bookableSitters = transformedSitters.filter(sitter => {
          const hasServices = sitter.services && sitter.services.length > 0;
          const hasAvatar = !!sitter.image;
          // onboarding_completed comes from the RPC data
          const rawSitter = (profilesData || []).find(p => p.id === sitter.id);
          const hasCompletedOnboarding = rawSitter?.onboarding_completed === true;
          return hasServices && hasAvatar && hasCompletedOnboarding;
        });

        // Combine sitters and young walkers
        const allListings = [...bookableSitters, ...transformedYoungWalkers];
        
        // Sort sitters: verified first, golden badge, then Auckland, then by presence of avatar
        const sortedSitters = allListings.sort((a, b) => {
          // Golden badge (police vet) first
          if (a.golden_badge && !b.golden_badge) return -1;
          if (!a.golden_badge && b.golden_badge) return 1;
          // Verified next
          if (a.verified && !b.verified) return -1;
          if (!a.verified && b.verified) return 1;
          // Auckland sitters prioritized
          const aIsAuckland = (a.city || '').toLowerCase().includes('auckland');
          const bIsAuckland = (b.city || '').toLowerCase().includes('auckland');
          if (aIsAuckland && !bIsAuckland) return -1;
          if (!aIsAuckland && bIsAuckland) return 1;
          // Has profile photo
          if (a.image && !b.image) return -1;
          if (!a.image && b.image) return 1;
          return 0;
        });
        
        setAllSitters(sortedSitters);
        setFilteredSitters(sortedSitters);
        
        // CRITICAL: Auto-track when page loads with results
        // This ensures users who land on the page see tracked activity
        if (sortedSitters.length > 0) {
          const urlLocation = searchParams.get('location') || '';
          const urlService = searchParams.get('serviceType') || '';
          
          console.log('Auto-tracking page load with sitters:', sortedSitters.length);
          trackSearch({
            suburb: urlLocation || 'browse_all',
            city: 'Auckland',
            serviceType: urlService || 'any',
            resultsCount: sortedSitters.length,
          });
          
          // Mark search as performed so UI shows properly
          setSearchPerformed(true);
        }
      } catch (error) {
        console.error('Error in fetchSitters:', error);
        setAllSitters([]);
        setFilteredSitters([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSitters();
  }, []);

  // Auto-search with filters when URL params are present
  useEffect(() => {
    if (allSitters.length > 0 && (searchParams.get('checkIn') || searchParams.get('location') || searchParams.get('serviceType'))) {
      handleSearch();
    }
  }, [allSitters]); // Run when sitters are loaded

  const handleSearch = async () => {
    console.log('Performing search with:', { location, serviceType, petType, selectedDate, checkOutDate, nameSearch });
    
    // Track search event
    metaPixel.trackSearch(location || serviceType || 'sitters');
    
    let filtered = [...allSitters];

    // Filter by name search
    if (nameSearch.trim()) {
      const searchName = nameSearch.toLowerCase().trim();
      filtered = filtered.filter(sitter => 
        sitter.name.toLowerCase().includes(searchName)
      );
    }

    // RELAXED FILTERING: Show sitters even without exact location match
    // Priority: service area match > exact match > partial match > same city > all sitters
    // This increases visibility and conversion since we have limited sitters
    
    // ALL Auckland suburbs - sitters in ANY of these are considered "Auckland sitters"
    const AUCKLAND_SUBURBS = [
      'ponsonby', 'newmarket', 'mount eden', 'mt eden', 'parnell', 'remuera', 'epsom',
      'grey lynn', 'freemans bay', 'herne bay', 'grafton', 'eden terrace', 'newton',
      'kingsland', 'morningside', 'saint lukes', 'st lukes', 'mount albert', 'mt albert',
      'sandringham', 'balmoral', 'mount roskill', 'mt roskill', 'three kings', 'onehunga',
      'royal oak', 'ellerslie', 'penrose', 'mount wellington', 'mt wellington', 'sylvia park',
      'panmure', 'glen innes', 'point england', 'kohimarama', 'mission bay', 'saint heliers',
      'st heliers', 'glendowie', 'meadowbank', 'orakei', 'devonport', 'takapuna', 'milford',
      'forrest hill', 'sunnynook', 'glenfield', 'birkenhead', 'northcote', 'hillcrest',
      'beach haven', 'birkdale', 'browns bay', 'rothesay bay', 'murrays bay', 'mairangi bay',
      'campbells bay', 'castor bay', 'long bay', 'torbay', 'albany', 'henderson', 'new lynn',
      'glen eden', 'titirangi', 'green bay', 'kelston', 'avondale', 'blockhouse bay',
      'new windsor', 'rosebank', 'waterview', 'point chevalier', 'western springs', 'westmere',
      'mangere', 'otahuhu', 'papatoetoe', 'manurewa', 'papakura', 'pukekohe', 'waiuku',
      'botany downs', 'botany', 'howick', 'pakuranga', 'bucklands beach', 'half moon bay',
      'beachlands', 'maraetai', 'manukau', 'te atatu', 'hobsonville', 'massey', 'westgate',
      'kumeu', 'huapai', 'riverhead', 'helensville', 'orewa', 'whangaparaoa', 'silverdale',
      'auckland central', 'auckland cbd', 'city centre'
    ];
    
    // Helper to check if a suburb is in Auckland
    const isAucklandSuburb = (suburb: string) => {
      if (!suburb) return false;
      const normalized = suburb.toLowerCase().trim();
      return AUCKLAND_SUBURBS.some(auckSuburb => 
        normalized.includes(auckSuburb) || auckSuburb.includes(normalized)
      );
    };
    
    // Helper to check if a sitter covers Auckland
    const sitterCoversAuckland = (sitter: any) => {
      // Check their city
      const city = (sitter.city || '').toLowerCase();
      if (city.includes('auckland') || city === '') {
        return true;
      }
      // Check their suburb
      if (isAucklandSuburb(sitter.suburb)) {
        return true;
      }
      // Check their service areas
      if (sitter.serviceAreas?.some((area: string) => isAucklandSuburb(area))) {
        return true;
      }
      return false;
    };
    
    if (location && serviceType !== 'pet_sitting_owners_home') {
      const searchTerm = location.toLowerCase().trim();
      
      // If searching for "Auckland" or similar, show ALL sitters who serve any Auckland suburb
      if (searchTerm === 'auckland' || searchTerm.includes('auckland')) {
        filtered = filtered.filter(sitter => sitterCoversAuckland(sitter));
        console.log('Auckland search - found sitters:', filtered.length);
      } else {
        // For specific suburb searches, check service areas first, then location
        // Sort by relevance: service area match first, then suburb match, then city match
        filtered = filtered.sort((a, b) => {
          const aServiceAreaMatch = a.serviceAreas?.some((area: string) => 
            area.toLowerCase().includes(searchTerm) || searchTerm.includes(area.toLowerCase())
          );
          const bServiceAreaMatch = b.serviceAreas?.some((area: string) => 
            area.toLowerCase().includes(searchTerm) || searchTerm.includes(area.toLowerCase())
          );
          const aLocationMatch = a.location.toLowerCase().includes(searchTerm);
          const bLocationMatch = b.location.toLowerCase().includes(searchTerm);
          
          // Service area matches get highest priority
          if (aServiceAreaMatch && !bServiceAreaMatch) return -1;
          if (!aServiceAreaMatch && bServiceAreaMatch) return 1;
          // Then location matches
          if (aLocationMatch && !bLocationMatch) return -1;
          if (!aLocationMatch && bLocationMatch) return 1;
          // Keep golden badge priority within same match level
          if (a.golden_badge && !b.golden_badge) return -1;
          if (!a.golden_badge && b.golden_badge) return 1;
          return 0;
        });
      }
    }

    // Filter by service type - ONLY if one is selected
    // If no service type selected, show ALL sitters (more lenient for better UX)
    if (serviceType && serviceType.trim() !== '') {
      const serviceMap: { [key: string]: string } = {
        'pet_sitting_owners_home': 'Pet Sitting (Your Home)',
        'pet_sitting_sitters_home': 'Pet Sitting (Sitter\'s Home)', 
        'drop_in_visits': 'Drop-in Visits'
      };
      const serviceName = serviceMap[serviceType];
      if (serviceName) {
        filtered = filtered.filter(sitter => 
          sitter.services.includes(serviceName)
        );
      }
    }
    // When no service type is selected, we show ALL sitters - this prevents 0 results after onboarding

    // Filter by pet type
    if (petType) {
      filtered = filtered.filter(sitter => 
        sitter.pet_types.includes(petType)
      );
    }

    // Filter by date availability if dates are provided
    if (selectedDate && checkOutDate) {
      try {
        const startDate = selectedDate.toISOString().split('T')[0];
        const endDate = checkOutDate.toISOString().split('T')[0];
        
        console.log('Checking availability for dates:', startDate, 'to', endDate);

        // Get all sitters who have marked themselves as UNavailable for these dates
        const { data: unavailableSitters, error: availError } = await supabase
          .from('sitter_availability')
          .select('sitter_id')
          .gte('date', startDate)
          .lte('date', endDate)
          .eq('is_available', false);

        if (availError) {
          console.error('Error checking availability:', availError);
        } else {
          const unavailableSitterIds = new Set(
            (unavailableSitters || []).map(a => a.sitter_id)
          );
          console.log('Sitters unavailable for these dates:', Array.from(unavailableSitterIds));

          // Get bookings that overlap with requested dates
          const { data: bookings, error: bookingError } = await supabase
            .from('bookings')
            .select('sitter_id')
            .lte('start_date', endDate)
            .gte('end_date', startDate)
            .in('status', ['pending', 'awaiting_payment', 'confirmed', 'in_progress']);

          if (bookingError) {
            console.error('Error checking bookings:', bookingError);
          } else {
            const bookedSitterIds = new Set(
              (bookings || []).map(b => b.sitter_id)
            );
            console.log('Sitters with overlapping bookings:', Array.from(bookedSitterIds));

            // Filter out sitters who are unavailable OR have bookings
            filtered = filtered.filter(sitter => 
              !unavailableSitterIds.has(sitter.id) && !bookedSitterIds.has(sitter.id)
            );
          }
        }
      } catch (error) {
        console.error('Error filtering by availability:', error);
      }
    }

    console.log('Filtered results:', filtered);
    
    // ALWAYS show sitters - if no results in searched area, show ALL sitters
    // This prevents 0 results and increases conversion
    if (filtered.length === 0 && allSitters.length > 0) {
      // Show ALL available sitters when no local match - sorted by golden badge
      filtered = [...allSitters];
      console.log('No local results, showing all sitters:', filtered.length);
    }
    
    // Show nearby sitters as supplementary when there ARE results but user searched a specific location
    if (location && filtered.length > 0 && filtered.length < allSitters.length) {
      const nearby = allSitters.filter(sitter => !filtered.some(f => f.id === sitter.id)).slice(0, 6);
      setNearbySitters(nearby);
    } else {
      setNearbySitters([]);
    }
    
    setFilteredSitters(filtered);
    setSearchPerformed(true);
    setDisplayLimit(SITTERS_PER_PAGE); // Reset pagination on new search

    // GA4 conversion event
    ga4.searchSitters(location, serviceType, filtered.length);

    // Track search event with comprehensive data
    trackEvent({
      eventType: 'search',
      eventName: filtered.length > 0 ? 'search_with_results' : 'search_no_results',
      eventData: {
        location,
        serviceType,
        results_count: filtered.length,
        nearby_count: nearbySitters.length,
        has_dates: !!(selectedDate && checkOutDate),
      }
    });

    // Track search event for retargeting
    trackSearch({
      suburb: location,
      city: 'Auckland', // Default city for NZ
      serviceType: serviceType,
      petSpecies: petType ? [petType] : undefined,
      resultsCount: filtered.length,
    });

    // Track search event for Meta Pixel
    metaPixel.trackSearch(location || serviceType || 'pet sitter');

    // Update URL with search parameters
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (serviceType) params.set('serviceType', serviceType);
    if (selectedDate) params.set('checkIn', selectedDate.toISOString().split('T')[0]);
    if (checkOutDate) params.set('checkOut', checkOutDate.toISOString().split('T')[0]);
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);

    // CRITICAL: Save full search context so user can resume after login/registration
    // This ensures they don't lose their search when they click a sitter and register
    saveSearchContext({
      location: location || undefined,
      serviceType: serviceType || undefined,
      checkIn: selectedDate?.toISOString().split('T')[0],
      checkOut: checkOutDate?.toISOString().split('T')[0],
    });

    // Auto-scroll to results after search - on mobile scroll to top of page to show results immediately
    if (isMobile) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      setTimeout(() => {
        const resultsSection = document.getElementById('search-results');
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 200);
    }
  };

  const handleApplyFilters = (filters: any) => {
    setCurrentFilters(filters);
    let filtered = [...allSitters];

    // Apply existing search filters first - skip location for "owner's home" service
    if (location && serviceType !== 'pet_sitting_owners_home') {
      filtered = filtered.filter(sitter => 
        sitter.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (serviceType) {
      const serviceMap: { [key: string]: string } = {
        'pet_sitting_owners_home': 'Pet Sitting (Your Home)',
        'pet_sitting_sitters_home': 'Pet Sitting (Sitter\'s Home)', 
        'drop_in_visits': 'Drop-in Visits'
      };
      const serviceName = serviceMap[serviceType];
      if (serviceName) {
        filtered = filtered.filter(sitter => 
          sitter.services.includes(serviceName)
        );
      }
    }

    if (petType) {
      filtered = filtered.filter(sitter => 
        sitter.pet_types.includes(petType)
      );
    }

    // Apply additional filters
    if (filters.priceRange) {
      filtered = filtered.filter(sitter => 
        sitter.baseRate >= filters.priceRange[0] && sitter.baseRate <= filters.priceRange[1]
      );
    }

    if (filters.verifiedOnly) {
      filtered = filtered.filter(sitter => sitter.verified);
    }

    if (filters.selectedServices && filters.selectedServices.length > 0) {
      filtered = filtered.filter(sitter => 
        filters.selectedServices.some((service: string) => sitter.services.includes(service))
      );
    }

    if (filters.selectedPetTypes && filters.selectedPetTypes.length > 0) {
      filtered = filtered.filter(sitter => 
        filters.selectedPetTypes.some((pet: string) => 
          sitter.pet_types.includes(pet.toLowerCase())
        )
      );
    }

    setFilteredSitters(filtered);
    setSearchPerformed(true);
  };

  return (
    <>
      <SEOHead 
        title="Find Trusted Pet Sitters Near You | ZiggySitters Auckland"
        description="Discover verified, loving pet sitters in Auckland. Book professional pet sitting, dog walking, and drop-in visits. Trusted by pet owners across New Zealand."
        keywords="pet sitters Auckland, dog walker, pet sitting service, pet care, pet boarding, dog sitter"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Pet Sitting Services",
          "provider": {
            "@type": "Organization",
            "name": "ZiggySitters"
          },
          "areaServed": "Auckland, New Zealand",
          "description": "Professional pet sitting and dog walking services"
        }}
      />
      
      {/* Location Notice Banner */}
      <div className="bg-primary text-primary-foreground py-3 px-4 text-center">
        <p className="text-sm md:text-base font-medium">
          📍 Currently serving Auckland, New Zealand. Expanding to other cities soon - stay tuned!
        </p>
      </div>
      
      {/* Profile completion banner for new pet owners */}
      {user && profile?.role === 'pet_owner' && (!profile?.phone || !profile?.address) && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-b border-purple-200 dark:border-purple-800 py-3 px-4 text-center">
          <p className="text-sm text-purple-700 dark:text-purple-300">
            💡 <button onClick={() => navigate('/profile')} className="underline font-medium hover:text-purple-900 dark:hover:text-purple-100">Complete your profile</button> later for a better experience — browse sitters now!
          </p>
        </div>
      )}
      
      {/* Hero Section with Search - Hide on mobile when results shown */}
      <section className={`relative bg-gradient-to-br from-slate-50 to-gray-100 py-12 md:py-20 overflow-hidden ${isMobile && searchPerformed ? 'hidden' : ''}`}>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgPGcgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjAzIj4KICAgICAgPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPgogICAgPC9nPgogIDwvZz4KPC9zdmc+Cg==')] opacity-30"></div>
        </div>
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-gray-800">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Find Trusted Pet Sitters
            </h1>
            <p className="text-lg md:text-xl mb-6 md:mb-8 text-gray-600 max-w-3xl mx-auto px-4">
              Discover verified, loving pet sitters in your area with guaranteed daily photo updates
            </p>
            
            {/* Enhanced Search Bar - Same as Home Page */}
            <div className="bg-white rounded-2xl p-4 md:p-6 max-w-4xl mx-auto border border-gray-200 shadow-xl">
              {/* Mobile Optimized: Stack fields properly */}
              <div className="space-y-4">
                {/* Name Search Row */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">Search by name</label>
                  <Input
                    type="text"
                    placeholder="Search by sitter name..."
                    value={nameSearch}
                    onChange={(e) => setNameSearch(e.target.value)}
                    className="h-12 border-gray-300 text-gray-800 focus:border-primary bg-white"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {serviceType !== 'pet_sitting_owners_home' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 block">Where?</label>
                      <SuburbAutocomplete
                        value={location}
                        onChange={setLocation}
                        placeholder="Enter suburb or city"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block">Service</label>
                    <Select value={serviceType} onValueChange={(val) => {
                      // Redirect to young walker search if selected
                      if (val === 'young_walker') {
                        navigate('/search-young-walkers');
                        return;
                      }
                      setServiceType(val);
                      // Clear location when switching to owner's home
                      if (val === 'pet_sitting_owners_home') {
                        setLocation('');
                      }
                    }}>
                      <SelectTrigger className="h-12 border-gray-300 text-gray-800 focus:border-primary bg-white">
                        <SelectValue placeholder="What do you need?" />
                      </SelectTrigger>
                        <SelectContent className="z-50 bg-white border shadow-lg">
                          <SelectItem value="pet_sitting_sitters_home">Pet Sitting (Sitter's Home)</SelectItem>
                          <SelectItem value="pet_sitting_owners_home">Pet Sitting (Your Home)</SelectItem>
                          <SelectItem value="drop_in_visits">Drop-in Visits</SelectItem>
                          <SelectItem value="young_walker">
                            <span className="flex items-center gap-2">
                              🐕 Young Dog Walker 
                              <span className="text-xs text-emerald-600 font-medium">From $15</span>
                            </span>
                          </SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block">Check-in</label>
                     <Input 
                      type="date"
                      value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : undefined)}
                      className="h-12 border-gray-300 text-gray-800 focus:border-primary bg-white"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block">Check-out</label>
                     <Input 
                      type="date"
                      value={checkOutDate ? checkOutDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => setCheckOutDate(e.target.value ? new Date(e.target.value) : undefined)}
                      className="h-12 border-gray-300 text-gray-800 focus:border-primary bg-white"
                      min={selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col md:flex-row gap-3">
                <Button 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 h-14 md:h-12 flex-1 font-semibold text-base rounded-md"
                  onClick={handleSearch}
                >
                   <Search className="mr-2 h-5 w-5" />
                   View Available Sitters
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 h-14 md:h-12 rounded-md"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
                {(location || serviceType || selectedDate || checkOutDate || searchPerformed) && (
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="px-8 h-14 md:h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      setLocation('');
                      setServiceType('');
                      setPetType('');
                      setSelectedDate(undefined);
                      setCheckOutDate(undefined);
                      setCurrentFilters(null);
                      setFilteredSitters(allSitters);
                      setSearchPerformed(false);
                    }}
                  >
                    <X className="mr-2 h-5 w-5" />
                    Clear Search
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <div id="search-results" className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* View Toggle */}
          {!isLoading && filteredSitters.length > 0 && (
            <div className="flex justify-end mb-4">
              <div className="flex rounded-lg border border-border overflow-hidden">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4 mr-1" /> List
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none"
                  onClick={() => setViewMode('map')}
                >
                  <Map className="w-4 h-4 mr-1" /> Map
                </Button>
              </div>
            </div>
          )}
          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-muted" />
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-muted rounded w-20" />
                      <div className="h-6 bg-muted rounded w-16" />
                    </div>
                    <div className="h-10 bg-muted rounded w-full mt-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Mobile: New Search button when results shown */}
          {!isLoading && isMobile && searchPerformed && (
            <div className="mb-6">
              <Link to="/">
                <Button variant="outline" className="w-full h-12">
                  <Home className="mr-2 h-5 w-5" />
                  New Search
                </Button>
              </Link>
            </div>
          )}
          
          {/* Search Results Header */}
          {!isLoading && searchPerformed && (
            <div className="mb-6 md:mb-8">
              {/* Add Pets Prompt - subtle but persistent */}
              <AddPetsPrompt />
              
              <h2 className="text-xl md:text-2xl font-semibold mb-2 text-gray-800">
                Available Pet Sitters
              </h2>
              
              {/* Active filters display */}
              {(selectedDate || checkOutDate || location || serviceType) && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedDate && checkOutDate && (
                    <Badge variant="secondary" className="text-sm">
                      📅 {format(selectedDate, 'MMM d')} - {format(checkOutDate, 'MMM d')}
                      <span className="ml-1 text-green-600">✓ Filtered</span>
                    </Badge>
                  )}
                  {location && (
                    <Badge variant="secondary" className="text-sm">
                      📍 {location}
                    </Badge>
                  )}
                  {serviceType && (
                    <Badge variant="secondary" className="text-sm">
                      🏠 {serviceType === 'pet_sitting_owners_home' ? 'Your Home' : 
                         serviceType === 'pet_sitting_sitters_home' ? "Sitter's Home" : 'Drop-ins'}
                    </Badge>
                  )}
                </div>
              )}
              
              <p className="text-gray-600">
                {filteredSitters.length === 0 
                  ? 'No sitters found matching your criteria. Try adjusting your filters.' 
                  : selectedDate && checkOutDate
                    ? `${filteredSitters.length} sitters available for your selected dates`
                    : serviceType === 'pet_sitting_owners_home'
                      ? 'Showing sitters who will come to your home'
                      : location 
                        ? `Showing sitters near ${location}`
                        : 'Showing available sitters in your area'}
              </p>
              {serviceType === 'pet_sitting_owners_home' && filteredSitters.length > 0 && (
                <p className="text-sm text-primary mt-1 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  These sitters travel to you — your pet stays comfortable at home!
                </p>
              )}
            </div>
          )}

          {/* Sitter Cards Grid - Enhanced with Pagination */}
          {!isLoading && searchPerformed && filteredSitters.length > 0 && (
            <>
              {/* Results header with count + sort */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground font-medium">
                  {filteredSitters.length} sitter{filteredSitters.length !== 1 ? 's' : ''}{location ? ` near ${location}` : ''}
                </span>
                <select 
                  className="text-sm border rounded-lg px-3 py-1.5 bg-background"
                  onChange={(e) => {
                    const val = e.target.value;
                    const sorted = [...filteredSitters];
                    if (val === 'price-low') sorted.sort((a, b) => a.baseRate - b.baseRate);
                    else if (val === 'price-high') sorted.sort((a, b) => b.baseRate - a.baseRate);
                    else if (val === 'experience') sorted.sort((a, b) => (b.sitterServices?.[0]?.experience_years || 0) - (a.sitterServices?.[0]?.experience_years || 0));
                    else if (val === 'verified') sorted.sort((a, b) => (b.golden_badge ? 2 : b.verified ? 1 : 0) - (a.golden_badge ? 2 : a.verified ? 1 : 0));
                    setFilteredSitters(sorted);
                  }}
                >
                  <option value="recommended">Sort: Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="experience">Most Experienced</option>
                  <option value="verified">Most Verified</option>
                </select>
              </div>

              {/* Map View */}
              {viewMode === 'map' && (
                <div className="mb-8">
                  <SitterMap
                    sitters={filteredSitters.filter(s => !s.isYoungWalker && s.latitude && s.longitude).map(s => ({
                      id: s.id,
                      name: s.name,
                      latitude: s.latitude,
                      longitude: s.longitude,
                      avatar_url: s.image,
                      baseRate: s.baseRate,
                      verified: s.verified,
                      golden_badge: s.golden_badge,
                      suburb: s.suburb,
                      services: s.services,
                    }))}
                    onSitterClick={(id) => navigate(`/sitter/${id}?booking=true`)}
                  />
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredSitters.slice(0, displayLimit).map((sitter, index) => (
                  <EnhancedSitterCard
                    key={sitter.id}
                    sitter={sitter}
                    onSitterClick={trackSitterClick}
                    isTopSitter={index === 0}
                    onViewProfile={() => {
                      ga4.clickSitterCard(sitter.id, sitter.name, index);
                      if (sitter.isYoungWalker) {
                        navigate(`/book-young-walker/${sitter.id}`);
                      } else {
                        const params = new URLSearchParams({ booking: 'true' });
                        if (selectedDate) params.set('checkIn', selectedDate.toISOString().split('T')[0]);
                        if (checkOutDate) params.set('checkOut', checkOutDate.toISOString().split('T')[0]);
                        if (serviceType) params.set('serviceType', serviceType);
                        navigate(`/sitter/${sitter.id}?${params.toString()}`);
                      }
                    }}
                  />
                ))}
              </div>
              )}

              {/* Load More button */}
              {filteredSitters.length > displayLimit && (
                <div className="text-center mt-8">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setDisplayLimit(prev => prev + SITTERS_PER_PAGE)}
                    className="px-8"
                  >
                    Load More Sitters ({filteredSitters.length - displayLimit} remaining)
                  </Button>
                </div>
              )}
              
              {/* Show nearby sitters as additional options */}
              {nearbySitters.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
                    More sitters you might like
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {nearbySitters.slice(0, 3).map((sitter, index) => (
                      <EnhancedSitterCard
                        key={sitter.id}
                        sitter={sitter}
                        onSitterClick={trackSitterClick}
                        onViewProfile={() => {
                          ga4.clickSitterCard(sitter.id, sitter.name, index + displayLimit);
                          if (sitter.isYoungWalker) {
                            navigate(`/book-young-walker/${sitter.id}`);
                          } else {
                            const params = new URLSearchParams({ booking: 'true' });
                            if (selectedDate) params.set('checkIn', selectedDate.toISOString().split('T')[0]);
                            if (checkOutDate) params.set('checkOut', checkOutDate.toISOString().split('T')[0]);
                            if (serviceType) params.set('serviceType', serviceType);
                            navigate(`/sitter/${sitter.id}?${params.toString()}`);
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* No Results Found - Enhanced */}
          {!isLoading && searchPerformed && filteredSitters.length === 0 && (
            <NoResultsSection
              searchLocation={location}
              searchServiceType={serviceType}
              nearbySitters={nearbySitters}
              onClearFilters={() => {
                setLocation('');
                setServiceType('');
                setPetType('');
                setSelectedDate(undefined);
                setCheckOutDate(undefined);
                setCurrentFilters(null);
                setFilteredSitters(allSitters);
                setNearbySitters([]);
                setSearchPerformed(false);
              }}
              onViewSitter={(sitterId) => {
                trackSitterClick(sitterId);
                trackEvent({
                  eventType: 'button_click',
                  eventName: 'nearby_sitter_clicked',
                  eventData: { sitter_id: sitterId, from_no_results: true }
                });
                const params = new URLSearchParams({ booking: 'true' });
                if (selectedDate) params.set('checkIn', selectedDate.toISOString().split('T')[0]);
                if (checkOutDate) params.set('checkOut', checkOutDate.toISOString().split('T')[0]);
                if (serviceType) params.set('serviceType', serviceType);
                navigate(`/sitter/${sitterId}?${params.toString()}`);
              }}
            />
          )}

          {/* Default State - Show Top Sitters */}
          {!isLoading && !searchPerformed && allSitters.length > 0 && (
            <div>
              <div className="mb-6 md:mb-8">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
                    Available Pet Sitters
                  </h2>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-0">
                    {allSitters.length} sitters
                  </Badge>
                </div>
                <p className="text-gray-600">
                  Browse our verified pet sitters or use the search above to find specific services
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {allSitters.slice(0, displayLimit).map((sitter, index) => (
                  <EnhancedSitterCard
                    key={sitter.id}
                    sitter={sitter}
                    onSitterClick={trackSitterClick}
                    isTopSitter={index === 0}
                    onViewProfile={() => {
                      ga4.clickSitterCard(sitter.id, sitter.name, index);
                      if (sitter.isYoungWalker) {
                        navigate(`/book-young-walker/${sitter.id}`);
                      } else {
                        const params = new URLSearchParams({ booking: 'true' });
                        if (selectedDate) params.set('checkIn', selectedDate.toISOString().split('T')[0]);
                        if (checkOutDate) params.set('checkOut', checkOutDate.toISOString().split('T')[0]);
                        if (serviceType) params.set('serviceType', serviceType);
                        navigate(`/sitter/${sitter.id}?${params.toString()}`);
                      }
                    }}
                  />
                ))}
              </div>
              
              {allSitters.length > displayLimit && (
                <div className="text-center mt-8">
                  <Button 
                    variant="outline"
                    size="lg"
                    onClick={() => setDisplayLimit(prev => prev + SITTERS_PER_PAGE)}
                    className="px-8"
                  >
                    Load More Sitters ({allSitters.length - displayLimit} remaining)
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <FilterPanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={currentFilters}
      />

      {/* Email Capture Modal for Retargeting */}
      <EmailCaptureModal
        isOpen={showEmailCapture}
        onClose={() => setShowEmailCapture(false)}
        searchLocation={location}
        searchServiceType={serviceType}
      />
    </>
  );
}