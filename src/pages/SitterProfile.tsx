import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  Star, 
  Heart, 
  Calendar,
  DollarSign,
  Award,
  Shield,
  Clock,
  ArrowLeft
} from 'lucide-react';
import BookingAccordion from '@/components/booking/BookingAccordion';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';
import { supabase } from '@/integrations/supabase/client';
import { metaPixel } from '@/lib/metaPixel';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import SitterVerificationBadge from '@/components/sitter/SitterVerificationBadge';

interface SitterData {
  id: string;
  display_name: string;
  location: string;
  rating: number;
  feedback_count: number;
  baseRate: number;
  hourlyRate: number;
  services: string[];
  petTypes: string[];
  avatar: string;
  verified: boolean;
  hasPoliceVet?: boolean; // Gold badge
  
  bio: string;
  experience: string;
  availability: string[];
  specialties: string[];
  gallery: string[];
}

export default function SitterProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [sitterData, setSitterData] = useState<SitterData | null>(null);
  const [servicesData, setServicesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get dates from URL params
  const checkInDate = searchParams.get('checkIn');
  const checkOutDate = searchParams.get('checkOut');
  const serviceTypeParam = searchParams.get('serviceType');
  
  const initialDates = {
    checkIn: checkInDate || undefined,
    checkOut: checkOutDate || undefined,
    serviceType: serviceTypeParam || undefined,
  };
  
  // Check if booking should be automatically opened
  useEffect(() => {
    const shouldOpenBooking = searchParams.get('booking') === 'true';
    if (shouldOpenBooking && user) {
      setIsBookingOpen(true);
      
      // Track view content when viewing sitter profile for booking
      metaPixel.trackViewContent('Sitter Profile', 'Pet Sitter');
      
      // Scroll to booking section after a brief delay
      setTimeout(() => {
        const bookingSection = document.getElementById('booking-section');
        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else if (shouldOpenBooking && !user) {
      // Redirect to login if not logged in, preserving ALL URL parameters
      const currentUrl = `/sitter/${id}?${searchParams.toString()}`;
      navigate(`/auth?redirect=${encodeURIComponent(currentUrl)}`);
    }
  }, [searchParams, user, id, navigate]);

  // Load sitter data from the secure database view
  useEffect(() => {
    const fetchSitterData = async () => {
      if (!id) {
        console.log('No sitter ID provided');
        return;
      }
      
      try {
        console.log('Fetching sitter with ID:', id);
        
        // Use RPC function for public access (works for anonymous users)
        const { data: rpcData, error } = await supabase
          .rpc('get_public_sitter_info', { sitter_id: id });
        
        const data = rpcData?.[0] || null;
        
        // Try to get golden badge status from public_sitters view
        const { data: goldenBadgeData } = await supabase
          .from('public_sitters')
          .select('golden_badge_approved')
          .eq('id', id)
          .maybeSingle();

        console.log('Profile fetch result:', { data, error });

        if (error) {
          console.error('Error fetching sitter:', error);
          setSitterData(null);
          setLoading(false);
          return;
        }
        
        if (!data) {
          console.error('Sitter not found - no data returned');
          setSitterData(null);
          setLoading(false);
          return;
        }

        console.log('Sitter data found:', data);

        // Fetch actual services for this sitter
        const { data: servicesData } = await supabase
          .from('sitter_services')
          .select('*')
          .eq('sitter_id', id)
          .eq('is_offered', true);

        console.log('Services data:', servicesData);

        // Store services data for displaying rates
        setServicesData(servicesData || []);

        // Fetch portfolio photos from storage
        const { data: portfolioFiles } = await supabase.storage
          .from('profile-photos')
          .list(`${id}/portfolio`, {
            limit: 10,
            sortBy: { column: 'created_at', order: 'desc' }
          });

        // Generate portfolio URLs
        const portfolioUrls = portfolioFiles?.map(file => {
          const { data: { publicUrl } } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(`${id}/portfolio/${file.name}`);
          return publicUrl;
        }) || [];

        // Transform services data
        const serviceNames = servicesData?.map(service => {
          switch (service.service_type) {
            case 'drop_in_visits': return 'Drop-in Visits';
            case 'pet_sitting_owners_home': return 'Pet Sitting (Your Home)';
            case 'pet_sitting_sitters_home': return 'Pet Sitting (Sitter\'s Home)';
            default: return 'Pet Care';
          }
        }) || ['Pet Sitting', 'Drop-in Visits'];

        // Get the lowest rate from actual services
        const rates = servicesData?.map(service => 
          service.hourly_rate || service.daily_rate || service.overnight_rate
        ).filter(Boolean) || [];
        const baseRate = rates.length > 0 ? Math.min(...rates) : null;

        // Transform the data to match our interface using real data
        const transformedData = {
          id: data.id,
          display_name: `${data.first_name} ${data.last_name.charAt(0)}.`,
          location: `${data.suburb || 'Auckland'}, ${data.city || 'New Zealand'}`,
          rating: data.rating || 4.8,
          feedback_count: data.total_reviews || 0,
          baseRate: baseRate,
          hourlyRate: baseRate,
          services: serviceNames,
          petTypes: servicesData?.length > 0 ? 
            [...new Set(servicesData.flatMap(s => s.accepted_pet_species || []))].map(species => 
              species.charAt(0).toUpperCase() + species.slice(1)
            ) : ['Dogs', 'Cats'],
          avatar: data.avatar_url,
          verified: data.is_verified,
          hasPoliceVet: !!(goldenBadgeData?.golden_badge_approved), // Gold badge
          
          bio: data.bio || 'Experienced pet care provider',
          experience: servicesData?.length > 0 ? 
            `${Math.max(...servicesData.map(s => s.experience_years || 0))} years experience` : 
            'Experienced pet care provider',
          availability: ['Available for bookings'],
          specialties: servicesData?.length > 0 ? 
            servicesData.flatMap(s => {
              const specs = [];
              if (s.has_fenced_yard) specs.push('Fenced yard');
              if (s.allows_puppies) specs.push('Puppy care');
              if (s.allows_senior_pets) specs.push('Senior pet care');
              return specs;
            }).slice(0, 3) : ['Pet care specialist'],
          gallery: portfolioUrls.length > 0 ? portfolioUrls : []
        };

        console.log('Setting sitter data:', transformedData);
        setSitterData(transformedData);
        
        // Track view content event
        metaPixel.trackViewContent(
          transformedData.display_name,
          'Sitter Profile'
        );
      } catch (error) {
        console.error('Error in fetchSitterData:', error);
        setSitterData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSitterData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading sitter profile...</p>
        </div>
      </div>
    );
  }
  
  // sitterData is now loaded from the database via useEffect above
  
  if (!sitterData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sitter Not Found</h1>
          <Button onClick={() => navigate('/find-sitters')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Find Sitters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-50 to-gray-100 py-8">
        <div className="container mx-auto px-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/find-sitters')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
          
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-24 w-24">
              <AvatarImage 
                src={sitterData.avatar} 
                className="object-cover"
              />
              <AvatarFallback>
                {sitterData.display_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{sitterData.display_name}</h1>
                <SitterVerificationBadge 
                  isVerified={sitterData.verified || false}
                  hasGoldenBadge={sitterData.hasPoliceVet || false}
                />
              </div>
              
              <div className="flex items-center text-muted-foreground mb-4">
                <MapPin className="w-4 h-4 mr-1" />
                {sitterData.location}
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-medium">{sitterData.rating}</span>
                   <span className="text-sm text-muted-foreground ml-1">
                     ({sitterData.feedback_count} bookings)
                   </span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  
                </div>
              </div>
              
              <div className="flex gap-3">
                {profile?.role === 'pet_owner' && (
                  <Button 
                    size="lg"
                    onClick={() => {
                      setIsBookingOpen(true);
                      setTimeout(() => {
                        const bookingSection = document.getElementById('booking-section');
                        if (bookingSection) {
                          bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 100);
                    }}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Now
                  </Button>
                )}
                {!user && (
                  <Button 
                    size="lg"
                    onClick={() => {
                      // Preserve all URL parameters when redirecting to auth
                      const params = new URLSearchParams(searchParams);
                      params.set('booking', 'true');
                      const redirectUrl = `/sitter/${id}?${params.toString()}`;
                      navigate(`/auth?redirect=${encodeURIComponent(redirectUrl)}`);
                    }}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Show alert if current user is a sitter */}
            {profile?.role === 'pet_sitter' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Pet sitters cannot book other sitters. Only pet owners can make bookings.
                </AlertDescription>
              </Alert>
            )}
            
            
            {/* Booking Form - Only show if user is pet owner */}
            {profile?.role === 'pet_owner' && (
              <div id="booking-section">
                <BookingAccordion
                  sitter={{
                    id: sitterData.id,
                    name: sitterData.display_name,
                    location: sitterData.location,
                    hourlyRate: sitterData.hourlyRate,
                    services: sitterData.services,
                    avatar: sitterData.avatar
                  }}
                  servicesData={servicesData}
                  isOpen={isBookingOpen}
                  onBookingComplete={() => navigate('/bookings')}
                  initialCheckIn={checkInDate || undefined}
                  initialCheckOut={checkOutDate || undefined}
                  initialServiceType={serviceTypeParam || undefined}
                />
              </div>
            )}
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About {sitterData.display_name.split(' ')[0]}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{sitterData.bio}</p>
              </CardContent>
            </Card>

            {/* Services & Rates */}
            <Card>
              <CardHeader>
                <CardTitle>Services & Rates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {servicesData.length > 0 ? (
                  servicesData.map((service) => {
                    const getServiceDisplayName = (type: string) => {
                      switch (type) {
                        case 'pet_sitting_owners_home': return 'Pet Sitting in Your Home';
                        case 'pet_sitting_sitters_home': return 'Pet Sitting in Sitter\'s Home';
                        case 'drop_in_visits': return 'Drop-in Visits';
                        default: return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                      }
                    };

                    const getServiceDescription = (type: string) => {
                      switch (type) {
                        case 'pet_sitting_owners_home': return 'Pet care in your home';
                        case 'pet_sitting_sitters_home': return 'Pet care in sitter\'s home';
                        case 'drop_in_visits': return 'Quick visits for feeding & care';
                        default: return 'Professional pet care service';
                      }
                    };

                    const getRate = (service: any) => {
                      // Format rates to always show 2 decimal places
                      if (service.hourly_rate) return `NZ$${Number(service.hourly_rate).toFixed(2)}/hour`;
                      if (service.daily_rate) return `NZ$${Number(service.daily_rate).toFixed(2)}/day`;
                      if (service.overnight_rate) return `NZ$${Number(service.overnight_rate).toFixed(2)}/night`;
                      return 'Contact for pricing';
                    };

                    return (
                      <div key={service.id} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{getServiceDisplayName(service.service_type)}</div>
                          <div className="text-xs text-muted-foreground">
                            {getServiceDescription(service.service_type)}
                          </div>
                        </div>
                        <div className="text-right font-semibold">{getRate(service)}</div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground">No services configured yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Experience & Specialties */}
            <Card>
              <CardHeader>
                <CardTitle>Experience & Specialties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Experience</h4>
                  <p className="text-muted-foreground">{sitterData.experience} of professional pet care</p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Specialities</h4>
                  <div className="flex flex-wrap gap-2">
                    {[...new Set(sitterData.specialties)].map((specialty, index) => (
                      <Badge key={`${specialty}-${index}`} variant="outline">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Pet Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {sitterData.petTypes.map((type) => (
                      <Badge key={type} variant="secondary">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Photo Gallery */}
            {sitterData.gallery.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Photos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {sitterData.gallery.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Portfolio photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Starting Rate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {sitterData.baseRate && sitterData.baseRate !== Infinity ? `From NZ$${sitterData.baseRate}` : 'Contact for pricing'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Per service (varies by type)
                  </div>
                </div>
                
                {/* Removed send message functionality */}
              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sitterData.availability.map((time) => (
                    <div key={time} className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm">{time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm md:text-base">
                  <Shield className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  <span className="truncate">Verification</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Identity Verified</span>
                  <Badge variant="secondary">✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Profile Verified</span>
                  <Badge variant="secondary">✓</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}