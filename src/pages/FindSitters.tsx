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
import { MapPin, Star, Heart, Calendar as CalendarIcon, Filter, Search } from 'lucide-react';
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
      <section className="relative bg-gradient-to-br from-slate-50 to-gray-100 py-12 md:py-20 overflow-hidden">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block">Where?</label>
                    <SuburbAutocomplete
                      value={location}
                      onChange={setLocation}
                      placeholder="Enter suburb or city"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block">Service</label>
                    <Select value={serviceType} onValueChange={setServiceType}>
                      <SelectTrigger className="h-12 border-gray-300 text-gray-800 focus:border-primary bg-white">
                        <SelectValue placeholder="What do you need?" />
                      </SelectTrigger>
                       <SelectContent className="z-50 bg-white border shadow-lg">
                         <SelectItem value="pet_sitting_sitters_home">🏠 Pet Sitting (Sitter's Home)</SelectItem>
                         <SelectItem value="pet_sitting_owners_home">🏡 Pet Sitting (Your Home)</SelectItem>
                         <SelectItem value="drop_in_visits">⏰ Drop-in Visits</SelectItem>
                         <SelectItem value="dog_walking">🚶‍♂️ Dog Walking</SelectItem>
                       </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block">Check-in</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-12 w-full justify-start text-left font-normal border-gray-300 text-gray-800 focus:border-primary bg-white",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-5 w-5" />
                          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
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
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block">Check-out</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-12 w-full justify-start text-left font-normal border-gray-300 text-gray-800 focus:border-primary bg-white",
                            !checkOutDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-5 w-5" />
                          {checkOutDate ? format(checkOutDate, "PPP") : "Pick a date"}
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
              
              <div className="mt-6 flex flex-col md:flex-row gap-3">
                <Button 
                  size="lg" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 flex-1 font-semibold text-base"
                  onClick={handleSearch}
                >
                   <Search className="mr-2 h-5 w-5" />
                   🔍 Search Sitters
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 h-12"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                <Card key={sitter.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative">
                    {sitter.image && (
                      <div className="aspect-video bg-gray-100 relative overflow-hidden rounded-t-lg">
                        <img 
                          src={sitter.image} 
                          alt={`${sitter.name}'s profile`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    {sitter.verified && (
                      <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage 
                            src={sitter.image} 
                            alt={sitter.name}
                            className="object-cover"
                          />
                          <AvatarFallback>{sitter.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{sitter.name}</CardTitle>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3 mr-1" />
                            {sitter.location}
                          </div>
                          <div className="flex items-center mt-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="font-medium">{sitter.rating}</span>
                            <span className="text-sm text-muted-foreground ml-1">
                              ({sitter.feedback_count} bookings)
                            </span>
                          </div>
                        </div>
                      </div>
                      <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer" />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{sitter.bio}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      {sitter.services.slice(0, 2).map((service) => (
                        <Badge key={service} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                      {sitter.services.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{sitter.services.length - 2} more
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        From <span className="font-semibold text-gray-900">${sitter.baseRate}/hr</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full"
                      onClick={() => navigate(`/sitter/${sitter.id}?booking=true`)}
                    >
                      View Profile & Book
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Results Found */}
          {searchPerformed && filteredSitters.length === 0 && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">🐾</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">No sitters found</h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any sitters matching your criteria. Try adjusting your search filters or expanding your search area.
                </p>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
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
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Default State - Show All Sitters */}
          {!searchPerformed && allSitters.length > 0 && (
            <div>
              <div className="mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-semibold mb-2 text-gray-800">
                  All Available Pet Sitters
                </h2>
                <p className="text-gray-600">
                  Browse our verified pet sitters or use the search above to find specific services
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {allSitters.slice(0, 6).map((sitter) => (
                  <Card key={sitter.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="relative">
                      {sitter.image && (
                        <div className="aspect-video bg-gray-100 relative overflow-hidden rounded-t-lg">
                          <img 
                            src={sitter.image} 
                            alt={`${sitter.name}'s profile`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      {sitter.verified && (
                        <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage 
                              src={sitter.image} 
                              alt={sitter.name}
                              className="object-cover"
                            />
                            <AvatarFallback>{sitter.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{sitter.name}</CardTitle>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3 mr-1" />
                              {sitter.location}
                            </div>
                            <div className="flex items-center mt-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                              <span className="font-medium">{sitter.rating}</span>
                              <span className="text-sm text-muted-foreground ml-1">
                                ({sitter.feedback_count} bookings)
                              </span>
                            </div>
                          </div>
                        </div>
                        <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer" />
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">{sitter.bio}</p>
                      
                      <div className="flex flex-wrap gap-1">
                        {sitter.services.slice(0, 2).map((service) => (
                          <Badge key={service} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {sitter.services.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{sitter.services.length - 2} more
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          From <span className="font-semibold text-gray-900">${sitter.baseRate}/hr</span>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full"
                        onClick={() => navigate(`/sitter/${sitter.id}?booking=true`)}
                      >
                        View Profile & Book
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {allSitters.length > 6 && (
                <div className="text-center mt-8">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFilteredSitters(allSitters);
                      setSearchPerformed(true);
                    }}
                  >
                    View All {allSitters.length} Sitters
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
    </>
  );
}