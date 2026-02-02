import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, CheckCircle, Camera, Shield, Clock, DollarSign, Search, Heart } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';
import petServices from '@/assets/pet-services.jpg';
import { supabase } from '@/integrations/supabase/client';
import EnhancedSitterCard from '@/components/search/EnhancedSitterCard';
import StripeLiveModeWarning from '@/components/sitter/StripeLiveModeWarning';
// Import hero versions - swap these to switch between versions
import HeroSectionPlayful from '@/components/home/HeroSectionPlayful';
import NZTrustBadge from '@/components/home/NZTrustBadge';
// import HeroSectionV2 from '@/components/home/HeroSectionV2';
// import HeroSectionOriginal from '@/components/home/HeroSectionOriginal';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import TrustGuarantees from '@/components/home/TrustGuarantees';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import TrustSignalsSection from '@/components/home/TrustSignalsSection';
import ExitIntentPopup from '@/components/home/ExitIntentPopup';
import GeoLocationBanner from '@/components/home/GeoLocationBanner';
import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';
import { useProfile } from '@/contexts/ProfileContext';
import { useSearchTracking } from '@/hooks/useSearchTracking';

// Pet photos for gallery section
const petGalleryPhotos = [
  { url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop', alt: 'Happy golden retriever' },
  { url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=400&fit=crop', alt: 'Curious cat' },
  { url: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=400&h=400&fit=crop', alt: 'Dog at beach' },
  { url: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&h=400&fit=crop', alt: 'Orange cat' },
  { url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=400&fit=crop', alt: 'Dalmatian smiling' },
  { url: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400&h=400&fit=crop', alt: 'Cat stretching' },
];

const Index = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { trackAction } = useBehaviorTracking();
  const { trackSitterClick, trackSearch } = useSearchTracking();
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [serviceType, setServiceType] = useState(searchParams.get('serviceType') || '');
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');

  // Track home page view with user context
  useEffect(() => {
    trackAction('home_page_viewed', {
      is_authenticated: !!user,
      user_role: profile?.role || 'anonymous',
      has_completed_onboarding: profile?.onboarding_completed || false,
    });
  }, [user, profile]);

  const popularServices = [
    { name: 'Pet Sitting (Sitter\'s Home)', icon: '🏠', description: 'Your pet stays at sitter\'s home - choose daily photo updates if you want them', value: 'pet_sitting_sitters_home' },
    { name: 'Pet Sitting (Your Home)', icon: '🏡', description: 'Sitter comes to your home - request daily reports when booking', value: 'pet_sitting_owners_home' },
    { name: 'Drop-in Visits', icon: '⏰', description: 'Quick visits with optional photo documentation', value: 'drop_in_visits' },
  ];

  // Real data from database
  const [featuredSitters, setFeaturedSitters] = useState([]);

  useEffect(() => {
    const fetchSitters = async () => {
      // Get sitters who have completed onboarding and have a profile photo
      // CRITICAL: Only show sitters who completed onboarding to avoid "Sitter not found" errors
      const { data, error } = await supabase
        .from('public_sitters')
        .select('*')
        .eq('onboarding_completed', true) // Only show complete profiles
        .not('avatar_url', 'is', null)
        .neq('avatar_url', '')
        .order('golden_badge_approved', { ascending: false }) // Golden badge first
        .order('rating', { ascending: false })
        .limit(4);
      
      if (data && data.length > 0) {
        const sitterIds = data.map(s => s.id);
        
        // Fetch services and police vet status in parallel
        const [policeVetResult, servicesResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, blue_card_document_url')
            .in('id', sitterIds),
          supabase
            .from('sitter_services')
            .select('*')
            .in('sitter_id', sitterIds)
            .eq('is_offered', true)
        ]);
        
        const policeVetMap = new Map(policeVetResult.data?.map(p => [p.id, !!p.blue_card_document_url]) || []);
        const servicesMap = new Map<string, any[]>();
        servicesResult.data?.forEach(s => {
          if (!servicesMap.has(s.sitter_id)) servicesMap.set(s.sitter_id, []);
          servicesMap.get(s.sitter_id)!.push(s);
        });
        
        // Map service types to friendly names
        const serviceTypeLabels: Record<string, string> = {
          'pet_sitting_sitters_home': "Pet Sitting (Sitter's Home)",
          'pet_sitting_owners_home': 'Pet Sitting (Your Home)',
          'drop_in_visits': 'Drop-in Visits',
        };
        
        setFeaturedSitters(data.map(sitter => {
          const sitterServices = servicesMap.get(sitter.id) || [];
          const baseRate = Math.min(
            ...sitterServices.map(s => s.daily_rate || s.overnight_rate || 50).filter(r => r > 0),
            50
          );
          
          return {
            id: sitter.id,
            name: `${sitter.first_name} ${sitter.last_name?.charAt(0) || ''}.`,
            location: `${sitter.suburb || 'Auckland'}, ${sitter.city || 'Auckland'}`,
            baseRate: baseRate,
            bio: sitter.bio || 'Experienced pet care provider',
            image: sitter.avatar_url,
            services: sitterServices.map(s => serviceTypeLabels[s.service_type] || s.service_type),
            verified: sitter.is_verified || false,
            golden_badge: policeVetMap.get(sitter.id) || false,
            sitterServices: sitterServices,
          };
        }));
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
    "description": "Professional pet sitting services in Auckland and Hamilton with optional daily photo updates and detailed reports - choose your level of communication.",
    "url": "https://ziggysitters.com",
    "telephone": "+64-9-XXX-XXXX",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Auckland",
      "addressCountry": "New Zealand"
    },
    "areaServed": ["Auckland, New Zealand", "Hamilton, New Zealand"],
    "serviceType": ["Pet Sitting", "Pet Care", "Daily Reports", "Drop-in Visits"],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "500"
    }
  };

  return (
    <>
      <SEOHead 
        title="ZiggySitters - Pet Sitters with Optional Daily Photo Updates | Auckland & Hamilton"
        description="Find trusted pet sitters in Auckland and Hamilton who can send daily photo updates when you request them. Choose your level of communication - accountability guaranteed when you do. Book verified pet care today."
        keywords="pet sitters Auckland, pet sitters Hamilton, daily pet reports, pet sitting with photos, verified pet care, cat sitting, pet care updates, drop-in visits"
        canonical="/"
        structuredData={structuredData}
      />
      <div className="bg-gradient-to-b from-background to-accent/20">
      {/* Geo-aware location banner for international visitors */}
      <GeoLocationBanner />

      {/* Stripe Live Mode Warning for Logged-in Sitters */}
      {user && (
        <div className="container mx-auto px-4 pt-6">
          <StripeLiveModeWarning />
        </div>
      )}
      
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

      {/* Featured Sitters - Premium Showcase */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/10 to-secondary/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header with flair */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-4">
              <Heart className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">Handpicked for Excellence</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Meet Your Pet's New Best Friend
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Police-vetted, experienced sitters who treat your pets like family
            </p>
          </div>
          
          {/* Sitter Cards using EnhancedSitterCard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {featuredSitters.map((sitter) => (
              <EnhancedSitterCard
                key={sitter.id}
                sitter={sitter}
                onViewProfile={() => navigate(`/sitter/${sitter.id}?booking=true`)}
                onSitterClick={(id, name) => trackSitterClick(id, name)}
              />
            ))}
          </div>
          
          {/* Bottom CTA - More prominent */}
          <div className="text-center mt-12 md:mt-16 space-y-4">
            <Button 
              size="lg" 
              onClick={() => {
                // Track browse action from homepage
                trackSearch({
                  suburb: 'homepage_discover_all',
                  city: 'Auckland',
                  serviceType: 'any',
                  resultsCount: 0,
                });
                navigate('/find-sitters');
              }}
              className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 px-10 py-7 text-lg font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105 animate-pulse-subtle"
            >
              <Search className="w-5 h-5 mr-2" />
              Find Your Perfect Sitter Now
              <span className="ml-2">→</span>
            </Button>
            <p className="text-sm text-muted-foreground">
              ✓ Free to browse • ✓ No obligation • ✓ Trusted sitters only
            </p>
          </div>
        </div>
      </section>

      {/* 100% NZ-Based Sitters Trust Badge */}
      <NZTrustBadge />

      {/* Named Trust Guarantees - Above How It Works */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <TrustGuarantees />
        </div>
      </section>

      {/* How It Works */}
      <HowItWorksSection />

      {/* Pet Gallery Section - NEW */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">Happy Pets, Happy Owners</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Our verified sitters care for all kinds of furry, feathered, and scaly friends
            </p>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4 max-w-5xl mx-auto">
            {petGalleryPhotos.map((photo, index) => (
              <div 
                key={index} 
                className="aspect-square rounded-xl md:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                <img 
                  src={photo.url} 
                  alt={photo.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-12 md:py-20 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-16 px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">Daily Updates - When You Want Them</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose to receive daily photo reports when booking - complete transparency is just one click away
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto px-4">
            {popularServices.map((service, index) => (
              <Card 
                key={index} 
                className="text-center hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/find-sitters?serviceType=${service.value}`)}
              >
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
                      <div className="rounded-lg h-16 overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=100&fit=crop" 
                          alt="Pet photo 1" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="rounded-lg h-16 overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=100&h=100&fit=crop" 
                          alt="Pet photo 2" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="rounded-lg h-16 overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1544568100-847a948585b9?w=100&h=100&fit=crop" 
                          alt="Pet photo 3" 
                          className="w-full h-full object-cover"
                        />
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
                <span className="text-4xl font-bold text-primary">5%</span>
                <div className="text-left">
                  <p className="font-semibold">of our profits</p>
                  <p className="text-sm text-muted-foreground">goes directly to</p>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-3">SPCA New Zealand</h3>
              <p className="text-muted-foreground mb-6">
                Your bookings help us support the SPCA's vital work in animal rescue, providing medical care for abandoned pets, 
                and funding spay/neuter programs across New Zealand.
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

      {/* How It Works - with images */}
      <section className="py-12 md:py-20 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-16 px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">How Daily Updates Work</h2>
            <p className="text-base md:text-lg text-muted-foreground">
              The first pet sitting platform with mandatory transparency
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto px-4">
            {[
              {
                step: 1,
                title: 'Search & Browse',
                description: 'Find verified pet sitters in your area who match your needs',
                image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=300&fit=crop',
                icon: Search
              },
              {
                step: 2,
                title: 'Meet & Greet',
                description: 'Connect with sitters, ask questions, and arrange a meet',
                image: 'https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?w=400&h=300&fit=crop',
                icon: Heart
              },
              {
                step: 3,
                title: 'Book & Relax',
                description: 'Book securely and receive daily photo updates of your pet',
                image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop',
                icon: Shield
              }
            ].map((step, index) => (
              <div key={index} className="text-center group">
                {/* Image container */}
                <div className="relative mb-4 md:mb-6 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
                  <img 
                    src={step.image} 
                    alt={step.title}
                    className="w-full h-40 md:h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-primary text-primary-foreground rounded-full font-bold text-lg shadow-lg">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">{step.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-12 md:py-20 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Ready for Guaranteed Peace of Mind?
            </h2>
            <p className="text-lg md:text-xl mb-6 md:mb-8 text-muted-foreground">
              Join pet owners across Auckland who trust our verified sitters
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Button size="lg" className="px-8 shadow-lg hover:shadow-xl transition-all" onClick={() => navigate('/find-sitters')}>
                Find a Trusted Sitter Now
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              ✓ Free meet & greet • ✓ No payment until sitter accepts • ✓ Daily updates guaranteed
            </p>
          </div>
        </div>
      </section>
      </div>

      {/* Trust Signals */}
      <TrustSignalsSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Exit Intent Popup */}
      <ExitIntentPopup />
    </>
  );
};

export default Index;