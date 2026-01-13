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
import { useProfile } from '@/contexts/ProfileContext';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInHours, differenceInDays } from 'date-fns';
import { CalendarIcon, Clock, Shield, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';
import InlinePetAdder from './InlinePetAdder';
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
    <Card className="border-2 border-primary/20 shadow-xl bg-card overflow-hidden relative">
      <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
        <CardTitle className="flex items-center gap-3">
          <img 
            src={sitter.avatar} 
            alt={sitter.name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/30"
          />
          <div>
            <div className="text-xl font-bold">💬 Ask {sitter.name.split(' ')[0]} for a Quote</div>
            <div className="text-sm text-green-600 dark:text-green-400 font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Free • No commitment • Responds in hours
            </div>
          </div>
        </CardTitle>
        
        {/* Prominent reassurance banner */}
        <div className="mt-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-center">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            🛡️ This is just an enquiry — you won't be charged anything
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">

        {/* Service Selection - Compact chips */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">Service</label>
          <div className="flex flex-wrap gap-2">
            {servicesData.length > 0 ? (
              servicesData.map((service) => {
                const getServiceDisplayName = (type: string) => {
                  switch (type) {
                    case 'dog_walking': return '🚶 Walking';
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

        {/* Inline pet adder for users without pets - OPTIONAL for conversion */}
        {ownerPets.length === 0 && profile?.id && !isGuestPreview && (
          <div className="space-y-1">
            <InlinePetAdder 
              profileId={profile.id}
              onPetAdded={(newPet) => {
                setOwnerPets(prev => [...prev, newPet]);
                setSelectedPetIds(prev => [...prev, newPet.id]);
              }}
            />
            <p className="text-xs text-center text-muted-foreground">
              💡 No pet profile yet? No worries — you can still send this enquiry!
            </p>
          </div>
        )}
        
        {/* For guests, show simple message */}
        {isGuestPreview && (
          <p className="text-sm text-muted-foreground">
            💡 You'll add your pet's details after signing up (optional)
          </p>
        )}

        {/* Price Summary - Compact */}
        {total > 0 && (
          <div className="flex justify-between items-center bg-muted/50 rounded-lg p-3">
            <span className="font-medium">Estimated</span>
            <span className="text-xl font-bold text-primary">NZ${total.toFixed(2)}</span>
          </div>
        )}

        {/* Primary CTA - BIG and prominent */}
        {isGuestPreview ? (
          <Button 
            onClick={onGuestSignup}
            size="lg"
            className="w-full h-16 text-xl font-bold bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-400 hover:via-emerald-400 hover:to-teal-400 text-white shadow-xl shadow-green-500/30 transition-all hover:scale-[1.02]"
          >
            💬 Send Free Enquiry →
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
              '💬 Send Free Enquiry'
            )}
          </Button>
        )}
        
        {/* Triple reassurance - directly adjacent to CTA */}
        <div className="space-y-2">
          <p className="text-sm text-center text-green-700 dark:text-green-400 font-semibold">
            ✓ Not a booking — just a question to {sitter.name.split(' ')[0]}
          </p>
          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              No payment info needed
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Cancel anytime
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
