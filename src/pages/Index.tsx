import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, CheckCircle, Camera, Shield, Clock, DollarSign, Search, Heart, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import heroImage from '@/assets/hero-image.jpg';
import petServices from '@/assets/pet-services-ai-backup.jpg';
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
import OnboardingTour from '@/components/onboarding/OnboardingTour';
import EasterBanner from '@/components/home/EasterBanner';
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
  const isMobile = useIsMobile();
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
    "email": "hello@ziggysitters.com",
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
      "reviewCount": "277"
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
      {/* Easter Campaign Banner */}
      <EasterBanner />

      <div className="bg-white">
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
      <section className="py-10 md:py-24 relative overflow-hidden bg-[#fafbfa] border-y border-gray-100">
        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-6 md:mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5 md:px-4 md:py-2 mb-3 md:mb-4">
              <Heart className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-600" />
              <span className="text-xs md:text-sm font-medium text-emerald-700">Verified Local Sitters</span>
            </div>
            <h2 className="text-2xl md:text-5xl font-bold mb-2 md:mb-4 text-gray-900">
              Meet Local Sitters Near You
            </h2>
            <p className="text-sm md:text-xl text-gray-500 max-w-2xl mx-auto">
              Real people in your area — ID verified and ready to care for your pets
            </p>
          </div>
          
          {/* Sitter Cards — 2 on mobile, all on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto">
            {(isMobile ? featuredSitters.slice(0, 2) : featuredSitters).map((sitter) => (
              <EnhancedSitterCard
                key={sitter.id}
                sitter={sitter}
                onViewProfile={() => navigate(`/sitter/${sitter.id}?booking=true`)}
                onSitterClick={(id, name) => trackSitterClick(id, name)}
              />
            ))}
          </div>
          
          {/* Bottom CTA */}
          <div className="text-center mt-6 md:mt-16 space-y-3 md:space-y-4">
            <Button 
              size="lg" 
              onClick={() => {
                trackSearch({
                  suburb: 'homepage_discover_all',
                  city: 'Auckland',
                  serviceType: 'any',
                  resultsCount: 0,
                });
                navigate('/find-sitters');
              }}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 md:px-10 py-5 md:py-7 text-base md:text-lg font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 min-h-[48px]"
            >
              <Search className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              {isMobile ? 'See All Sitters' : 'Find a Sitter Near You'}
              <span className="ml-2">→</span>
            </Button>
            <p className="text-xs md:text-sm text-gray-500">
              ✓ Free to browse • ✓ ID Verified • ✓ Daily Photo Updates
            </p>
          </div>
        </div>
      </section>

      {/* 100% NZ-Based Sitters Trust Badge */}
      <NZTrustBadge />

      {/* Named Trust Guarantees - Above How It Works */}
      <section className="py-8 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <TrustGuarantees />
        </div>
      </section>

      {/* How It Works */}
      <HowItWorksSection />

      {/* Pet Gallery Section */}
      <section className="py-8 md:py-16 bg-gradient-to-b from-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4 md:mb-12">
            <h2 className="text-xl md:text-3xl font-bold mb-1 md:mb-4">Happy Pets, Happy Owners</h2>
            <p className="text-xs md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Our verified sitters care for all kinds of furry friends
            </p>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 md:gap-4 max-w-5xl mx-auto">
            {petGalleryPhotos.map((photo, index) => (
              <div 
                key={index} 
                className="aspect-square rounded-lg md:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 group"
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

      {/* Popular Services — hidden on mobile (covered by How It Works) */}
      <section className="hidden md:block py-12 md:py-20 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-16 px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">Updates That Matter, Every Single Day</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Morning and evening reports with photos, care notes, and behavioural tracking — so you always know how your pet is doing
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
      <section className="py-8 md:py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-4 md:space-y-6">
                <div className="inline-flex items-center bg-blue-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium">
                  <Camera className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                  Industry First Feature
                </div>
                
                <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
                  Watch the Bond Grow, Update by Update
                </h2>
                
                <p className="text-sm md:text-lg text-gray-600 leading-relaxed">
                  96% report compliance rate, with updates sent 2x per day. Sitter payment is tied to delivery — the platform monitors every booking automatically.
                </p>
                
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="flex items-start space-x-2 md:space-x-3">
                    <div className="w-7 h-7 md:w-8 md:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base">Daily Photos</h4>
                      <p className="text-xs md:text-sm text-gray-600">See your pet{"'"}s day</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2 md:space-x-3">
                    <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base">Care Notes</h4>
                      <p className="text-xs md:text-sm text-gray-600">Food, mood & health</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2 md:space-x-3">
                    <div className="w-7 h-7 md:w-8 md:h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base">Pay Guarantee</h4>
                      <p className="text-xs md:text-sm text-gray-600">Tied to report quality</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2 md:space-x-3">
                    <div className="w-7 h-7 md:w-8 md:h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base">Peace of Mind</h4>
                      <p className="text-xs md:text-sm text-gray-600">Never worry again</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 md:pt-4">
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/daily-reports-info')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 min-h-[44px]"
                  >
                    <Camera className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    Learn More About Daily Reports
                  </Button>
                </div>
              </div>
              
              {/* Right Content - Visual/Stats */}
              <div className="space-y-4 md:space-y-6">
                <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border border-gray-200">
                  <div className="text-center mb-4 md:mb-6">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">Sample Daily Report</h3>
                    <p className="text-xs md:text-sm text-gray-600">What you{"'"}ll receive every day</p>
                  </div>
                  
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between p-2.5 md:p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-800">Morning Walk</span>
                      <span className="text-xs text-green-600">✓ 45 minutes</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-2.5 md:p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-800">Feeding Time</span>
                      <span className="text-xs text-blue-600">✓ Ate well</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-2.5 md:p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-purple-800">Playtime</span>
                      <span className="text-xs text-purple-600">✓ Very active</span>
                    </div>
                    
                    {/* Sample report photos — BIGGER on mobile */}
                    <div className="grid grid-cols-3 gap-2 mt-3 md:mt-4">
                      <div className="rounded-lg h-24 md:h-16 overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop" 
                          alt="Pet photo 1" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="rounded-lg h-24 md:h-16 overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=200&h=200&fit=crop" 
                          alt="Pet photo 2" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="rounded-lg h-24 md:h-16 overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1544568100-847a948585b9?w=200&h=200&fit=crop" 
                          alt="Pet photo 3" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 text-center italic">
                      "Max had a wonderful day! Very playful and ate all his food."
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="bg-white rounded-xl p-3 md:p-4 text-center border border-gray-200">
                    <div className="text-xl md:text-2xl font-bold text-blue-600">96%</div>
                    <div className="text-xs md:text-sm text-gray-600">Report Compliance</div>
                  </div>
                  <div className="bg-white rounded-xl p-3 md:p-4 text-center border border-gray-200">
                    <div className="text-xl md:text-2xl font-bold text-green-600">2x/day</div>
                    <div className="text-xs md:text-sm text-gray-600">Updates Delivered</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Charity Section - Compact on mobile */}
      <section className="py-8 md:py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="mb-4 md:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full mb-3 md:mb-4">
                <span className="text-xl md:text-2xl">🐾</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">
                Making a Difference Together
              </h2>
              <p className="text-sm md:text-lg text-muted-foreground">
                Every booking helps pets in need across New Zealand.
              </p>
            </div>
            
            <div className="bg-card border rounded-xl p-4 md:p-8 shadow-sm">
              <div className="flex items-center justify-center gap-3 mb-3 md:mb-4">
                <span className="text-3xl md:text-4xl font-bold text-primary">5%</span>
                <div className="text-left">
                  <p className="font-semibold text-sm md:text-base">of our profits</p>
                  <p className="text-xs md:text-sm text-muted-foreground">goes to SPCA NZ</p>
                </div>
              </div>
              
              {/* Expanded details hidden on mobile */}
              <div className="hidden md:block">
                <h3 className="text-xl font-semibold mb-3">SPCA New Zealand</h3>
                <p className="text-muted-foreground mb-6">
                  Your bookings help us support the SPCA{"'"}s vital work in animal rescue, providing medical care for abandoned pets, 
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
        </div>
      </section>

      {/* "How Daily Updates Work" - Hidden on mobile (duplicate of How It Works) */}
      <section className="hidden md:block py-12 md:py-20 bg-accent/5">
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

      {/* CTA Section — Quick Email Capture */}
      <section className="relative py-8 md:py-20 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-xl mx-auto">
            <h2 className="text-xl md:text-4xl font-bold mb-3 md:mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Ready to Find Your Pet{"'"}s Person?
            </h2>
            <p className="text-sm md:text-xl mb-4 md:mb-6 text-muted-foreground">
              Enter your email and we{"'"}ll match you with trusted sitters in your area
            </p>
            <form
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
                const email = emailInput?.value?.trim();
                if (!email) return;
                try {
                  await fetch('https://formspree.io/f/xpwzgkby', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, source: 'ziggy-homepage-cta' }),
                  });
                } catch {}
                navigate(`/auth?tab=signup&email=${encodeURIComponent(email)}`);
              }}
            >
              <Input
                type="email"
                placeholder="your@email.com"
                required
                className="h-12 text-base"
              />
              <Button type="submit" size="lg" className="px-6 md:px-8 shadow-lg hover:shadow-xl transition-all min-h-[48px] whitespace-nowrap">
                Get Started Free
              </Button>
            </form>
            <p className="text-xs md:text-sm text-muted-foreground">
              ✓ Free to join • ✓ No payment until you book • ✓ Cancel anytime
            </p>
            <div className="mt-4">
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => navigate('/find-sitters')}>
                Or browse sitters first →
              </Button>
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* Blog Section */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">Pet Care Tips & Guides</h2>
            <p className="text-muted-foreground text-sm md:text-lg">Expert advice to help you provide the best care for your pets in New Zealand</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {[
              { slug: 'how-to-choose-pet-sitter-nz-buyer-guide', title: 'How to Choose a Pet Sitter in NZ', tag: 'For Pet Owners' },
              { slug: 'pet-sitting-costs-nz-budget-guide', title: 'Pet Sitting Costs in NZ: Budget Guide', tag: 'For Pet Owners' },
              { slug: 'ultimate-guide-pet-sitting-auckland', title: 'Ultimate Guide to Pet Sitting in Auckland', tag: 'Auckland Guide' },
            ].map((post) => (
              <Link key={post.slug} to={`/blog/${post.slug}`} className="group block p-6 bg-card rounded-xl border hover:shadow-lg transition-all">
                <span className="text-xs font-medium text-primary">{post.tag}</span>
                <h3 className="text-lg font-semibold mt-2 group-hover:text-primary transition-colors">{post.title}</h3>
                <span className="text-sm text-muted-foreground mt-2 inline-block">Read more →</span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/blog" className="inline-flex items-center text-primary font-medium hover:underline">
              View all blog posts →
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <TrustSignalsSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Sticky Mobile CTA Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)] px-4 py-3 safe-area-bottom">
        <Button 
          size="lg" 
          className="w-full text-base font-bold py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white rounded-xl min-h-[48px] shadow-lg"
          onClick={() => navigate('/auth?tab=signup')}
        >
          🐾 Sign Up Free — Find a Sitter
        </Button>
      </div>

      {/* Exit Intent Popup */}
      <ExitIntentPopup />

      {/* Onboarding Tour for new visitors */}
      {!user && (
        <OnboardingTour
          steps={[
            { target: '[data-tour="find-sitter"]', title: 'Find a Trusted Sitter', description: 'Browse verified sitters in your area with reviews and daily photo updates.', placement: 'bottom' },
            { target: '[data-tour="become-sitter"]', title: 'Become a Sitter', description: 'Love animals? Earn money as a pet sitter — set your own hours and rates!', placement: 'bottom' },
          ]}
          storageKey="ziggy_visitor_tour_complete"
        />
      )}
    </>
  );
};

export default Index;