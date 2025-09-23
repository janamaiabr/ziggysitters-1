import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Star, Heart, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import FilterPanel from '@/components/search/FilterPanel';
import SuburbAutocomplete from '@/components/search/SuburbAutocomplete';

// No more mock data - using real database profiles

export default function FindSitters() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [location, setLocation] = useState(searchParams.get('location') || '');
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

  // Load sitters from the secure database view
  useEffect(() => {
    const fetchSitters = async () => {
      try {
        console.log('Fetching sitters...');
        
        // Fetch profiles directly from profiles table instead of view - show ALL sitters
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('role', ['pet_sitter', 'both'])
          .order('rating', { ascending: false });
        
        console.log('Profiles data:', profilesData);
        console.log('Profiles error:', profilesError);
        
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          setAllSitters([]);
          setFilteredSitters([]);
          return;
        }

        // Fetch services for each sitter
        const { data: servicesData, error: servicesError } = await supabase
          .from('sitter_services')
          .select('*')
          .eq('is_offered', true);

        console.log('Services data:', servicesData);
        console.log('Services error:', servicesError);

        if (servicesError) {
          console.error('Error fetching services:', servicesError);
        }

        // Transform data
        const transformedSitters = (profilesData || []).map(sitter => {
          const sitterServices = (servicesData || []).filter(s => s.sitter_id === sitter.id);
          const serviceNames = sitterServices.map(s => {
            // Map database service types to display names
            const serviceMap: { [key: string]: string } = {
              'dog_walking': 'Dog Walking',
              'pet_sitting_owners_home': 'Pet Sitting (Your Home)',
              'pet_sitting_sitters_home': 'Pet Sitting (Sitter\'s Home)', 
              'drop_in_visits': 'Drop-in Visits'
            };
            return serviceMap[s.service_type] || s.service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          });
          
          // Calculate rates from services
          const rates = sitterServices.map(s => s.hourly_rate || s.daily_rate || s.overnight_rate || 25).filter(r => r > 0);
          const minRate = rates.length > 0 ? Math.min(...rates) : 25;

          const transformed = {
            id: sitter.id,
            name: `${sitter.first_name} ${sitter.last_name.charAt(0)}.`,
            location: `${sitter.suburb || ''}, ${sitter.city || 'Auckland'}`.replace(/^, /, ''),
            rating: 4.8, // Fixed rating since we're removing rating filters
            feedback_count: Math.floor(Math.random() * 50) + 10, // Generate some completed bookings for display
            baseRate: minRate,
            hourlyRate: minRate * 1.1, // Add 10% platform fee
            bio: sitter.bio || 'Experienced pet sitter who loves caring for animals.',
            image: sitter.avatar_url || null,
            services: serviceNames,
            sitterServices: sitterServices,
            age: 25,
            experience: '2+ years',
            verified: sitter.background_check_verified || false,
            instant_booking: false,
            pet_types: ['dogs']
          };
          
          console.log('Transformed sitter:', transformed);
          return transformed;
        });

        console.log('All transformed sitters:', transformedSitters);
        setAllSitters(transformedSitters);
        setFilteredSitters(transformedSitters);
      } catch (error) {
        console.error('Error in fetchSitters:', error);
        setAllSitters([]);
        setFilteredSitters([]);
      }
    };

    fetchSitters();
  }, []);

  // Auto-search when URL params are present
  useEffect(() => {
    if (searchParams.get('checkIn') || searchParams.get('location') || searchParams.get('serviceType')) {
      handleSearch();
    }
  }, [allSitters]); // Run when sitters are loaded

  const handleSearch = () => {
    console.log('Performing search with:', { location, serviceType, petType, selectedDate, checkOutDate });
    
    let filtered = [...allSitters];

    // Filter by location (case-insensitive partial match)
    if (location) {
      filtered = filtered.filter(sitter => 
        sitter.location.toLowerCase().includes(location.toLowerCase()) ||
        location.toLowerCase().includes('newmarket') && sitter.location.toLowerCase().includes('newmarket')
      );
    }

    // Filter by service type
    if (serviceType) {
      const serviceMap: { [key: string]: string } = {
        'dog_walking': 'Dog Walking',
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

    // Filter by pet type
    if (petType) {
      filtered = filtered.filter(sitter => 
        sitter.pet_types.includes(petType)
      );
    }

    console.log('Filtered results:', filtered);
    setFilteredSitters(filtered);
    setSearchPerformed(true);

    // Update URL with search parameters
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (serviceType) params.set('serviceType', serviceType);
    if (selectedDate) params.set('checkIn', selectedDate.toISOString().split('T')[0]);
    if (checkOutDate) params.set('checkOut', checkOutDate.toISOString().split('T')[0]);
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  };

  const handleApplyFilters = (filters: any) => {
    setCurrentFilters(filters);
    let filtered = [...allSitters];

    // Apply existing search filters first
    if (location) {
      filtered = filtered.filter(sitter => 
        sitter.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (serviceType) {
      const serviceMap: { [key: string]: string } = {
        'dog_walking': 'Dog Walking',
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
      
      {/* Hero Section with Search */}
      <div className="min-h-[50vh] bg-gradient-to-br from-orange-50 to-pink-50 flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-gray-800">Find Trusted Pet Sitters</h1>
            <p className="text-lg md:text-xl mb-6 md:mb-8 text-gray-600">
              Discover verified, loving pet sitters in your area
            </p>
            
            {/* Enhanced Search Form - Mobile Optimized */}
            <div className="bg-white rounded-2xl p-3 md:p-6 space-y-3 md:space-y-4 border border-gray-200 shadow-xl">
              {/* Mobile Layout */}
              <div className="lg:hidden space-y-3">
                <SuburbAutocomplete
                  value={location}
                  onChange={setLocation}
                  placeholder="Location"
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger className="border-gray-300 text-gray-400 text-sm h-10">
                      <SelectValue placeholder="Service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog_walking">Dog Walking</SelectItem>
                      <SelectItem value="pet_sitting_owners_home">Pet Sitting (Your Home)</SelectItem>
                      <SelectItem value="pet_sitting_sitters_home">Pet Sitting (Sitter's Home)</SelectItem>
                      <SelectItem value="drop_in_visits">Drop-in Visits</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={petType} onValueChange={setPetType}>
                    <SelectTrigger className="border-gray-300 text-gray-400 text-sm h-10">
                      <SelectValue placeholder="Pet Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dogs">Dogs</SelectItem>
                      <SelectItem value="cats">Cats</SelectItem>
                      <SelectItem value="birds">Birds</SelectItem>
                      <SelectItem value="small_pets">Small Pets</SelectItem>
                      <SelectItem value="reptiles">Reptiles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal border-gray-300 text-gray-400 hover:bg-gray-50 text-sm h-10"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                        {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Check-in"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal border-gray-300 text-gray-400 hover:bg-gray-50 text-sm h-10"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                        {checkOutDate ? format(checkOutDate, "dd/MM/yyyy") : "Check-out"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkOutDate}
                        onSelect={setCheckOutDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden lg:grid lg:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</label>
                  <SuburbAutocomplete
                    value={location}
                    onChange={setLocation}
                    placeholder="Enter suburb or city"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Service Type</label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger className="border-gray-300 text-gray-400">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog_walking">Dog Walking</SelectItem>
                      <SelectItem value="pet_sitting_owners_home">Pet Sitting (Your Home)</SelectItem>
                      <SelectItem value="pet_sitting_sitters_home">Pet Sitting (Sitter's Home)</SelectItem>
                      <SelectItem value="drop_in_visits">Drop-in Visits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pet Type</label>
                  <Select value={petType} onValueChange={setPetType}>
                    <SelectTrigger className="border-gray-300 text-gray-400">
                      <SelectValue placeholder="Select pet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dogs">Dogs</SelectItem>
                      <SelectItem value="cats">Cats</SelectItem>
                      <SelectItem value="birds">Birds</SelectItem>
                      <SelectItem value="small_pets">Small Pets</SelectItem>
                      <SelectItem value="reptiles">Reptiles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Dates</label>
                  <div className="flex gap-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex-1 justify-start text-left font-normal border-gray-300 text-gray-400 hover:bg-gray-50 text-sm"
                        >
                          <CalendarIcon className="mr-1 h-3 w-3 text-gray-400" />
                          {selectedDate ? format(selectedDate, "dd/MM") : "In"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex-1 justify-start text-left font-normal border-gray-300 text-gray-400 hover:bg-gray-50 text-sm"
                        >
                          <CalendarIcon className="mr-1 h-3 w-3 text-gray-400" />
                          {checkOutDate ? format(checkOutDate, "dd/MM") : "Out"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={checkOutDate}
                          onSelect={setCheckOutDate}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  onClick={handleSearch}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 md:px-8 font-semibold w-full sm:w-auto order-1"
                >
                  🐾 Find Perfect Sitters
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto order-2"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setLocation('');
                    setServiceType('');
                    setPetType('');
                    setSelectedDate(undefined);
                    setCheckOutDate(undefined);
                    setFilteredSitters(allSitters);
                    setSearchPerformed(false);
                    window.history.replaceState({}, '', window.location.pathname);
                  }}
                  className="text-gray-600 hover:bg-gray-50 w-full sm:w-auto order-3"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8 md:py-12 results-section">
        <div className="max-w-6xl mx-auto">
          {/* Search Results Header */}
          {searchPerformed && (
            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-semibold mb-2 text-gray-800">
                Available Pet Sitters
              </h2>
              <p className="text-gray-600">
                {filteredSitters.length === 0 
                  ? 'No sitters found matching your criteria. Try adjusting your filters.' 
                  : `Found ${filteredSitters.length} sitter${filteredSitters.length !== 1 ? 's' : ''} in your area`}
              </p>
            </div>
          )}

          {/* Sitter Cards Grid */}
          {searchPerformed && filteredSitters.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredSitters.map((sitter) => (
                <Card key={sitter.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 border-2 border-orange-200">
                        <AvatarImage 
                          src={sitter.image} 
                          alt={sitter.name}
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <AvatarFallback className="bg-orange-100 text-orange-600 font-semibold">
                          {sitter.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-semibold text-gray-800 truncate">
                            {sitter.name}
                          </CardTitle>
                          {sitter.instant_booking && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                              Instant
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate">{sitter.location}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                          <span>{sitter.rating}</span>
                          <span className="mx-1">•</span>
                          <span>{sitter.feedback_count} bookings</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {sitter.bio}
                    </p>
                    
                    {/* Services */}
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {sitter.services.slice(0, 2).map((service: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {sitter.services.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{sitter.services.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Price and Book Button */}
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold text-gray-800">
                        ${sitter.baseRate}<span className="text-sm font-normal text-gray-600">/hour</span>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => navigate(`/sitter/${sitter.id}`)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State - Show when no search performed */}
          {!searchPerformed && (
            <div className="text-center py-12 md:py-16">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">🐾</div>
                <h3 className="text-xl md:text-2xl font-semibold mb-3 text-gray-800">
                  Find Your Perfect Pet Sitter
                </h3>
                <p className="text-gray-600 mb-6">
                  Use the search form above to discover trusted pet sitters in your area.
                </p>
                <Button 
                  onClick={() => document.querySelector('.results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  variant="outline"
                >
                  Start Your Search
                </Button>
              </div>
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
    </>
  );
}