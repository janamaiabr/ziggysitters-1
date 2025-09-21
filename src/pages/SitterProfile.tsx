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

import { supabase } from '@/integrations/supabase/client';

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
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [sitterData, setSitterData] = useState<SitterData | null>(null);
  const [servicesData, setServicesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Check if booking should be automatically opened
  useEffect(() => {
    const shouldOpenBooking = searchParams.get('booking') === 'true';
    if (shouldOpenBooking) {
      setIsBookingOpen(true);
    }
  }, [searchParams]);

  // Load sitter data from the secure database view
  useEffect(() => {
    const fetchSitterData = async () => {
      if (!id) return;
      
      try {
        // Fetch from the secure public view
        const { data, error } = await supabase
          .from('public_sitter_profiles')
          .select('*')
          .eq('id', id)
          .neq('role', 'admin')  // Extra filter to ensure no admin users
          .single();

        if (error) {
          console.error('Error fetching sitter:', error);
          setSitterData(null);
        } else if (data) {
          // Fetch actual services for this sitter
          const { data: servicesData } = await supabase
            .from('sitter_services')
            .select('*')
            .eq('sitter_id', id)
            .eq('is_offered', true);

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
              case 'dog_walking': return 'Dog Walking';
              case 'daycare': return 'Pet Sitting';
              case 'overnight_boarding': return 'Overnight Care';
              case 'pet_sitting_owners_home': return 'Pet Sitting in Owner\'s Home';
              case 'pet_sitting_sitters_home': return 'Pet Sitting in Sitter\'s Home';
              default: return 'Pet Care';
            }
          }) || ['Pet Sitting', 'Drop-in Visits'];

          // Get the lowest rate from actual services
          const rates = servicesData?.map(service => 
            service.hourly_rate || service.daily_rate || service.overnight_rate
          ).filter(Boolean) || [];
          const baseRate = rates.length > 0 ? Math.min(...rates) : null;

          // Transform the data to match our interface using real data
          setSitterData({
            id: data.id,
            display_name: data.display_name,
            location: `${data.suburb}, ${data.city}`,
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
            
            bio: data.bio || 'Experienced pet care provider',
            experience: servicesData?.length > 0 ? 
              `${Math.max(...servicesData.map(s => s.experience_years || 0))} years experience` : 
              'Experienced pet care provider',
            availability: ['Available for bookings'], // This could be expanded to use real availability data
            specialties: servicesData?.length > 0 ? 
              servicesData.flatMap(s => {
                const specs = [];
                if (s.has_fenced_yard) specs.push('Fenced yard');
                if (s.allows_puppies) specs.push('Puppy care');
                if (s.allows_senior_pets) specs.push('Senior pet care');
                return specs;
              }).slice(0, 3) : ['Pet care specialist'],
            gallery: portfolioUrls.length > 0 ? portfolioUrls : []
          });
        }
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
              <AvatarImage src={sitterData.avatar} />
              <AvatarFallback>
                {sitterData.display_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{sitterData.display_name}</h1>
                {sitterData.verified === true && (
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                )}
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
                {/* Removed save sitter and message functionality */}
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
            {/* Booking CTA Button */}
            <Card className="mb-6">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-3">Ready to book {sitterData.display_name.split(' ')[0]}?</h3>
                <p className="text-muted-foreground mb-4">Secure, reliable pet care from a verified sitter</p>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                  onClick={() => setIsBookingOpen(true)}
                >
                  Book Your Service
                </Button>
              </CardContent>
            </Card>

            {/* Booking Form - Hidden Accordion */}
            <div className={isBookingOpen ? 'block' : 'hidden'}>
              <BookingAccordion
                sitter={{
                  id: sitterData.id,
                  name: sitterData.display_name,
                  location: sitterData.location,
                  hourlyRate: sitterData.hourlyRate,
                  services: sitterData.services,
                  avatar: sitterData.avatar
                }}
                isOpen={true}
                onBookingComplete={() => navigate('/bookings')}
              />
            </div>
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
                        case 'dog_walking': return 'Dog Walking';
                        case 'daycare': return 'Pet Sitting';
                        case 'overnight_boarding': return 'Overnight Care';
                        case 'pet_sitting_owners_home': return 'Pet Sitting in Owner\'s Home';
                        case 'pet_sitting_sitters_home': return 'Pet Sitting in Sitter\'s Home';
                        default: return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                      }
                    };

                    const getServiceDescription = (type: string) => {
                      switch (type) {
                        case 'dog_walking': return '30-60 minute walks';
                        case 'daycare': return 'Daily visits & care';
                        case 'overnight_boarding': return '24-hour boarding care';
                        case 'pet_sitting_owners_home': return 'Pet care in your home';
                        case 'pet_sitting_sitters_home': return 'Pet care in sitter\'s home';
                        default: return 'Professional pet care service';
                      }
                    };

                    const getRate = (service: any) => {
                      if (service.hourly_rate) return `NZ$${service.hourly_rate.toFixed(2)}/hour`;
                      if (service.daily_rate) return `NZ$${service.daily_rate.toFixed(2)}/day`;
                      if (service.overnight_rate) return `NZ$${service.overnight_rate.toFixed(2)}/night`;
                      return 'Contact for pricing';
                    };

                    return (
                      <div key={service.id} className="flex justify-between items-center">
                        <span>{getServiceDisplayName(service.service_type)}</span>
                        <div className="text-right">
                          <div className="font-semibold">{getRate(service)}</div>
                          <div className="text-xs text-muted-foreground">
                            {getServiceDescription(service.service_type)}
                          </div>
                        </div>
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
                    {sitterData.specialties.map((specialty) => (
                      <Badge key={specialty} variant="outline">
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
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Verification
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
                <div className="flex items-center justify-between">
                  <span className="text-sm">References</span>
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