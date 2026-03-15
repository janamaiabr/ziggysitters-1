import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import BookingFormDirect from '@/components/booking/BookingFormDirect';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';
import { supabase } from '@/integrations/supabase/client';
import { metaPixel } from '@/lib/metaPixel';
import { useEventTracking } from '@/hooks/useEventTracking';
import { useSearchTracking } from '@/hooks/useSearchTracking';
import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SitterVerificationBadge from '@/components/sitter/SitterVerificationBadge';
import QuickQuestionDialog from '@/components/messaging/QuickQuestionDialog';
import GuestEnquiryDialog from '@/components/messaging/GuestEnquiryDialog';
import FloatingEnquiryButton from '@/components/sitter/FloatingEnquiryButton';
import FAQAccordion from '@/components/sitter/FAQAccordion';
import PublicAvailabilityCalendar from '@/components/calendar/PublicAvailabilityCalendar';
import ReviewsList from '@/components/reviews/ReviewsList';
import { ga4 } from '@/lib/ga4';
import BookingExitSurvey from '@/components/booking/BookingExitSurvey';

import iconMappin from '@/assets/icons/icon-mappin.png';
import iconClock from '@/assets/icons/icon-clock.png';
import iconChat from '@/assets/icons/icon-chat.png';
import iconCalendar from '@/assets/icons/icon-calendar.png';
import iconDollar from '@/assets/icons/icon-dollar.png';
import iconShield from '@/assets/icons/icon-shield.png';
import iconSearch from '@/assets/icons/icon-search.png';
import iconCheck from '@/assets/icons/icon-check.png';
import iconPaw from '@/assets/icons/icon-paw.png';
import iconStar from '@/assets/icons/icon-star.png';
import iconHeart from '@/assets/icons/icon-heart.png';
import iconCamera from '@/assets/icons/icon-camera.png';
import iconHouse from '@/assets/icons/icon-house.png';
import iconBowl from '@/assets/icons/icon-bowl.png';

interface SitterData {
  id: string;
  display_name: string;
  location: string;
  suburb: string;
  city: string;
  rating: number;
  feedback_count: number;
  baseRate: number;
  hourlyRate: number;
  services: string[];
  petTypes: string[];
  avatar: string;
  verified: boolean;
  hasPoliceVet?: boolean;
  bio: string;
  experience: string;
  availability: string[];
  specialties: string[];
  gallery: string[];
  competencyTags: string[];
}

interface Testimonial {
  id: string;
  client_name: string;
  testimonial_text: string;
  rating: number | null;
  client_relationship: string | null;
}

export default function SitterProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { trackEvent } = useEventTracking();
  const { getSearchContext, clearSearchContext } = useSearchTracking();
  const { trackAction } = useBehaviorTracking();
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [sitterData, setSitterData] = useState<SitterData | null>(null);
  const [servicesData, setServicesData] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const buildSearchUrl = () => {
    const context = getSearchContext();
    const params = new URLSearchParams();
    if (context?.location) params.set('location', context.location);
    if (context?.serviceType) params.set('serviceType', context.serviceType);
    if (context?.checkIn) params.set('checkIn', context.checkIn);
    if (context?.checkOut) params.set('checkOut', context.checkOut);
    return params.toString() ? `/find-sitters?${params.toString()}` : '/find-sitters';
  };
  
  const handleBackToSearch = () => {
    clearSearchContext();
    navigate(buildSearchUrl());
  };
  
  const checkInDate = searchParams.get('checkIn');
  const checkOutDate = searchParams.get('checkOut');
  const serviceTypeParam = searchParams.get('serviceType');
  
  useEffect(() => {
    const shouldOpenBooking = searchParams.get('booking') === 'true';
    const shouldOpenInquiry = searchParams.get('inquiry') === 'true';
    
    if (user && profile?.role === 'pet_owner' && sitterData) {
      const timer = setTimeout(() => {
        const bookingSection = document.getElementById('booking-section');
        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
    
    if (shouldOpenBooking && user) {
      metaPixel.trackViewContent('Sitter Profile', 'Pet Sitter');
      setTimeout(() => {
        const bookingSection = document.getElementById('booking-section');
        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else if (shouldOpenBooking && !user) {
      const currentUrl = `/sitter/${id}?${searchParams.toString()}`;
      navigate(`/auth?redirect=${encodeURIComponent(currentUrl)}`);
    }
    
    if (shouldOpenInquiry && user && sitterData) {
      setIsMessageDialogOpen(true);
    }
  }, [searchParams, user, id, navigate, sitterData, profile?.role]);

  useEffect(() => {
    const fetchSitterData = async () => {
      if (!id) return;
      
      try {
        let data = null;
        let goldenBadgeData = null;

        const { data: rpcData, error } = await supabase
          .rpc('get_public_sitter_info', { sitter_id: id });
        
        data = rpcData?.[0] || null;

        if (!data) {
          const { data: viewData, error: viewError } = await supabase
            .from('public_sitters')
            .select('*')
            .eq('id', id)
            .eq('onboarding_completed', true)
            .maybeSingle();
          
          if (viewData && !viewError) data = viewData;
        }
        
        const { data: goldenBadgeResult } = await supabase
          .from('public_sitters')
          .select('golden_badge_approved')
          .eq('id', id)
          .maybeSingle();
        
        goldenBadgeData = goldenBadgeResult;

        if (error && !data) {
          setSitterData(null);
          setLoading(false);
          return;
        }
        
        if (!data) {
          setSitterData(null);
          setLoading(false);
          return;
        }

        // Fetch services, portfolio, testimonials, and service areas in parallel
        const [servicesResult, portfolioResult, testimonialsResult, areasResult] = await Promise.all([
          supabase.from('sitter_services').select('*').eq('sitter_id', id).eq('is_offered', true),
          supabase.storage.from('profile-photos').list(`${id}/portfolio`, { limit: 10, sortBy: { column: 'created_at', order: 'desc' } }),
          supabase.from('sitter_testimonials').select('id, client_name, testimonial_text, rating, client_relationship').eq('sitter_id', id).eq('is_approved', true).limit(3),
          supabase.from('sitter_service_areas').select('suburb, city').eq('sitter_id', id),
        ]);

        setServicesData(servicesResult.data || []);
        setTestimonials(testimonialsResult.data || []);
        setServiceAreas(areasResult.data?.map(a => a.suburb) || []);

        const portfolioUrls = portfolioResult.data?.map(file => {
          const { data: { publicUrl } } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(`${id}/portfolio/${file.name}`);
          return publicUrl;
        }) || [];

        const sData = servicesResult.data || [];
        const serviceNames = sData.map(service => {
          switch (service.service_type) {
            case 'drop_in_visits': return 'Drop-in Visits';
            case 'pet_sitting_owners_home': return 'Pet Sitting (Your Home)';
            case 'pet_sitting_sitters_home': return 'Pet Sitting (Sitter\'s Home)';
            default: return 'Pet Care';
          }
        });

        const rates = sData.map(service => 
          service.hourly_rate || service.daily_rate || service.overnight_rate
        ).filter(Boolean);
        const baseRate = rates.length > 0 ? Math.min(...rates) : null;

        const transformedData: SitterData = {
          id: data.id,
          display_name: `${data.first_name} ${data.last_name.charAt(0)}.`,
          location: `${data.suburb || 'Auckland'}, ${data.city || 'New Zealand'}`,
          suburb: data.suburb || 'Auckland',
          city: data.city || 'New Zealand',
          rating: data.rating || 4.8,
          feedback_count: data.total_reviews || 0,
          baseRate: baseRate!,
          hourlyRate: baseRate!,
          services: serviceNames.length > 0 ? serviceNames : ['Pet Sitting', 'Drop-in Visits'],
          petTypes: sData.length > 0 ? 
            [...new Set(sData.flatMap(s => s.accepted_pet_species || []))].map(species => 
              species.charAt(0).toUpperCase() + species.slice(1)
            ) : ['Dogs', 'Cats'],
          avatar: data.avatar_url,
          verified: data.is_verified,
          hasPoliceVet: !!(goldenBadgeData?.golden_badge_approved),
          bio: data.bio || 'Experienced pet care provider',
          experience: sData.length > 0 ? 
            `${Math.max(...sData.map(s => s.experience_years || 0))} years experience` : 
            'Experienced pet care provider',
          availability: ['Available for bookings'],
          specialties: sData.length > 0 ? 
            sData.flatMap(s => {
              const specs: string[] = [];
              if (s.has_fenced_yard) specs.push('Fenced yard');
              if (s.allows_puppies) specs.push('Puppy care');
              if (s.allows_senior_pets) specs.push('Senior pet care');
              return specs;
            }).slice(0, 3) : ['Pet care specialist'],
          gallery: portfolioUrls.length > 0 ? portfolioUrls : [],
          competencyTags: data.competency_tags || [],
        };

        setSitterData(transformedData);
        
        ga4.viewSitterProfile(id, transformedData.display_name, transformedData.location);
        trackEvent({
          eventType: 'page_view',
          eventName: 'sitter_profile_view',
          eventData: {
            sitter_id: id,
            sitter_name: transformedData.display_name,
            sitter_location: transformedData.location,
            is_verified: transformedData.verified,
            has_golden_badge: transformedData.hasPoliceVet,
            base_rate: transformedData.baseRate,
            services_count: transformedData.services.length,
          }
        });
        metaPixel.trackViewContent(transformedData.display_name, 'Sitter Profile');
      } catch (error) {
        console.error('Error in fetchSitterData:', error);
        setSitterData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSitterData();
  }, [id]);

  const handleCheckAvailability = () => {
    if (!user) {
      const calendarSection = document.querySelector('[data-availability-calendar]');
      if (calendarSection) {
        calendarSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    ga4.clickBook(sitterData!.id, sitterData!.display_name, 'profile_header');
    ga4.startBooking(sitterData!.id, sitterData!.display_name, serviceTypeParam || undefined);
    trackEvent({
      eventType: 'booking',
      eventName: 'booking_dialog_open',
      eventData: { sitter_id: sitterData!.id, sitter_name: sitterData!.display_name, source: 'profile_page' }
    });
    setTimeout(() => {
      const bookingSection = document.getElementById('booking-section');
      if (bookingSection) bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleQuickQuestion = () => {
    ga4.clickMessage(sitterData!.id, sitterData!.display_name, !user);
    setIsMessageDialogOpen(true);
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'pet_sitting_owners_home': return iconHouse;
      case 'pet_sitting_sitters_home': return iconHouse;
      case 'drop_in_visits': return iconBowl;
      default: return iconPaw;
    }
  };

  const getServiceDisplayName = (type: string) => {
    switch (type) {
      case 'pet_sitting_owners_home': return 'Pet Sitting in Your Home';
      case 'pet_sitting_sitters_home': return "Pet Sitting in Sitter's Home";
      case 'drop_in_visits': return 'Drop-in Visits';
      default: return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getServiceDescription = (type: string) => {
    switch (type) {
      case 'pet_sitting_owners_home': return 'Your sitter comes to your home';
      case 'pet_sitting_sitters_home': return "Your pet stays at the sitter's home";
      case 'drop_in_visits': return 'Pop in for feeding, cuddles & playtime';
      default: return 'Professional pet care service';
    }
  };

  const getRate = (service: any) => {
    if (service.hourly_rate) return `NZ$${Number(service.hourly_rate).toFixed(0)}/hr`;
    if (service.daily_rate) return `NZ$${Number(service.daily_rate).toFixed(0)}/day`;
    if (service.overnight_rate) return `NZ$${Number(service.overnight_rate).toFixed(0)}/night`;
    return 'Contact for pricing';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="font-body text-muted-foreground">Loading sitter profile...</p>
        </div>
      </div>
    );
  }
  
  if (!sitterData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 font-display text-foreground">Sitter Not Found</h1>
          <Button onClick={handleBackToSearch} className="font-body">
            <img src={iconSearch} alt="" className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  const firstName = sitterData.display_name.split(' ')[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="bg-secondary">
        <div className="container mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            onClick={handleBackToSearch}
            className="mb-4 font-body text-secondary-foreground/70 hover:text-secondary-foreground hover:bg-secondary-foreground/10"
          >
            <img src={iconSearch} alt="" className="mr-2 h-4 w-4 opacity-70" />
            Back to Search
          </Button>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Large Avatar */}
            <div className="relative flex-shrink-0">
              <Avatar className="h-32 w-32 md:h-40 md:w-40 ring-4 ring-primary/30 shadow-xl">
                <AvatarImage src={sitterData.avatar} className="object-cover" />
                <AvatarFallback className="bg-primary/20 text-primary-foreground text-3xl font-display">
                  {sitterData.display_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <SitterVerificationBadge 
                  isVerified={sitterData.verified || false}
                  hasGoldenBadge={sitterData.hasPoliceVet || false}
                  size="md"
                />
              </div>
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold font-display text-secondary-foreground mb-2">
                {sitterData.display_name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <span className="flex items-center text-secondary-foreground/70 font-body">
                  <img src={iconMappin} alt="" className="w-5 h-5 mr-1.5" />
                  {sitterData.location}
                </span>
                <span className="flex items-center text-secondary-foreground/70 font-body">
                  <img src={iconClock} alt="" className="w-5 h-5 mr-1.5" />
                  Usually responds within 2-4 hours
                </span>
              </div>
              
              {/* Price highlight */}
              {sitterData.baseRate && sitterData.baseRate !== Infinity && (
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-2xl md:text-3xl font-bold text-primary font-display">
                    From NZ${sitterData.baseRate}/day
                  </span>
                  <span className="text-sm text-secondary-foreground/50 font-body">· Free to enquire</span>
                </div>
              )}
              
              {/* Trust pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {sitterData.verified && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 text-sm font-medium text-primary-foreground font-body">
                    <img src={iconCheck} alt="" className="w-4 h-4" /> ID Verified
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 text-sm font-medium text-primary-foreground font-body">
                  <img src={iconCamera} alt="" className="w-4 h-4" /> Daily Photo Updates
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 text-sm font-medium text-primary-foreground font-body">
                  <img src={iconHeart} alt="" className="w-4 h-4" /> Free Meet & Greet
                </span>
              </div>
              
              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                {(profile?.role === 'pet_owner' || !user) && (
                  <>
                    <Button 
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg font-bold font-body text-base px-8"
                      onClick={handleCheckAvailability}
                    >
                      <img src={iconCalendar} alt="" className="mr-2 h-5 w-5" />
                      {user ? 'Check Availability' : 'View Availability'}
                      <span className="ml-2">→</span>
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline-white"
                      className="font-body text-base px-6"
                      onClick={handleQuickQuestion}
                    >
                      <img src={iconChat} alt="" className="mr-2 h-5 w-5" />
                      Quick Question
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Sitter role alert */}
            {profile?.role === 'pet_sitter' && (
              <Alert variant="destructive">
                <img src={iconPaw} alt="" className="h-4 w-4" />
                <AlertDescription className="font-body">
                  Pet sitters cannot book other sitters. Only pet owners can make bookings.
                </AlertDescription>
              </Alert>
            )}

            {/* About — prominent bio section */}
            <Card className="border border-border overflow-hidden">
              <CardHeader className="bg-muted/50 border-b border-border">
                <CardTitle className="flex items-center gap-2 font-display text-foreground">
                  <img src={iconPaw} alt="" className="w-6 h-6" />
                  About {firstName}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-foreground/80 font-body text-base leading-relaxed mb-4">{sitterData.bio}</p>
                
                {/* Experience & specialties inline */}
                <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <img src={iconStar} alt="" className="w-5 h-5" />
                    <span className="text-sm font-medium text-foreground font-body">{sitterData.experience}</span>
                  </div>
                  {[...new Set(sitterData.specialties)].map((specialty, i) => (
                    <Badge key={`${specialty}-${i}`} variant="secondary" className="font-body text-sm">
                      {specialty}
                    </Badge>
                  ))}
                  {sitterData.competencyTags?.map((tag, i) => (
                    <Badge key={`tag-${i}`} variant="outline" className="font-body text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Photo Gallery — prominent if available */}
            {sitterData.gallery.length > 0 && (
              <Card className="border border-border overflow-hidden">
                <CardHeader className="bg-muted/50 border-b border-border">
                  <CardTitle className="flex items-center gap-2 font-display text-foreground">
                    <img src={iconCamera} alt="" className="w-6 h-6" />
                    {firstName}'s Pet Care Photos
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {sitterData.gallery.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`${firstName} caring for pets - photo ${index + 1}`}
                        className="w-full h-40 md:h-48 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        loading="lazy"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Services & Rates — visual cards */}
            <Card className="border border-border overflow-hidden">
              <CardHeader className="bg-muted/50 border-b border-border">
                <CardTitle className="flex items-center gap-2 font-display text-foreground">
                  <img src={iconDollar} alt="" className="w-6 h-6" />
                  Services & Rates
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {servicesData.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {servicesData.map((service) => (
                      <div key={service.id} className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 border border-border">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <img src={getServiceIcon(service.service_type)} alt="" className="w-7 h-7" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold font-body text-foreground text-sm">{getServiceDisplayName(service.service_type)}</div>
                          <div className="text-xs text-muted-foreground font-body mt-0.5">{getServiceDescription(service.service_type)}</div>
                          <div className="text-base font-bold text-primary font-display mt-2">{getRate(service)}</div>
                          {/* Pet info */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {service.accepted_pet_species?.map((species: string) => (
                              <span key={species} className="text-xs bg-accent px-2 py-0.5 rounded-full text-accent-foreground font-body">
                                {species.charAt(0).toUpperCase() + species.slice(1)}s
                              </span>
                            ))}
                            {service.max_pets > 1 && (
                              <span className="text-xs bg-accent px-2 py-0.5 rounded-full text-accent-foreground font-body">
                                Up to {service.max_pets} pets
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground font-body p-4">No services configured yet. Send a message to ask about rates.</p>
                )}
              </CardContent>
            </Card>

            {/* Testimonials */}
            {testimonials.length > 0 && (
              <Card className="border border-border overflow-hidden">
                <CardHeader className="bg-muted/50 border-b border-border">
                  <CardTitle className="flex items-center gap-2 font-display text-foreground">
                    <img src={iconHeart} alt="" className="w-6 h-6" />
                    What Pet Owners Say
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  {testimonials.map((t) => (
                    <div key={t.id} className="border-l-4 border-primary/30 pl-4">
                      <p className="text-foreground/80 font-body italic text-sm leading-relaxed mb-2">
                        "{t.testimonial_text}"
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground font-body">— {t.client_name}</span>
                        {t.rating && (
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: t.rating }).map((_, i) => (
                              <img key={i} src={iconStar} alt="" className="w-3.5 h-3.5" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            
            {/* Booking Form */}
            <div id="booking-section" className="space-y-4">
              <BookingFormDirect
                sitter={{
                  id: sitterData.id,
                  name: sitterData.display_name,
                  location: sitterData.location,
                  hourlyRate: sitterData.hourlyRate,
                  services: sitterData.services,
                  avatar: sitterData.avatar
                }}
                servicesData={servicesData}
                onBookingComplete={() => navigate('/bookings')}
                initialCheckIn={checkInDate || undefined}
                initialCheckOut={checkOutDate || undefined}
                initialServiceType={serviceTypeParam || undefined}
                isGuestPreview={!user}
                onGuestSignup={() => {
                  trackEvent({
                    eventType: 'booking',
                    eventName: 'guest_booking_cta_clicked',
                    eventData: {
                      sitter_id: sitterData.id,
                      sitter_name: sitterData.display_name,
                      source: 'profile_booking_form'
                    }
                  });
                  const params = new URLSearchParams(searchParams);
                  params.set('booking', 'true');
                  const redirectUrl = `/sitter/${id}?${params.toString()}`;
                  navigate(`/auth?tab=signup&redirect=${encodeURIComponent(redirectUrl)}`);
                }}
              />
              
              {/* Quick Question */}
              <Card className="border border-dashed border-primary/30 bg-primary/5">
                <CardContent className="p-5 text-center">
                  <p className="text-sm text-muted-foreground mb-3 font-body">
                    Not ready to book? Just have a question?
                  </p>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full font-body border-primary/30 text-primary hover:bg-primary/10"
                    onClick={handleQuickQuestion}
                  >
                    <img src={iconChat} alt="" className="mr-2 h-5 w-5" />
                    Ask {firstName} a Quick Question
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Reviews */}
            <ReviewsList 
              sitterId={sitterData.id}
              sitterName={sitterData.display_name}
            />

            {/* FAQ */}
            <FAQAccordion 
              sitterName={sitterData.display_name}
              services={sitterData.services}
              hasGoldenBadge={sitterData.hasPoliceVet}
              isVerified={sitterData.verified}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location & Areas */}
            <Card className="border border-border overflow-hidden">
              <CardHeader className="bg-muted/50 border-b border-border py-4">
                <CardTitle className="flex items-center gap-2 text-base font-display text-foreground">
                  <img src={iconMappin} alt="" className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <p className="font-semibold text-foreground font-body mb-1">{sitterData.suburb}</p>
                <p className="text-sm text-muted-foreground font-body mb-4">{sitterData.city}</p>
                {serviceAreas.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 font-body">Also covers</p>
                    <div className="flex flex-wrap gap-1.5">
                      {serviceAreas.filter(a => a !== sitterData.suburb).map((area, i) => (
                        <span key={i} className="text-xs bg-muted px-2.5 py-1 rounded-full text-foreground font-body">{area}</span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Availability Calendar */}
            <Card data-availability-calendar className="border border-border overflow-hidden">
              <CardContent className="pt-4">
                <PublicAvailabilityCalendar 
                  sitterId={sitterData.id}
                  sitterName={sitterData.display_name}
                />
              </CardContent>
            </Card>

            {/* Pets accepted */}
            <Card className="border border-border overflow-hidden">
              <CardHeader className="bg-muted/50 border-b border-border py-4">
                <CardTitle className="flex items-center gap-2 text-base font-display text-foreground">
                  <img src={iconPaw} alt="" className="h-5 w-5" />
                  Pets Accepted
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="flex flex-wrap gap-2">
                  {sitterData.petTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="font-body text-sm px-3 py-1">
                      {type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Verification */}
            <Card className="border border-border overflow-hidden">
              <CardHeader className="bg-muted/50 border-b border-border py-4">
                <CardTitle className="flex items-center gap-2 text-base font-display text-foreground">
                  <img src={iconShield} alt="" className="h-5 w-5" />
                  Trust & Safety
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <img src={iconCheck} alt="" className="w-5 h-5" />
                  <span className="text-sm font-body text-foreground">Identity Verified</span>
                </div>
                <div className="flex items-center gap-3">
                  <img src={iconCheck} alt="" className="w-5 h-5" />
                  <span className="text-sm font-body text-foreground">Profile Complete</span>
                </div>
                <div className="flex items-center gap-3">
                  <img src={iconCamera} alt="" className="w-5 h-5" />
                  <span className="text-sm font-body text-foreground">Daily Photo Updates</span>
                </div>
                <div className="flex items-center gap-3">
                  <img src={iconShield} alt="" className="w-5 h-5" />
                  <span className="text-sm font-body text-foreground">Secure Payments via Stripe</span>
                </div>
                {sitterData.hasPoliceVet && (
                  <div className="flex items-center gap-3">
                    <img src={iconStar} alt="" className="w-5 h-5" />
                    <span className="text-sm font-body text-foreground font-semibold">Police Vet Checked ⭐</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Dialogs */}
      {sitterData && user && (
        <QuickQuestionDialog
          isOpen={isMessageDialogOpen}
          onClose={() => setIsMessageDialogOpen(false)}
          recipientId={sitterData.id}
          recipientName={sitterData.display_name}
          recipientAvatar={sitterData.avatar}
        />
      )}
      
      {sitterData && !user && (
        <GuestEnquiryDialog
          isOpen={isMessageDialogOpen}
          onClose={() => setIsMessageDialogOpen(false)}
          recipientId={sitterData.id}
          recipientName={sitterData.display_name}
          recipientAvatar={sitterData.avatar}
        />
      )}
      
      {/* Floating CTA */}
      {sitterData && (profile?.role === 'pet_owner' || !user) && (
        <FloatingEnquiryButton 
          onEnquiryClick={() => setIsMessageDialogOpen(true)}
          onBookingClick={() => {
            const bookingSection = document.getElementById('booking-section');
            if (bookingSection) {
              bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          sitterName={sitterData.display_name}
          isGuest={!user}
        />
      )}

      {/* Exit survey */}
      {sitterData && (
        <BookingExitSurvey
          sitterId={sitterData.id}
          sitterName={sitterData.display_name}
          isFormVisible={true}
        />
      )}
    </div>
  );
}
