import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Star, CheckCircle, Camera, Shield, Clock, DollarSign, Search, Heart } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';
import petServices from '@/assets/pet-services.jpg';
import { supabase } from '@/integrations/supabase/client';
// Import hero versions - swap these to switch between versions
import HeroSectionPlayful from '@/components/home/HeroSectionPlayful';
// import HeroSectionV2 from '@/components/home/HeroSectionV2';
// import HeroSectionOriginal from '@/components/home/HeroSectionOriginal';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [serviceType, setServiceType] = useState(searchParams.get('serviceType') || '');
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');

  const popularServices = [
    { name: 'Pet Sitting with Optional Reports', icon: '🏠', description: 'Your pet stays at sitter\'s home - choose daily photo updates if you want them' },
    { name: 'In-Home Care', icon: '🏡', description: 'Sitter comes to your home - request daily reports when booking' },
    { name: 'Drop-in Visits', icon: '⏰', description: 'Quick visits with optional photo documentation' },
    { name: 'Dog Walking', icon: '🚶‍♂️', description: 'Professional walks - add daily reports for extra peace of mind' },
  ];

  // Real data from database
  const [featuredSitters, setFeaturedSitters] = useState([]);

  useEffect(() => {
    const fetchSitters = async () => {
      // Fetch directly from profiles table instead of view
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'pet_sitter')
        .eq('is_verified', true) // Only show verified sitters
        .order('rating', { ascending: false })
        .limit(4);
      
      console.log('Featured sitters data:', data);
      console.log('Featured sitters error:', error);
      
      if (data && data.length > 0) {
        setFeaturedSitters(data.map(sitter => ({
          id: sitter.id,
          name: `${sitter.first_name} ${sitter.last_name.charAt(0)}.`,
          rating: sitter.rating || 4.8,
          feedback_count: sitter.total_reviews || 0,
          location: `${sitter.suburb || 'Auckland'}, ${sitter.city || 'Auckland'}`,
          services: ['Pet Sitting', 'Drop-in Visits'],
          verified: sitter.is_verified,
          
          avatar: sitter.avatar_url || 'https://images.unsplash.com/photo-1494790108755-2616b612b9c5?w=150&h=150&fit=crop&crop=face',
          bio: sitter.bio || 'Experienced pet care provider'
        })));
      }
    };

    fetchSitters();
  }, []);

  const trustFeatures = [
    {
      icon: Camera,
      title: 'Optional Daily Updates',
      description: 'Choose daily photo reports when booking - sitters must deliver or face 15% deduction'
    },
    {
      icon: Shield,
      title: 'Your Choice, Your Control',
      description: 'Decide if you want daily updates - accountability guaranteed when you do'
    },
    {
      icon: CheckCircle,
      title: 'Transparent Care',
      description: 'Request detailed daily reports on exercise, food, sleep, and mood'
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "ZiggySitters",
    "description": "Professional pet sitting services in Auckland with optional daily photo updates and detailed reports - choose your level of communication.",
    "url": "https://ziggysitters.com",
    "telephone": "+64-9-XXX-XXXX",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Auckland",
      "addressCountry": "New Zealand"
    },
    "areaServed": "Auckland, New Zealand",
    "serviceType": ["Pet Sitting", "Dog Walking", "Pet Care", "Daily Reports"],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "500"
    }
  };

  return (
    <>
      <SEOHead 
        title="ZiggySitters - Pet Sitters with Optional Daily Photo Updates | Auckland"
        description="Find trusted pet sitters in Auckland who can send daily photo updates when you request them. Choose your level of communication - accountability guaranteed when you do. Book verified pet care today."
        keywords="pet sitters Auckland, daily pet reports, pet sitting with photos, verified pet care, dog walking Auckland, cat sitting, pet care updates"
        canonical="/"
        structuredData={structuredData}
      />
      <div className="bg-gradient-to-b from-background to-accent/20">
      {/* Hero Section - To rollback, replace HeroSectionPlayful with HeroSectionV2 */}
      <HeroSectionPlayful
        location={location}
        setLocation={setLocation}
        serviceType={serviceType}
        setServiceType={setServiceType}
        checkIn={checkIn}
        setCheckIn={setCheckIn}
        checkOut={checkOut}
        setCheckOut={setCheckOut}
      />

      {/* Popular Services */}
      <section className="py-12 md:py-20 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-16 px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">Daily Updates - When You Want Them</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose to receive daily photo reports when booking - complete transparency is just one click away
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto px-4">
            {popularServices.map((service, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-4 md:p-8">
                  <div className="text-3xl md:text-4xl mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                    {service.icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">{service.name}</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-2 md:mb-4">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Sitters */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-16 px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">Top-rated Sitters in Auckland</h2>
            <p className="text-base md:text-lg text-muted-foreground">
              Meet some of our verified, experienced pet care professionals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto px-4">
            {featuredSitters.map((sitter) => (
              <Card key={sitter.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3 md:pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <Avatar className="h-12 w-12 md:h-16 md:w-16">
                         <AvatarImage 
                           src={sitter.avatar} 
                           alt={sitter.name} 
                           className="object-cover"
                           onError={(e) => {
                             e.currentTarget.src = 'https://images.unsplash.com/photo-1494790108755-2616b612b9c5?w=150&h=150&fit=crop&crop=face';
                           }}
                         />
                        <AvatarFallback>{sitter.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg md:text-xl">{sitter.name}</CardTitle>
                        <div className="flex items-center text-xs md:text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3 mr-1" />
                          {sitter.location}
                        </div>
                         <div className="flex items-center mt-1">
                           <Star className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400 mr-1" />
                           <span className="font-medium text-sm md:text-base">{sitter.rating}</span>
                           <span className="text-xs md:text-sm text-muted-foreground ml-1">⭐ Top rated</span>
                          {sitter.verified && (
                            <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-500 ml-2" />
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Removed save sitter functionality */}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3 md:space-y-4">
                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{sitter.bio}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {sitter.services.map((service) => (
                      <Badge key={service} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                  
                   <div className="flex items-center justify-between">
                      <div className="text-xs md:text-sm text-muted-foreground">
                        
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
          
          <div className="text-center mt-8 md:mt-12 px-4">
           <Button variant="outline" size="lg" onClick={() => navigate('/find-sitters')}>
             View All Sitters
           </Button>
          </div>
        </div>
      </section>

      {/* Daily Reports Section */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-6">
                <div className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  <Camera className="w-4 h-4 mr-2" />
                  Industry First Feature
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Daily Reports - Your Choice, Guaranteed Delivery
                </h2>
                
                <p className="text-lg text-gray-600 leading-relaxed">
                  Want daily updates? Just check the box when booking. When you request reports, ZiggySitters holds
                  sitters accountable - no updates means 15% payment reduction. You get to choose the level of communication,
                  and we guarantee delivery when you do.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Multiple Daily Photos</h4>
                      <p className="text-sm text-gray-600">See your pet's activities throughout the day</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Detailed Care Notes</h4>
                      <p className="text-sm text-gray-600">Feeding, exercise, mood, and health updates</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Payment Guarantee</h4>
                      <p className="text-sm text-gray-600">Sitters' pay depends on report quality</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Peace of Mind</h4>
                      <p className="text-sm text-gray-600">Never wonder how your pet is doing</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/daily-reports-info')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Learn More About Daily Reports
                  </Button>
                </div>
              </div>
              
              {/* Right Content - Visual/Stats */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Sample Daily Report</h3>
                    <p className="text-sm text-gray-600">What you'll receive every day</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-800">Morning Walk</span>
                      <span className="text-xs text-green-600">✓ 45 minutes</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-800">Feeding Time</span>
                      <span className="text-xs text-blue-600">✓ Ate well</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-purple-800">Playtime</span>
                      <span className="text-xs text-purple-600">✓ Very active</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="bg-gray-100 rounded-lg h-16 flex items-center justify-center">
                        <Camera className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="bg-gray-100 rounded-lg h-16 flex items-center justify-center">
                        <Camera className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="bg-gray-100 rounded-lg h-16 flex items-center justify-center">
                        <Camera className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 text-center italic">
                      "Max had a wonderful day! Very playful and ate all his food. Looking forward to tomorrow's adventure!"
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
                    <div className="text-2xl font-bold text-blue-600">100%</div>
                    <div className="text-sm text-gray-600">Report Compliance</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
                    <div className="text-2xl font-bold text-green-600">5+</div>
                    <div className="text-sm text-gray-600">Photos Per Day</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Charity Section */}
      <section className="py-12 md:py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <span className="text-2xl">🐾</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Making a Difference Together
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Every time you book with ZiggySitters, you're not just caring for your pet—you're helping pets in need around the world.
              </p>
            </div>
            
            <div className="bg-card border rounded-xl p-8 shadow-sm">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-4xl font-bold text-primary">2%</span>
                <div className="text-left">
                  <p className="font-semibold">of our profits</p>
                  <p className="text-sm text-muted-foreground">goes directly to</p>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-3">Animal Shelters & Charities Worldwide</h3>
              <p className="text-muted-foreground mb-6">
                Your bookings help us support animal rescue organizations, provide medical care for abandoned pets, 
                and fund spay/neuter programs in communities that need it most.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Emergency medical care</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Shelter support programs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Spay & neuter initiatives</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 md:py-20 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-16 px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">How Daily Updates Work</h2>
            <p className="text-base md:text-lg text-muted-foreground">
              The first pet sitting platform with mandatory transparency
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto px-4">
            {[
              {
                step: 1,
                title: 'Search & Browse',
                description: 'Find verified pet sitters in your area',
                icon: Search
              },
              {
                step: 2,
                title: 'Meet & Greet',
                description: 'Connect with sitters and arrange a meet',
                icon: Heart
              },
              {
                step: 3,
                title: 'Book & Relax',
                description: 'Book securely and enjoy peace of mind',
                icon: Shield
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-primary text-primary-foreground rounded-full mb-4 md:mb-6 font-bold text-lg md:text-xl">
                  {step.step}
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">{step.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">Ready for Guaranteed Peace of Mind?</h2>
            <p className="text-lg md:text-xl mb-6 md:mb-8 opacity-90">
              Join thousands of pet owners who never worry again - because they get daily photo updates
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Button size="lg" variant="solid-white" className="px-8" onClick={() => navigate('/auth')}>
                Find a Sitter Now
              </Button>
              <Button 
                variant="outline-white"
                size="lg" 
                className="px-8" 
                onClick={() => navigate('/auth')}
              >
                Join as a Sitter
              </Button>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  );
};

export default Index;