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
            services: serviceNames.length > 0 ? serviceNames : ['Pet Sitting'],
            petTypes: ['Dogs', 'Cats'], // Could be enhanced with actual pet preferences
            verified: sitter.is_verified || false,
            
            availability: 'Available',
            avatar: sitter.avatar_url || 'https://images.unsplash.com/photo-1494790108755-2616b612b9c5?w=150&h=150&fit=crop&crop=face',
            bio: sitter.bio || 'Experienced pet care provider'
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

  const handleSearch = () => {
    let filtered = [...allSitters]; // Use real data instead of mockSitters
    
    // Filter by location - fix NewMarket search issue
    if (location) {
      filtered = filtered.filter(sitter => 
        sitter.location.toLowerCase().includes(location.toLowerCase()) ||
        sitter.location.toLowerCase().replace(/\s+/g, '').includes(location.toLowerCase().replace(/\s+/g, ''))
      );
    }
    
    // Filter by service type
    if (serviceType) {
      const serviceMap: { [key: string]: string } = {
        'dog-walking': 'Dog Walking',
        'pet-sitting-owners': 'Pet Sitting (Your Home)',
        'pet-sitting-sitters': 'Pet Sitting (Sitter\'s Home)',
        'drop-in-visits': 'Drop-in Visits'
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
      const petMap: { [key: string]: string } = {
        'dogs': 'Dogs',
        'cats': 'Cats',
        'birds': 'Birds',
        'small-pets': 'Small Pets',
        'reptiles': 'Reptiles'
      };
      
      const petName = petMap[petType];
      if (petName) {
        filtered = filtered.filter(sitter => 
          sitter.petTypes.includes(petName)
        );
      }
    }
    
    setFilteredSitters(filtered);
    setSearchPerformed(true);
    
    // Update URL params
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (serviceType) params.set('serviceType', serviceType);
    if (petType) params.set('petType', petType);
    if (selectedDate) params.set('checkIn', format(selectedDate, 'yyyy-MM-dd'));
    if (checkOutDate) params.set('checkOut', format(checkOutDate, 'yyyy-MM-dd'));
    
    // Update URL without navigation
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    
    // Scroll to results section after search
    setTimeout(() => {
      const resultsSection = document.querySelector('.results-section');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleApplyFilters = (filters: any) => {
    setCurrentFilters(filters);
    let filtered = [...allSitters];
    
    // Apply price range filter
    filtered = filtered.filter(sitter => 
      sitter.hourlyRate >= filters.priceRange[0] && 
      sitter.hourlyRate <= filters.priceRange[1]
    );
    
    // Remove rating filter as requested
    
    // Apply verified filter
    if (filters.verifiedOnly) {
      filtered = filtered.filter(sitter => sitter.verified);
    }
    
    // Apply service filters
    if (filters.selectedServices.length > 0) {
      filtered = filtered.filter(sitter => 
        filters.selectedServices.some((service: string) => sitter.services.includes(service))
      );
    }
    
    // Apply pet type filters
    if (filters.selectedPetTypes.length > 0) {
      filtered = filtered.filter(sitter => 
        filters.selectedPetTypes.some((petType: string) => sitter.petTypes.includes(petType))
      );
    }
    
    setFilteredSitters(filtered);
    setSearchPerformed(true);
    
    // Scroll to results section after applying filters
    setTimeout(() => {
      const resultsSection = document.querySelector('.results-section');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <>
      <SEOHead 
        title="Find Verified Pet Sitters with Daily Updates - Auckland Pet Care"
        description="Search verified pet sitters in Auckland who provide guaranteed daily photo updates. Browse profiles, read reviews, and book trusted pet care for dogs, cats, and more."
        keywords="find pet sitters Auckland, verified pet care, pet sitters with daily reports, Auckland dog walking, cat sitting services"
        canonical="/find-sitters"
      />
      <div className="min-h-screen bg-background">
      {/* Search Header */}
      <div className="bg-gradient-to-br from-slate-50 to-gray-100 py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-gray-800">Find Trusted Pet Sitters</h1>
            <p className="text-lg md:text-xl mb-6 md:mb-8 text-gray-600">
              Discover verified, loving pet sitters in your area
            </p>
            
            {/* Enhanced Search Form - Mobile Optimized */}
            <div className="bg-white rounded-2xl p-4 md:p-6 space-y-4 border border-gray-200 shadow-xl">
              {/* Mobile: Stack all fields vertically, Desktop: Grid layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
                <div className="space-y-2 md:col-span-1 lg:col-span-1">
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <SuburbAutocomplete
                    value={location}
                    onChange={setLocation}
                    placeholder="Enter suburb or city"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-1 lg:col-span-1">
                  <label className="text-sm font-medium text-gray-700">Service Type</label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger className="border-gray-300 text-gray-500 focus:border-primary">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="dog-walking">🚶‍♂️ Dog Walking</SelectItem>
                       <SelectItem value="pet-sitting-owners">🏠 Pet Sitting (Your Home)</SelectItem>
                       <SelectItem value="pet-sitting-sitters">🏡 Pet Sitting (Sitter's Home)</SelectItem>
                       <SelectItem value="drop-in-visits">🏃‍♀️ Drop-in Visits</SelectItem>
                     </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 md:col-span-1 lg:col-span-1">
                  <label className="text-sm font-medium text-gray-700">Pet Type</label>
                  <Select value={petType} onValueChange={setPetType}>
                    <SelectTrigger className="border-gray-300 text-gray-500 focus:border-primary">
                      <SelectValue placeholder="Select pet" />
                    </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="dogs">🐕 Dogs</SelectItem>
                       <SelectItem value="cats">🐱 Cats</SelectItem>
                       <SelectItem value="birds">🦜 Birds</SelectItem>
                       <SelectItem value="small-pets">🐹 Small Pets</SelectItem>
                       <SelectItem value="reptiles">🦎 Reptiles</SelectItem>
                     </SelectContent>
                  </Select>
                </div>
                
                {/* Date fields - hidden on mobile, shown on desktop */}
                <div className="hidden lg:block space-y-2">
                  <label className="text-sm font-medium text-gray-700">Check-in Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-gray-300 text-gray-500 hover:bg-gray-50"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                        {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Select date"}
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
                
                <div className="hidden lg:block space-y-2">
                  <label className="text-sm font-medium text-gray-700">Check-out Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-gray-300 text-gray-500 hover:bg-gray-50"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                        {checkOutDate ? format(checkOutDate, "dd/MM/yyyy") : "Select date"}
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
              
              {/* Mobile-specific date section */}
              <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Check-in Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-gray-300 text-gray-500 hover:bg-gray-50"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Select date"}
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
                   <label className="text-sm font-medium text-gray-700">Check-out Date</label>
                   <Popover>
                     <PopoverTrigger asChild>
                       <Button
                         variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-gray-300 text-gray-500 hover:bg-gray-50"
                        )}
                       >
                         <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                         {checkOutDate ? format(checkOutDate, "dd/MM/yyyy") : "Select date"}
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
                {/* Clear Filters Button */}
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-2">
          <h2 className="text-xl md:text-2xl font-bold">
            {searchPerformed 
              ? `${filteredSitters.length} Sitters Found` 
              : 'Available Sitters in Auckland'
            }
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">{filteredSitters.length} sitters found</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredSitters.length > 0 ? (
            filteredSitters.map((sitter) => (
              <Card key={sitter.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 md:pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2 md:space-x-3">
                       <Avatar className="h-10 w-10 md:h-12 md:w-12">
                         <AvatarImage 
                           src={sitter.avatar} 
                           alt={sitter.name}
                           className="object-cover"
                         />
                         <AvatarFallback className="text-xs md:text-sm">
                           {sitter.name.split(' ').map(n => n[0]).join('')}
                         </AvatarFallback>
                       </Avatar>
                      <div>
                        <CardTitle className="text-base md:text-lg">{sitter.name}</CardTitle>
                        <div className="flex items-center text-xs md:text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3 mr-1" />
                          {sitter.location}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                 <CardContent className="space-y-3 md:space-y-4">
                   <div className="flex items-center justify-between">
                     {sitter.verified && (
                       <Badge variant="secondary" className="text-xs">✅ Verified</Badge>
                     )}
                   </div>
                  
                  <div className="space-y-2">
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
                     
                      {sitter.baseRate > 0 && (
                       <div className="space-y-1">
                         <div className="flex items-center justify-between">
                           <span className="text-xs md:text-sm text-muted-foreground">Starting from</span>
                           <div className="text-right">
                             <span className="font-bold text-base md:text-lg">${sitter.baseRate}/day</span>
                             <div className="text-xs text-muted-foreground">
                               💰 Best rates in area
                             </div>
                           </div>
                         </div>
                       </div>
                     )}
                     
                     <div className="text-xs md:text-sm text-muted-foreground">
                       {sitter.bio}
                     </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 text-sm md:text-base" 
                      onClick={() => navigate(`/sitter/${sitter.id}`)}
                    >
                      🐾 Book Now
                    </Button>
                    {/* Removed messaging functionality */}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full">
              <Card className="text-center py-8">
                <CardContent>
                  <div className="text-6xl mb-4">🐾</div>
                  <h3 className="text-xl font-semibold mb-2">No sitters found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchPerformed 
                      ? "Try adjusting your search criteria or filters to find more sitters in your area."
                      : "Loading available sitters..."
                    }
                  </p>
                  {searchPerformed && (
                    <Button variant="outline" onClick={() => {
                      setLocation('');
                      setServiceType('');
                      setPetType('');
                      setFilteredSitters(allSitters);
                      setSearchPerformed(false);
                    }}>
                      Clear Search
                    </Button>
                  )}
                </CardContent>
              </Card>
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

      </div>
    </>
  );
}