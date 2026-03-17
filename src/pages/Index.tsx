import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import EnhancedSitterCard from '@/components/search/EnhancedSitterCard';
import StripeLiveModeWarning from '@/components/sitter/StripeLiveModeWarning';
import HeroSectionPlayful from '@/components/home/HeroSectionPlayful';
import sitterCtaImg from '@/assets/home/sitter-cta.jpg';
import dailyReportScreenshot from '@/assets/home/daily-report-screenshot.jpg';
import iconCheck from '@/assets/icons/icon-check.png';
import iconCamera from '@/assets/icons/icon-camera.png';
import iconSearch from '@/assets/icons/icon-search.png';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import TrustGuarantees from '@/components/home/TrustGuarantees';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import ExitIntentPopup from '@/components/home/ExitIntentPopup';
import GeoLocationBanner from '@/components/home/GeoLocationBanner';
import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';
import OnboardingTour from '@/components/onboarding/OnboardingTour';
import EasterBanner from '@/components/home/EasterBanner';
import { useProfile } from '@/contexts/ProfileContext';
import { useSearchTracking } from '@/hooks/useSearchTracking';

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

  useEffect(() => {
    trackAction('home_page_viewed', {
      is_authenticated: !!user,
      user_role: profile?.role || 'anonymous',
      has_completed_onboarding: profile?.onboarding_completed || false,
    });
  }, [user, profile]);

  const [featuredSitters, setFeaturedSitters] = useState([]);
  const [platformStats, setPlatformStats] = useState({ sitters: 0, owners: 0, bookings: 0 });

  useEffect(() => {
    const fetchSitters = async () => {
      const { data: vettedData } = await supabase
        .from('public_sitters')
        .select('*')
        .eq('onboarding_completed', true)
        .eq('is_verified', true)
        .not('avatar_url', 'is', null)
        .neq('avatar_url', '')
        .order('golden_badge_approved', { ascending: false })
        .order('rating', { ascending: false })
        .limit(6);

      let data = vettedData || [];

      if (data.length < 6) {
        const vettedIds = data.map(s => s.id);
        const { data: extraData } = await supabase
          .from('public_sitters')
          .select('*')
          .eq('onboarding_completed', true)
          .not('avatar_url', 'is', null)
          .neq('avatar_url', '')
          .order('rating', { ascending: false })
          .limit(6 - data.length);
        
        if (extraData) {
          data = [...data, ...extraData.filter(s => !vettedIds.includes(s.id))].slice(0, 6);
        }
      }
      
      if (data && data.length > 0) {
        const sitterIds = data.map(s => s.id);
        
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
            baseRate,
            bio: sitter.bio || 'Experienced pet care provider',
            image: sitter.avatar_url,
            services: sitterServices.map(s => serviceTypeLabels[s.service_type] || s.service_type),
            verified: sitter.is_verified || false,
            golden_badge: policeVetMap.get(sitter.id) || false,
            sitterServices,
          };
        }));
      }
    };

    const fetchStats = async () => {
      const [sittersResult, ownersResult, bookingsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'pet_sitter').eq('onboarding_completed', true),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'pet_owner'),
        supabase.from('bookings').select('id', { count: 'exact', head: true }),
      ]);
      setPlatformStats({
        sitters: sittersResult.count || 0,
        owners: ownersResult.count || 0,
        bookings: bookingsResult.count || 0,
      });
    };

    fetchSitters();
    fetchStats();
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "ZiggySitters",
    "description": "Professional pet sitting services in New Zealand and Australia's Sunshine Coast with optional daily photo updates and detailed reports.",
    "url": "https://ziggysitters.com",
    "email": "hello@ziggysitters.com",
    "address": [
      { "@type": "PostalAddress", "addressLocality": "Auckland", "addressCountry": "New Zealand" },
      { "@type": "PostalAddress", "addressLocality": "Sunshine Coast", "addressRegion": "QLD", "addressCountry": "Australia" },
    ],
    "areaServed": ["Auckland, New Zealand", "Hamilton, New Zealand", "Sunshine Coast, Queensland, Australia"],
    "serviceType": ["Pet Sitting", "Pet Care", "Daily Reports", "Drop-in Visits", "Senior Pet Care"],
  };

  return (
    <>
      <SEOHead 
        title="ZiggySitters - Pet Sitters with Optional Daily Photo Updates | Auckland & Hamilton"
        description="Find trusted pet sitters in Auckland and Hamilton who can send daily photo updates when you request them. Book verified pet care today."
        keywords="pet sitters Auckland, pet sitters Hamilton, daily pet reports, pet sitting with photos, verified pet care, cat sitting"
        canonical="/"
        structuredData={structuredData}
      />
      <EasterBanner />

      <div className="bg-background">
        <GeoLocationBanner />

        {user && (
          <div className="container mx-auto px-4 pt-6">
            <StripeLiveModeWarning />
          </div>
        )}
        
        {/* 1. Hero */}
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

        {/* 2. Featured Sitters */}
        <section className="py-10 md:py-24 relative overflow-hidden bg-muted border-y border-border">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-6 md:mb-16">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">Real People, Real Profiles</p>
              <h2 className="text-2xl md:text-5xl font-bold mb-2 md:mb-4 text-foreground font-display">
                Meet Our Sitters
              </h2>
              <p className="text-sm md:text-xl text-muted-foreground max-w-2xl mx-auto font-body">
                Affordable, vetted locals who genuinely love pets. Browse real profiles and book with confidence.
              </p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 max-w-6xl mx-auto">
              {(isMobile ? featuredSitters.slice(0, 4) : featuredSitters).map((sitter) => (
                <EnhancedSitterCard
                  key={sitter.id}
                  sitter={sitter}
                  onViewProfile={() => navigate(`/sitter/${sitter.id}?booking=true`)}
                  onSitterClick={(id, name) => trackSitterClick(id, name)}
                />
              ))}
            </div>
            
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
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-6 md:px-10 py-5 md:py-7 text-base md:text-lg font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 min-h-[48px] font-body"
              >
                <img src={iconSearch} alt="" className="w-5 h-5 mr-2" />
                {isMobile ? 'See All Sitters' : 'Browse All Sitters Near You'}
                <span className="ml-2">→</span>
              </Button>
              <p className="text-xs md:text-sm text-muted-foreground font-body">
                Free to browse · ID Vetted · Daily Photo Updates
              </p>
            </div>
          </div>
        </section>

        {/* 3. Trust Guarantees */}
        <section className="py-8 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            <TrustGuarantees />
          </div>
        </section>

        {/* 4. How It Works */}
        <HowItWorksSection />

        {/* 5. Daily Reports — with product screenshot */}
        <section className="py-8 md:py-20 bg-accent">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
                <div className="space-y-4 md:space-y-6">
                  <div className="inline-flex items-center bg-primary text-primary-foreground px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium font-body">
                    <img src={iconCamera} alt="" className="w-5 h-5 mr-1.5 md:mr-2" />
                    Daily Photo Updates
                  </div>
                  
                  <h2 className="text-2xl md:text-4xl font-bold text-foreground font-display">
                    See How Your Pet's Day Went
                  </h2>
                  
                  <p className="text-sm md:text-lg text-muted-foreground leading-relaxed font-body">
                    When you request daily updates, your sitter sends photos and notes about meals, walks, mood, and more. You'll never have to wonder how your pet is doing.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {[
                      { icon: iconCamera, title: 'Daily Photos', desc: "See your pet's day" },
                      { icon: iconCheck, title: 'Care Notes', desc: 'Food, mood & health' },
                      { icon: iconCheck, title: 'Your Choice', desc: 'Opt-in when booking' },
                      { icon: iconCheck, title: 'Peace of Mind', desc: 'Never worry again' },
                    ].map((item) => (
                      <div key={item.title} className="flex items-start space-x-2 md:space-x-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <img src={item.icon} alt="" className="w-6 h-6 md:w-7 md:h-7" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground text-sm md:text-base font-body">{item.title}</h4>
                          <p className="text-xs md:text-sm text-muted-foreground font-body">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-2 md:pt-4">
                    <Button 
                      size="lg" 
                      onClick={() => navigate('/daily-reports-info')}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 md:px-8 min-h-[44px] font-body"
                    >
                      <img src={iconCamera} alt="" className="mr-2 h-5 w-5" />
                      Learn More About Daily Reports
                    </Button>
                  </div>
                </div>
                
                {/* Product screenshot instead of fake mock */}
                <div className="flex justify-center">
                  <div className="relative max-w-[320px] md:max-w-[380px]">
                    <img 
                      src={dailyReportScreenshot} 
                      alt="ZiggySitters daily report showing pet photos, meal notes, and activity updates"
                      className="w-full rounded-2xl shadow-2xl border border-border"
                      loading="lazy"
                    />
                    <div className="absolute -bottom-3 -right-3 bg-card rounded-lg px-3 py-2 shadow-lg border border-border">
                      <p className="text-xs font-semibold text-foreground font-body">Real app screenshot</p>
                      <p className="text-[10px] text-muted-foreground font-body">What owners actually receive</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. For Sitters CTA */}
        <section className="py-12 md:py-20 bg-background border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 md:gap-10 items-center">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                <img 
                  src={sitterCtaImg}
                  alt="Pet sitter playing with puppy"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="bg-card/95 backdrop-blur-sm rounded-lg px-3 py-2 border border-border">
                    <p className="text-sm font-semibold text-foreground font-body">Earn doing what you love</p>
                    <p className="text-xs text-muted-foreground font-body">Set your own rates & hours</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4 md:space-y-6">
                <p className="text-sm font-semibold text-primary uppercase tracking-widest font-body">For Pet Sitters</p>
                <h2 className="text-2xl md:text-4xl font-bold text-foreground font-display">
                  Love Dogs? Earn Extra Cash Doing What You Love
                </h2>
                <p className="text-sm md:text-lg text-muted-foreground font-body leading-relaxed">
                  Turn your love for animals into income. Set your own rates, choose your hours, and get paid to care for pets in your neighbourhood. 
                  No upfront costs — we handle payments, bookings, and finding you clients.
                </p>
                <div className="space-y-2">
                  {[
                    'Set your own rates and availability',
                    'Secure payments via Stripe',
                    'Free to join — no upfront costs',
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm text-foreground font-body">
                      <img src={iconCheck} alt="" className="w-5 h-5 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
                <Button 
                  size="lg" 
                  onClick={() => navigate('/become-sitter')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 min-h-[48px] font-body"
                >
                  Become a Sitter <span className="ml-2">→</span>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Testimonials */}
        <TestimonialsSection />

        {/* 8. Final CTA — single clear action */}
        <section className="relative py-8 md:py-20 overflow-hidden bg-secondary">
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-xl mx-auto">
              <h2 className="text-xl md:text-4xl font-bold mb-3 md:mb-6 text-secondary-foreground font-display">
                Ready to Find Your Pet{"'"}s Person?
              </h2>
              <p className="text-sm md:text-xl mb-4 md:mb-6 text-secondary-foreground/70 font-body">
                Book a local, verified sitter. Get daily photo updates. Simple.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/find-sitters')}
                  className="px-8 shadow-lg hover:shadow-xl transition-all min-h-[48px] font-body bg-primary text-primary-foreground hover:bg-primary/90 text-lg"
                >
                  Find a Sitter <span className="ml-2">→</span>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline-white"
                  onClick={() => navigate('/become-sitter')}
                  className="px-8 min-h-[48px] font-body text-lg"
                >
                  Become a Sitter
                </Button>
              </div>
              <p className="text-xs md:text-sm text-secondary-foreground/50 mt-4 font-body">
                Free to join · No payment until you book · Cancel anytime
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky Mobile CTA Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)] px-4 py-3 safe-area-bottom">
        <Button 
          size="lg" 
          className="w-full text-base font-bold py-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl min-h-[48px] shadow-lg font-body"
          onClick={() => navigate('/find-sitters')}
        >
          Find a Sitter Near Me
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
