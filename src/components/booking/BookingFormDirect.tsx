import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInHours, differenceInDays } from 'date-fns';
import { Shield, CheckCircle, Zap, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';
import { ga4 } from '@/lib/ga4';
interface BookingFormDirectProps {
  sitter: {
    id: string;
    name: string;
    location: string;
    hourlyRate: number;
    services: string[];
    avatar: string;
  };
  servicesData?: any[];
  onBookingComplete?: () => void;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialServiceType?: string;
  isGuestPreview?: boolean;
  onGuestSignup?: () => void;
}

export default function BookingFormDirect({ 
  sitter, 
  servicesData = [], 
  onBookingComplete,
  initialCheckIn,
  initialCheckOut,
  initialServiceType,
  isGuestPreview = false,
  onGuestSignup
}: BookingFormDirectProps) {
  // Pre-fill dates: today and tomorrow if not provided
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Format date for input[type=date]
  const formatDateForInput = (d: Date) => d.toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialCheckIn ? new Date(initialCheckIn) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialCheckOut ? new Date(initialCheckOut) : undefined
  );
  // Hidden defaults for simplified form
  const [startTime] = useState('09:00');
  const [endTime] = useState('17:00');
  const [serviceType, setServiceType] = useState(initialServiceType || '');
  const [messageToSitter, setMessageToSitter] = useState('');
  // Auto-defaults (hidden from user)
  const requiresDailyReports = true;
  const [loading, setLoading] = useState(false);
  const repeatAcrossDays = false;
  const [ownerPets, setOwnerPets] = useState<any[]>([]);
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { trackAction, trackDropoff } = useBehaviorTracking();
  
  // Auto-select first service if available and not already set
  useEffect(() => {
    if (!serviceType && servicesData.length > 0) {
      setServiceType(servicesData[0].service_type);
    }
  }, [servicesData, serviceType]);
  
  // Track when form is viewed (for both guests and logged-in users)
  useEffect(() => {
    // GA4 conversion event: start_booking
    ga4.startBooking(sitter.id, sitter.name, initialServiceType || serviceType);
    trackAction('booking_form_viewed', {
      sitter_id: sitter.id,
      sitter_name: sitter.name,
      has_initial_dates: !!(initialCheckIn && initialCheckOut),
      has_initial_service: !!initialServiceType,
      is_guest: isGuestPreview,
    });
  }, []);

  // Fetch owner's pets when component mounts
  useEffect(() => {
    const fetchOwnerPets = async () => {
      if (!user) return;

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('user_id', user.id)
          .single();

        if (!profile) return;
        
        if (profile.role === 'pet_sitter') {
          return;
        }

        const { data: pets, error } = await supabase
          .from('pets')
          .select('id, name, species, breed')
          .eq('owner_id', profile.id);

        if (error) throw error;

        setOwnerPets(pets || []);
        if (pets && pets.length > 0) {
          setSelectedPetIds(pets.map(p => p.id));
        }
      } catch (error) {
        console.error('Error fetching pets:', error);
      }
    };

    fetchOwnerPets();
  }, [user]);

  const handleDateChange = (value: string, type: 'start' | 'end') => {
    const date = value ? new Date(value + 'T00:00:00') : undefined;
    if (type === 'start') {
      setStartDate(date);
      if (date && endDate && endDate < date) {
        setEndDate(undefined);
      }
    } else {
      setEndDate(date);
    }
    
    if (date) {
      trackAction('booking_date_selected', {
        sitter_id: sitter.id,
        date_type: type,
        date: format(date, 'yyyy-MM-dd'),
      });
    }
  };

  const calculateTotal = () => {
    const realService = servicesData.find(s => s.service_type === serviceType);
    
    if (realService) {
      // Per-pet pricing: multiply by number of pets (minimum 1)
      const petCount = Math.max(1, selectedPetIds.length);
      
      if (realService.hourly_rate && startTime && endTime) {
        if (!startDate || !endDate) return 0;
        const startDateTime = new Date(startDate);
        startDateTime.setHours(parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1]));
        
        const endDateTime = new Date(endDate);
        endDateTime.setHours(parseInt(endTime.split(':')[0]), parseInt(endTime.split(':')[1]));
        
        const hours = Math.max(1, differenceInHours(endDateTime, startDateTime));
        return hours * realService.hourly_rate;
      }
      
      if (realService.daily_rate || realService.overnight_rate) {
        if (!startDate || !endDate) return 0;
        const rate = realService.daily_rate || realService.overnight_rate;
        const totalDays = Math.max(1, differenceInDays(endDate, startDate) + 1);
        return totalDays * rate * petCount;
      }
    }
    
    return 0;
  };

  const handleBooking = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!startDate || !endDate || !serviceType) {
      trackDropoff('booking', 'validation_failed', {
        sitter_id: sitter.id,
        reason: 'missing_fields',
      });
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    // Terms are auto-agreed by submitting

    // Pet selection is now optional - users can add pet details later

    setLoading(true);
    
    trackAction('booking_submit_attempted', {
      sitter_id: sitter.id,
      sitter_name: sitter.name,
      service_type: serviceType,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      pet_count: selectedPetIds.length,
      total_amount: calculateTotal(),
    });

    try {
      const total = calculateTotal();
      const allowsDailyReports = serviceType === 'pet_sitting_sitters_home' || serviceType === 'pet_sitting_owners_home';
      
      const bookingData = {
        sitterId: sitter.id,
        serviceType,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        startTime: (serviceType === 'dog_walking' || serviceType === 'drop_in_visits') ? startTime : undefined,
        endTime: (serviceType === 'dog_walking' || serviceType === 'drop_in_visits') ? endTime : undefined,
        petIds: selectedPetIds,
        specialInstructions: messageToSitter,
        totalAmount: total,
        requiresDailyReports: allowsDailyReports ? requiresDailyReports : false
      };

      const { data, error } = await supabase.functions.invoke('create-booking', {
        body: bookingData
      });

      if (error) {
        const errorMessage = (data as any)?.error || error.message || 'Failed to create booking';
        throw new Error(errorMessage);
      }

      if (data && (data as any).error) {
        throw new Error((data as any).error);
      }

      // GA4 conversion event: complete_booking
      ga4.completeBooking(sitter.id, sitter.name, serviceType, calculateTotal());
      
      trackAction('booking_request_sent', {
        sitter_id: sitter.id,
        sitter_name: sitter.name,
        service_type: serviceType,
        booking_id: (data as any)?.booking?.id,
        total_amount: calculateTotal(),
      });
      
      toast({
        title: 'Booking Request Sent! 🎉',
        description: 'Your booking has been sent to the sitter. You\'ll be notified when they respond.',
        duration: 8000,
      });
      
      if (onBookingComplete) {
        setTimeout(() => {
          onBookingComplete();
        }, 1000);
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'There was an error creating your booking. Please try again.';
      
      trackDropoff('booking', 'submit_failed', {
        sitter_id: sitter.id,
        error: errorMessage,
        service_type: serviceType,
      });
      
      toast({
        title: 'Booking Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const total = calculateTotal();

  return (
    <Card className="border-2 border-primary/20 shadow-xl bg-card overflow-hidden relative">
      <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
        <CardTitle className="flex items-center gap-3">
          <img 
            src={sitter.avatar} 
            alt={sitter.name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/30"
          />
          <div>
            <div className="text-xl font-bold">📩 Enquire with {sitter.name.split(' ')[0]}</div>
            {total > 0 && (
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                From NZ${total.toFixed(2)} estimated
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Trust signals - right at the top */}
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3 space-y-1.5">
          <p className="text-sm font-medium text-green-800 dark:text-green-200 flex items-center gap-2">
            <Zap className="w-4 h-4 flex-shrink-0" /> Average response time: 2 hours
          </p>
          <p className="text-sm font-medium text-green-800 dark:text-green-200 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" /> Free to enquire — no payment until sitter accepts
          </p>
          <p className="text-sm font-medium text-green-800 dark:text-green-200 flex items-center gap-2">
            <Shield className="w-4 h-4 flex-shrink-0" /> 100% refund if sitter cancels
          </p>
        </div>

        {/* Service Selection - Compact chips */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">Service</label>
          <div className="flex flex-wrap gap-2">
            {servicesData.length > 0 ? (
              servicesData.map((service) => {
                const getServiceDisplayName = (type: string) => {
                  switch (type) {
                    case 'pet_sitting_owners_home': return '🏠 At Your Home';
                    case 'pet_sitting_sitters_home': return '🏡 At Sitter\'s';
                    case 'drop_in_visits': return '👀 Drop-ins';
                    default: return type.replace(/_/g, ' ');
                  }
                };

                const getRate = () => {
                  if (service.hourly_rate) return `$${service.hourly_rate}/hr`;
                  if (service.daily_rate) return `$${service.daily_rate}/day`;
                  return '';
                };

                const isSelected = serviceType === service.service_type;

                return (
                  <Badge
                    key={service.id}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer py-2 px-3 text-sm transition-all",
                      isSelected 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "hover:bg-primary/10 hover:border-primary/50"
                    )}
                    onClick={() => {
                      setServiceType(service.service_type);
                      trackAction('booking_service_selected', {
                        sitter_id: sitter.id,
                        service_type: service.service_type,
                      });
                    }}
                  >
                    {getServiceDisplayName(service.service_type)} • {getRate()}
                  </Badge>
                );
              })
            ) : (
              <Badge variant="outline" className="py-2 px-3">Pet Sitting</Badge>
            )}
          </div>
        </div>

        {/* Simplified Date Selection - native date inputs (mobile-friendly) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Check-in <span className="text-red-500">*</span></label>
            <input
              type="date"
              className="w-full h-12 px-3 rounded-md border-2 border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={startDate ? formatDateForInput(startDate) : ''}
              min={formatDateForInput(today)}
              onChange={(e) => handleDateChange(e.target.value, 'start')}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold">Check-out <span className="text-red-500">*</span></label>
            <input
              type="date"
              className="w-full h-12 px-3 rounded-md border-2 border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={endDate ? formatDateForInput(endDate) : ''}
              min={startDate ? formatDateForInput(startDate) : formatDateForInput(today)}
              onChange={(e) => handleDateChange(e.target.value, 'end')}
            />
          </div>
        </div>

        {/* Optional message to sitter - simple, 3 lines max */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">
            Message to {sitter.name.split(' ')[0]} <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Textarea
            placeholder={`Hi ${sitter.name.split(' ')[0]}! I have a [dog/cat] and would love to know if you're available...`}
            value={messageToSitter}
            onChange={(e) => setMessageToSitter(e.target.value)}
            rows={3}
            className="resize-none border-2"
          />
        </div>

        {/* Price Summary - Compact */}
        {total > 0 && (
          <div className="flex justify-between items-center bg-muted/50 rounded-lg p-3">
            <span className="font-medium">Estimated total</span>
            <span className="text-xl font-bold text-primary">NZ${total.toFixed(2)}</span>
          </div>
        )}

        {/* Primary CTA - BIG green "Send Free Enquiry" */}
        {isGuestPreview ? (
          <Button 
            onClick={onGuestSignup}
            size="lg"
            className="w-full h-16 text-xl font-bold bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-400 hover:via-emerald-400 hover:to-teal-400 text-white shadow-xl shadow-green-500/30 transition-all hover:scale-[1.02]"
          >
            📩 Request Free Quote →
          </Button>
        ) : (
          <Button 
            onClick={handleBooking}
            disabled={loading}
            size="lg"
            className="w-full h-16 text-xl font-bold bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-400 hover:via-emerald-400 hover:to-teal-400 text-white shadow-xl shadow-green-500/30 transition-all hover:scale-[1.02]"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Sending...
              </>
            ) : (
              '📩 Send Free Enquiry'
            )}
          </Button>
        )}
        
        {/* Reassurance below CTA */}
        <div className="flex justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            No payment needed
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Reply within hours
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Cancel anytime
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
