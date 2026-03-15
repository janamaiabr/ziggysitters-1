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
  hasPoliceVet?: boolean;
  
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
  const { trackEvent } = useEventTracking();
  const { getSearchContext, clearSearchContext } = useSearchTracking();
  const { trackAction } = useBehaviorTracking();
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [sitterData, setSitterData] = useState<SitterData | null>(null);
  const [servicesData, setServicesData] = useState<any[]>([]);
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
  
  const initialDates = {
    checkIn: checkInDate || undefined,
    checkOut: checkOutDate || undefined,
    serviceType: serviceTypeParam || undefined,
  };
  
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

        const { data: servicesData } = await supabase
          .from('sitter_services')
          .select('*')
          .eq('sitter_id', id)
          .eq('is_offered', true);

        setServicesData(servicesData || []);

        const { data: portfolioFiles } = await supabase.storage
          .from('profile-photos')
          .list(`${id}/portfolio`, { limit: 10, sortBy: { column: 'created_at', order: 'desc' } });

        const portfolioUrls = portfolioFiles?.map(file => {
          const { data: { publicUrl } } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(`${id}/portfolio/${file.name}`);
          return publicUrl;
        }) || [];

        const serviceNames = servicesData?.map(service => {
          switch (service.service_type) {
            case 'drop_in_visits': return 'Drop-in Visits';
            case 'pet_sitting_owners_home': return 'Pet Sitting (Your Home)';
            case 'pet_sitting_sitters_home': return 'Pet Sitting (Sitter\'s Home)';
            default: return 'Pet Care';
          }
        }) || ['Pet Sitting', 'Drop-in Visits'];

        const rates = servicesData?.map(service => 
          service.hourly_rate || service.daily_rate || service.overnight_rate
        ).filter(Boolean) || [];
        const baseRate = rates.length > 0 ? Math.min(...rates) : null;

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
          hasPoliceVet: !!(goldenBadgeData?.golden_badge_approved),
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <Button 
            variant="outline" 
            onClick={handleBackToSearch}
            className="mb-6 font-body"
          >
            <img src={iconSearch} alt="" className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
          
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-24 w-24 ring-2 ring-border">
              <AvatarImage 
                src={sitterData.avatar} 
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/10 text-primary font-body">
                {sitterData.display_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold font-display text-foreground">{sitterData.display_name}</h1>
                <SitterVerificationBadge 
                  isVerified={sitterData.verified || false}
                  hasGoldenBadge={sitterData.hasPoliceVet || false}
                />
              </div>
              
              <div className="flex items-center text-muted-foreground mb-2 font-body">
                <img src={iconMappin} alt="" className="w-4 h-4 mr-1" />
                {sitterData.location}
              </div>
              
              {/* Prominent price display */}
              {sitterData.baseRate && sitterData.baseRate !== Infinity && (
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl font-bold text-primary font-display">
                    From NZ${sitterData.baseRate}/day
                  </span>
                  <span className="text-sm text-muted-foreground font-body">· Free to enquire</span>
                </div>
              )}
              
              {/* Response time */}
              <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground font-body">
                <img src={iconClock} alt="" className="w-4 h-4" />
                <span>Usually responds within 2-4 hours</span>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {profile?.role === 'pet_owner' && (
                  <>
                    <Button 
                      size="lg"
                      variant="outline"
                      className="font-body"
                      onClick={() => {
                        ga4.clickMessage(sitterData.id, sitterData.display_name, false);
                        setIsMessageDialogOpen(true);
                      }}
                    >
                      <img src={iconChat} alt="" className="mr-2 h-4 w-4" />
                      Quick Question
                    </Button>
                    <Button 
                      size="lg"
                      className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg font-bold font-body"
                      onClick={() => {
                        ga4.clickBook(sitterData.id, sitterData.display_name, 'profile_header');
                        ga4.startBooking(sitterData.id, sitterData.display_name, serviceTypeParam || undefined);
                        trackEvent({
                          eventType: 'booking',
                          eventName: 'booking_dialog_open',
                          eventData: {
                            sitter_id: sitterData.id,
                            sitter_name: sitterData.display_name,
                            source: 'profile_page'
                          }
                        });
                        setTimeout(() => {
                          const bookingSection = document.getElementById('booking-section');
                          if (bookingSection) {
                            bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }, 100);
                      }}
                    >
                      <img src={iconCalendar} alt="" className="mr-2 h-4 w-4" />
                      Check Availability
                      <span className="ml-2">→</span>
                    </Button>
                  </>
                )}
                {!user && (
                  <>
                    <Button 
                      size="lg"
                      variant="outline"
                      className="font-body"
                      onClick={() => {
                        ga4.clickMessage(sitterData.id, sitterData.display_name, true);
                        setIsMessageDialogOpen(true);
                      }}
                    >
                      <img src={iconChat} alt="" className="mr-2 h-4 w-4" />
                      Quick Question
                    </Button>
                    <Button 
                      size="lg"
                      className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg font-bold font-body"
                      onClick={() => {
                        ga4.clickBook(sitterData.id, sitterData.display_name, 'guest_profile_header');
                        const calendarSection = document.querySelector('[data-availability-calendar]');
                        if (calendarSection) {
                          calendarSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                        trackEvent({
                          eventType: 'booking',
                          eventName: 'guest_check_availability_clicked',
                          eventData: {
                            sitter_id: sitterData.id,
                            sitter_name: sitterData.display_name,
                            source: 'profile_header'
                          }
                        });
                      }}
                    >
                      <img src={iconCalendar} alt="" className="mr-2 h-4 w-4" />
                      View Availability
                      <span className="ml-2">→</span>
                    </Button>
                  </>
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
            {/* Sitter role alert */}
            {profile?.role === 'pet_sitter' && (
              <Alert variant="destructive">
                <img src={iconPaw} alt="" className="h-4 w-4" />
                <AlertDescription className="font-body">
                  Pet sitters cannot book other sitters. Only pet owners can make bookings.
                </AlertDescription>
              </Alert>
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
              <Card className="border border-dashed border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-3 font-body">
                    Not ready to book? Just have a question?
                  </p>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full font-body"
                    onClick={() => setIsMessageDialogOpen(true)}
                  >
                    <img src={iconChat} alt="" className="mr-2 h-4 w-4" />
                    Ask {sitterData.display_name.split(' ')[0]} a Quick Question
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* About */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="font-display text-foreground">About {sitterData.display_name.split(' ')[0]}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-body">{sitterData.bio}</p>
              </CardContent>
            </Card>

            {/* Services & Rates */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="font-display text-foreground">Services & Rates</CardTitle>
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
                        case 'drop_in_visits': return 'Pop in for feeding, cuddles & playtime';
                        default: return 'Professional pet care service';
                      }
                    };

                    const getRate = (service: any) => {
                      if (service.hourly_rate) return `NZ$${Number(service.hourly_rate).toFixed(2)}/hour`;
                      if (service.daily_rate) return `NZ$${Number(service.daily_rate).toFixed(2)}/day`;
                      if (service.overnight_rate) return `NZ$${Number(service.overnight_rate).toFixed(2)}/night`;
                      return 'Contact for pricing';
                    };

                    return (
                      <div key={service.id} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium font-body text-foreground">{getServiceDisplayName(service.service_type)}</div>
                          <div className="text-xs text-muted-foreground font-body">
                            {getServiceDescription(service.service_type)}
                          </div>
                        </div>
                        <div className="text-right font-semibold font-body text-foreground">{getRate(service)}</div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground font-body">No services configured yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Experience & Specialties */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="font-display text-foreground">Experience & Specialties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 font-body text-foreground">Experience</h4>
                  <p className="text-muted-foreground font-body">{sitterData.experience} of professional pet care</p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2 font-body text-foreground">Specialities</h4>
                  <div className="flex flex-wrap gap-2">
                    {[...new Set(sitterData.specialties)].map((specialty, index) => (
                      <Badge key={`${specialty}-${index}`} variant="outline" className="font-body">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2 font-body text-foreground">Pet Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {sitterData.petTypes.map((type) => (
                      <Badge key={type} variant="secondary" className="font-body">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Photo Gallery */}
            {sitterData.gallery.length > 0 && (
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="font-display text-foreground">Photos</CardTitle>
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
            {/* Starting Rate */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center font-display text-foreground">
                  <img src={iconDollar} alt="" className="mr-2 h-5 w-5" />
                  Starting Rate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold font-display text-foreground">
                    {sitterData.baseRate && sitterData.baseRate !== Infinity ? `From NZ$${sitterData.baseRate}` : 'Contact for pricing'}
                  </div>
                  <div className="text-sm text-muted-foreground font-body">
                    Per service (varies by type)
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Availability Calendar */}
            <Card data-availability-calendar className="border border-border">
              <CardContent className="pt-4">
                <PublicAvailabilityCalendar 
                  sitterId={sitterData.id}
                  sitterName={sitterData.display_name}
                />
              </CardContent>
            </Card>

            {/* Verification */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-sm md:text-base font-display text-foreground">
                  <img src={iconShield} alt="" className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  <span className="truncate">Verification</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-body text-foreground">Identity Verified</span>
                  <Badge variant="secondary" className="font-body">
                    <img src={iconCheck} alt="" className="w-3 h-3 mr-1" />
                    Yes
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-body text-foreground">Profile Verified</span>
                  <Badge variant="secondary" className="font-body">
                    <img src={iconCheck} alt="" className="w-3 h-3 mr-1" />
                    Yes
                  </Badge>
                </div>
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
