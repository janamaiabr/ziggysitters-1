import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInHours, differenceInDays } from 'date-fns';
import { CalendarIcon, Clock, Shield, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';

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
  
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialCheckIn ? new Date(initialCheckIn) : today
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialCheckOut ? new Date(initialCheckOut) : tomorrow
  );
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [serviceType, setServiceType] = useState(initialServiceType || '');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [requiresDailyReports, setRequiresDailyReports] = useState(true);
  const [loading, setLoading] = useState(false);
  const [repeatAcrossDays, setRepeatAcrossDays] = useState(false);
  const [ownerPets, setOwnerPets] = useState<any[]>([]);
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
  const { user } = useAuth();
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

  const handleDateSelect = (date: Date | undefined, type: 'start' | 'end') => {
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
      if (serviceType === 'dog_walking' && realService.hourly_rate) {
        if (!startTime || !endTime) return 0;
        
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        let startMinutes = startHour * 60 + startMin;
        let endMinutes = endHour * 60 + endMin;
        
        if (endMinutes <= startMinutes) {
          endMinutes += 24 * 60;
        }
        
        let durationHours = (endMinutes - startMinutes) / 60;
        durationHours = Math.max(0.5, Math.round(durationHours * 2) / 2);
        
        let daysBooked = 1;
        if (repeatAcrossDays && startDate && endDate) {
          daysBooked = Math.max(1, differenceInDays(endDate, startDate));
        }
        
        return durationHours * realService.hourly_rate * daysBooked;
      }
      
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
        return totalDays * rate;
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
        specialInstructions,
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
  const isHourlyService = serviceType === 'dog_walking' || serviceType === 'drop_in_visits';

  return (
    <Card className="border shadow-lg bg-card overflow-hidden relative">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={sitter.avatar} 
              alt={sitter.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
            />
            <div>
              <div className="text-lg font-bold">Ask {sitter.name} for a Quote</div>
              <div className="text-sm text-green-600 font-medium">
                Free • No commitment • Quick response
              </div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5 pt-4">
        {/* Trust Indicators - Only factual claims */}
        <div className="flex flex-wrap gap-2 pb-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Shield className="w-3 h-3 mr-1" />
            Secure Payment via Stripe
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            ID Verified
          </Badge>
        </div>

        {/* Service Selection - Make it prominent */}
        <div className="space-y-2">
          <label className="text-sm font-semibold flex items-center gap-1">
            What service do you need? <span className="text-red-500">*</span>
          </label>
          <Select value={serviceType} onValueChange={(value) => {
            setServiceType(value);
            trackAction('booking_service_selected', {
              sitter_id: sitter.id,
              service_type: value,
            });
          }}>
            <SelectTrigger className="h-12 text-base border-2 focus:border-primary">
              <SelectValue placeholder="Select a service..." />
            </SelectTrigger>
            <SelectContent>
              {servicesData.length > 0 ? (
                servicesData.map((service) => {
                  const getServiceDisplayName = (type: string) => {
                    switch (type) {
                      case 'dog_walking': return '🚶 Dog Walking';
                      case 'pet_sitting_owners_home': return '🏠 Pet Sitting (Your Home)';
                      case 'pet_sitting_sitters_home': return '🏡 Pet Sitting (Sitter\'s Home)';
                      case 'drop_in_visits': return '👀 Drop-in Visits';
                      default: return type.replace(/_/g, ' ');
                    }
                  };

                  const getRate = () => {
                    if (service.hourly_rate) return `NZ$${service.hourly_rate.toFixed(2)}/hour`;
                    if (service.daily_rate) return `NZ$${service.daily_rate.toFixed(2)}/day`;
                    return '';
                  };

                  return (
                    <SelectItem key={service.id} value={service.service_type} className="py-3">
                      <div className="flex justify-between items-center w-full gap-4">
                        <span className="font-medium">{getServiceDisplayName(service.service_type)}</span>
                        <span className="text-primary font-semibold">{getRate()}</span>
                      </div>
                    </SelectItem>
                  );
                })
              ) : (
                <SelectItem value="pet_sitting_owners_home">Pet Sitting</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Date Selection */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Start Date <span className="text-red-500">*</span></label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-left font-normal border-2",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'MMM d, yyyy') : 'Pick date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => handleDateSelect(date, 'start')}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold">End Date <span className="text-red-500">*</span></label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-left font-normal border-2",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'MMM d, yyyy') : 'Pick date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => handleDateSelect(date, 'end')}
                  disabled={(date) => date < (startDate || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Time Selection for hourly services */}
        {isHourlyService && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Start Time
              </label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger className="h-12 border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return (
                      <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                        {`${hour}:00`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-1">
                <Clock className="w-4 h-4" />
                End Time
              </label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger className="h-12 border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return (
                      <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                        {`${hour}:00`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Pet Selection */}
        {ownerPets.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-semibold">Which pets? <span className="text-muted-foreground font-normal">(optional)</span></label>
            <div className="flex flex-wrap gap-2">
              {ownerPets.map((pet) => (
                <Badge
                  key={pet.id}
                  variant={selectedPetIds.includes(pet.id) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer py-2 px-3 text-sm transition-all",
                    selectedPetIds.includes(pet.id) 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-primary/10"
                  )}
                  onClick={() => {
                    setSelectedPetIds(prev => 
                      prev.includes(pet.id)
                        ? prev.filter(id => id !== pet.id)
                        : [...prev, pet.id]
                    );
                  }}
                >
                  {pet.name} ({pet.species})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Pet info is optional - simplified message */}
        {ownerPets.length === 0 && (
          <p className="text-sm text-muted-foreground">
            💡 You can add your pet's details after the sitter responds
          </p>
        )}

        {/* Price Summary - Always show something encouraging */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 space-y-2">
          {total > 0 ? (
            <>
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Estimated Total</span>
                <span className="text-2xl text-green-600">NZ${total.toFixed(2)}</span>
              </div>
              <p className="text-sm text-green-700">
                ✅ No payment now • Pay only after sitter confirms
              </p>
            </>
          ) : (
            <p className="text-sm text-green-700 text-center">
              ✅ Free to request • No payment until sitter accepts
            </p>
          )}
        </div>

        {/* Two CTA options - Low commitment path */}
        <div className="space-y-3">
          {/* Primary CTA - different for guests vs logged-in users */}
          {isGuestPreview ? (
            <Button 
              onClick={onGuestSignup}
              size="lg"
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-400 hover:via-emerald-400 hover:to-teal-400 text-white shadow-xl shadow-green-500/30 transition-all hover:scale-[1.02]"
            >
              Sign Up Free to Send Enquiry →
            </Button>
          ) : (
            <Button 
              onClick={handleBooking}
              disabled={loading}
              size="lg"
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-400 hover:via-emerald-400 hover:to-teal-400 text-white shadow-xl shadow-green-500/30 transition-all hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Sending...
                </>
              ) : (
                <>
                  Send Enquiry - It's Free →
                </>
              )}
            </Button>
          )}
        </div>
        
        {/* Strong reassurance - address commitment anxiety */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center space-y-1">
          <p className="text-sm font-medium text-blue-800">
            💬 This is just an enquiry, not a booking
          </p>
          <p className="text-xs text-blue-600">
            No payment required • Sitter will respond within 24 hours • You decide after chatting
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
