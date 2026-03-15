import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, CheckCircle, Camera, Shield, Clock, DollarSign, Search, Heart, Mail, Users, Star, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import EnhancedSitterCard from '@/components/search/EnhancedSitterCard';
import StripeLiveModeWarning from '@/components/sitter/StripeLiveModeWarning';
import HeroSectionPlayful from '@/components/home/HeroSectionPlayful';
import iconPaw from '@/assets/icons/icon-paw.png';
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

  // Track home page view
  useEffect(() => {
    trackAction('home_page_viewed', {
      is_authenticated: !!user,
      user_role: profile?.role || 'anonymous',
      has_completed_onboarding: profile?.onboarding_completed || false,
    });
  }, [user, profile]);

  // Real data from database
  const [featuredSitters, setFeaturedSitters] = useState([]);
  const [platformStats, setPlatformStats] = useState({ sitters: 0, owners: 0, bookings: 0 });

  useEffect(() => {
    const fetchSitters = async () => {
      const { data, error } = await supabase
        .from('public_sitters')
        .select('*')
        .eq('onboarding_completed', true)
        .not('avatar_url', 'is', null)
        .neq('avatar_url', '')
        .order('golden_badge_approved', { ascending: false })
        .order('rating', { ascending: false })
        .limit(6);
      
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

    // Fetch real platform stats
    const fetchStats = async () => {
      const [sittersResult, ownersResult, bookingsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'sitter').eq('onboarding_completed', true),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'owner'),
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
    "description": "Professional pet sitting services in Auckland and Hamilton with optional daily photo updates and detailed reports.",
    "url": "https://ziggysitters.com",
    "email": "hello@ziggysitters.com",
    "address": { "@type": "PostalAddress", "addressLocality": "Auckland", "addressCountry": "New Zealand" },
    "areaServed": ["Auckland, New Zealand", "Hamilton, New Zealand"],
    "serviceType": ["Pet Sitting", "Pet Care", "Daily Reports", "Drop-in Visits"],
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
        
        {/* Hero */}
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

        {/* Platform Stats — Real marketplace proof */}
        {(platformStats.sitters > 0 || platformStats.owners > 0) && (
          <section className="py-8 md:py-14 bg-secondary">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-3 gap-4 md:gap-8 text-center">
                  <div>
                    <div className="text-2xl md:text-4xl font-bold text-secondary-foreground font-display">
                      {platformStats.sitters}+
                    </div>
                    <p className="text-xs md:text-sm text-secondary-foreground/60 font-body mt-1">Verified Sitters</p>
                  </div>
                  <div>
                    <div className="text-2xl md:text-4xl font-bold text-secondary-foreground font-display">
                      {platformStats.owners}+
                    </div>
                    <p className="text-xs md:text-sm text-secondary-foreground/60 font-body mt-1">Pet Owners</p>
                  </div>
                  <div>
                    <div className="text-2xl md:text-4xl font-bold text-secondary-foreground font-display">
                      {platformStats.bookings}+
                    </div>
                    <p className="text-xs md:text-sm text-secondary-foreground/60 font-body mt-1">Bookings Made</p>
                  </div>
                </div>
                <p className="text-center text-xs md:text-sm text-secondary-foreground/40 mt-4 font-body">
                  A real community of pet owners and sitters across AU & NZ
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Featured Sitters — Real photos from actual sitters */}
        <section className="py-10 md:py-24 relative overflow-hidden bg-muted border-y border-border">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-6 md:mb-16">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">Real People, Real Profiles</p>
              <h2 className="text-2xl md:text-5xl font-bold mb-2 md:mb-4 text-foreground font-display">
                Meet Our Sitters
              </h2>
              <p className="text-sm md:text-xl text-muted-foreground max-w-2xl mx-auto font-body">
                Every photo is real. Every sitter is local and ID verified. Browse their profiles and book with confidence.
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
                <Search className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                {isMobile ? 'See All Sitters' : 'Browse All Sitters Near You'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-xs md:text-sm text-muted-foreground font-body">
                Free to browse · ID Verified · Daily Photo Updates
              </p>
            </div>
          </div>
        </section>

        {/* Trust Guarantees */}
        <section className="py-8 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            <TrustGuarantees />
          </div>
        </section>

        {/* How It Works */}
        <HowItWorksSection />

        {/* Daily Reports Section */}
        <section className="py-8 md:py-20 bg-accent">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
                <div className="space-y-4 md:space-y-6">
                  <div className="inline-flex items-center bg-primary text-primary-foreground px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium font-body">
                    <Camera className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                    Industry First Feature
                  </div>
                  
                  <h2 className="text-2xl md:text-4xl font-bold text-foreground font-display">
                    Watch the Bond Grow, Update by Update
                  </h2>
                  
                  <p className="text-sm md:text-lg text-muted-foreground leading-relaxed font-body">
                    96% report compliance rate, with updates sent 2x per day. Sitter payment is tied to delivery — the platform monitors every booking automatically.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {[
                      { Icon: CheckCircle, title: 'Daily Photos', desc: "See your pet's day" },
                      { Icon: Clock, title: 'Care Notes', desc: 'Food, mood & health' },
                      { Icon: DollarSign, title: 'Pay Guarantee', desc: 'Tied to report quality' },
                      { Icon: Shield, title: 'Peace of Mind', desc: 'Never worry again' },
                    ].map((item) => (
                      <div key={item.title} className="flex items-start space-x-2 md:space-x-3">
                        <div className="w-7 h-7 md:w-8 md:h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <item.Icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
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
                      <Camera className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                      Learn More About Daily Reports
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4 md:space-y-6">
                  <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border border-border">
                    <div className="text-center mb-4 md:mb-6">
                      <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1 md:mb-2 font-body">Sample Daily Report</h3>
                      <p className="text-xs md:text-sm text-muted-foreground font-body">What you'll receive every day</p>
                    </div>
                    
                    <div className="space-y-3 md:space-y-4">
                      {[
                        { label: 'Morning Walk', value: '45 minutes' },
                        { label: 'Feeding Time', value: 'Ate well' },
                        { label: 'Playtime', value: 'Very active' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between p-2.5 md:p-3 bg-muted rounded-lg border border-border">
                          <span className="text-sm font-medium text-foreground font-body">{item.label}</span>
                          <span className="text-xs text-primary font-body">✓ {item.value}</span>
                        </div>
                      ))}
                      
                      <div className="grid grid-cols-3 gap-2 mt-3 md:mt-4">
                        {['photo-1587300003388-59208cc962cb', 'photo-1561037404-61cd46aa615b', 'photo-1544568100-847a948585b9'].map((id, i) => (
                          <div key={i} className="rounded-lg h-24 md:h-16 overflow-hidden">
                            <img src={`https://images.unsplash.com/${id}?w=200&h=200&fit=crop`} alt={`Pet photo ${i+1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                      
                      <p className="text-xs text-muted-foreground text-center italic font-body">
                        "Max had a wonderful day! Very playful and ate all his food."
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="bg-card rounded-xl p-3 md:p-4 text-center border border-border">
                      <div className="text-xl md:text-2xl font-bold text-primary font-display">96%</div>
                      <div className="text-xs md:text-sm text-muted-foreground font-body">Report Compliance</div>
                    </div>
                    <div className="bg-card rounded-xl p-3 md:p-4 text-center border border-border">
                      <div className="text-xl md:text-2xl font-bold text-primary font-display">2x/day</div>
                      <div className="text-xs md:text-sm text-muted-foreground font-body">Updates Delivered</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* For Sitters CTA */}
        <section className="py-12 md:py-20 bg-background border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 md:gap-10 items-center">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                <img 
                  src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop" 
                  alt="Pet sitter with dog"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="bg-card/95 backdrop-blur-sm rounded-lg px-3 py-2 border border-border">
                    <p className="text-sm font-semibold text-foreground font-body">Join {platformStats.sitters}+ sitters</p>
                    <p className="text-xs text-muted-foreground font-body">earning doing what they love</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4 md:space-y-6">
                <p className="text-sm font-semibold text-primary uppercase tracking-widest font-body">For Pet Sitters</p>
                <h2 className="text-2xl md:text-4xl font-bold text-foreground font-display">
                  Love Pets? Earn Extra Cash
                </h2>
                <p className="text-sm md:text-lg text-muted-foreground font-body leading-relaxed">
                  Set your own rates, choose your hours, and get paid to care for pets in your neighbourhood. 
                  We handle payments, booking management, and marketing — you just focus on the animals.
                </p>
                <div className="space-y-2">
                  {[
                    'Set your own rates and availability',
                    'Secure payments via Stripe',
                    'Free to join — no upfront costs',
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm text-foreground font-body">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
                <Button 
                  size="lg" 
                  onClick={() => navigate('/become-sitter')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 min-h-[48px] font-body"
                >
                  Become a Sitter <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Charity Section */}
        <section className="py-8 md:py-20 bg-muted border-t border-border">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <div className="mb-4 md:mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full mb-3 md:mb-4">
                  <img src={iconPaw} alt="" className="w-7 h-7 md:w-9 md:h-9" />
                </div>
                <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4 font-display text-foreground">
                  Making a Difference Together
                </h2>
                <p className="text-sm md:text-lg text-muted-foreground font-body">
                  Every booking helps pets in need across New Zealand.
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-4 md:p-8 shadow-sm">
                <div className="flex items-center justify-center gap-3 mb-3 md:mb-4">
                  <span className="text-3xl md:text-4xl font-bold text-primary font-display">5%</span>
                  <div className="text-left">
                    <p className="font-semibold text-sm md:text-base font-body text-foreground">of our profits</p>
                    <p className="text-xs md:text-sm text-muted-foreground font-body">goes to SPCA NZ</p>
                  </div>
                </div>
                
                <div className="hidden md:block">
                  <h3 className="text-xl font-semibold mb-3 font-body text-foreground">SPCA New Zealand</h3>
                  <p className="text-muted-foreground mb-6 font-body">
                    Your bookings help us support the SPCA's vital work in animal rescue, providing medical care for abandoned pets, 
                    and funding spay/neuter programs across New Zealand.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-8 md:py-20 overflow-hidden bg-background">
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-xl mx-auto">
              <h2 className="text-xl md:text-4xl font-bold mb-3 md:mb-6 text-foreground font-display">
                Ready to Find Your Pet{"'"}s Person?
              </h2>
              <p className="text-sm md:text-xl mb-4 md:mb-6 text-muted-foreground font-body">
                Join {platformStats.owners}+ pet owners who trust ZiggySitters for their furry family members.
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
                  className="h-12 text-base font-body"
                />
                <Button type="submit" size="lg" className="px-6 md:px-8 shadow-lg hover:shadow-xl transition-all min-h-[48px] whitespace-nowrap font-body">
                  Get Started Free
                </Button>
              </form>
              <p className="text-xs md:text-sm text-muted-foreground font-body">
                Free to join · No payment until you book · Cancel anytime
              </p>
              <div className="mt-4">
                <Button variant="ghost" size="sm" className="text-muted-foreground font-body" onClick={() => navigate('/find-sitters')}>
                  Or browse sitters first →
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Blog Section */}
      <section className="py-12 md:py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-8 md:mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">Blog</p>
            <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 font-display text-foreground">Pet Care Tips & Guides</h2>
            <p className="text-muted-foreground text-sm md:text-lg font-body">Expert advice to help you provide the best care for your pets</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {[
              { slug: 'how-to-choose-pet-sitter-nz-buyer-guide', title: 'How to Choose a Pet Sitter in NZ', tag: 'For Pet Owners' },
              { slug: 'pet-sitting-costs-nz-budget-guide', title: 'Pet Sitting Costs in NZ: Budget Guide', tag: 'For Pet Owners' },
              { slug: 'ultimate-guide-pet-sitting-auckland', title: 'Ultimate Guide to Pet Sitting in Auckland', tag: 'Auckland Guide' },
            ].map((post) => (
              <Link key={post.slug} to={`/blog/${post.slug}`} className="group block p-6 bg-card rounded-xl border border-border hover:shadow-lg transition-all">
                <span className="text-xs font-medium text-primary font-body">{post.tag}</span>
                <h3 className="text-lg font-semibold mt-2 group-hover:text-primary transition-colors font-body text-foreground">{post.title}</h3>
                <span className="text-sm text-muted-foreground mt-2 inline-block font-body">Read more →</span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/blog" className="inline-flex items-center text-primary font-medium hover:underline font-body">
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)] px-4 py-3 safe-area-bottom">
        <Button 
          size="lg" 
          className="w-full text-base font-bold py-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl min-h-[48px] shadow-lg font-body"
          onClick={() => navigate('/auth?tab=signup')}
        >
          Sign Up Free — Find a Sitter
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
