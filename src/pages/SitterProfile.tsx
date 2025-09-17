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
  reviews: number;
  baseRate: number;
  hourlyRate: number;
  services: string[];
  petTypes: string[];
  avatar: string;
  verified: boolean;
  responseRate: number;
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
          // Transform the data to match our interface
          setSitterData({
            id: data.id,
            display_name: data.display_name, // Privacy-safe name
            location: `${data.suburb}, ${data.city}`,
            rating: data.rating || 4.8,
            reviews: data.total_reviews || 0,
            baseRate: 25,
            hourlyRate: 27.50,
            services: ['Pet Sitting', 'Drop-in Visits'], // Would come from sitter_services table
            petTypes: ['Dogs', 'Cats'], // Would come from sitter preferences  
            avatar: data.avatar_url || 'https://images.unsplash.com/photo-1494790108755-2616b612b9c5?w=150&h=150&fit=crop&crop=face',
            verified: data.is_verified,
            responseRate: data.response_rate || 95,
            bio: data.bio || 'Experienced pet care provider',
            experience: '3+ years',
            availability: ['Weekdays', 'Weekends'],
            specialties: ['General pet care', 'Friendly pets'],
            gallery: [
              'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=200&fit=crop',
              'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=200&fit=crop',
              'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300&h=200&fit=crop'
            ]
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
                {sitterData.verified && (
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
                    ({sitterData.reviews} reviews)
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span className="text-sm">{sitterData.responseRate}% response rate</span>
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
                <div className="flex justify-between items-center">
                  <span>Dog Walking</span>
                  <div className="text-right">
                    <div className="font-semibold">$25.00/service</div>
                    <div className="text-xs text-muted-foreground">
                      30-60 minute walks
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Pet Sitting</span>
                  <div className="text-right">
                    <div className="font-semibold">$45.00/day</div>
                    <div className="text-xs text-muted-foreground">
                      Daily visits & care
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Overnight Care</span>
                  <div className="text-right">
                    <div className="font-semibold">$75.00/night</div>
                    <div className="text-xs text-muted-foreground">
                      24-hour in-home care
                    </div>
                  </div>
                </div>
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
                  <h4 className="font-medium mb-2">Specialties</h4>
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
                      alt={`Gallery photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
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
                  <div className="text-2xl font-bold">From $25</div>
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