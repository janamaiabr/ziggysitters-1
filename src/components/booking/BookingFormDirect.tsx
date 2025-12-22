import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInHours, differenceInDays } from 'date-fns';
import { CalendarIcon, Clock, Shield, Sparkles, CheckCircle, Users, Star } from 'lucide-react';
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
}

export default function BookingFormDirect({ 
  sitter, 
  servicesData = [], 
  onBookingComplete,
  initialCheckIn,
  initialCheckOut,
  initialServiceType
}: BookingFormDirectProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialCheckIn ? new Date(initialCheckIn) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialCheckOut ? new Date(initialCheckOut) : undefined
  );
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [serviceType, setServiceType] = useState(initialServiceType || '');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [requiresDailyReports, setRequiresDailyReports] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [repeatAcrossDays, setRepeatAcrossDays] = useState(false);
  const [ownerPets, setOwnerPets] = useState<any[]>([]);
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { trackAction, trackDropoff } = useBehaviorTracking();
  
  // Track when form is viewed
  useEffect(() => {
    trackAction('booking_form_viewed', {
      sitter_id: sitter.id,
      sitter_name: sitter.name,
      has_initial_dates: !!(initialCheckIn && initialCheckOut),
      has_initial_service: !!initialServiceType,
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

    if (!agreedToTerms) {
      trackDropoff('booking', 'validation_failed', {
        sitter_id: sitter.id,
        reason: 'terms_not_agreed',
      });
      toast({
        title: 'Agreement Required',
        description: 'Please agree to the booking terms and conditions.',
        variant: 'destructive'
      });
      return;
    }

    if (selectedPetIds.length === 0) {
      trackDropoff('booking', 'validation_failed', {
        sitter_id: sitter.id,
        reason: 'no_pets_selected',
      });
      toast({
        title: 'No Pets Selected',
        description: 'Please select at least one pet for this booking.',
        variant: 'destructive'
      });
      return;
    }

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
    <Card className="border-2 border-primary/20 shadow-xl bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden relative">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={sitter.avatar} 
              alt={sitter.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
            />
            <div>
              <div className="text-xl font-bold">Book {sitter.name}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                  Verified
                </span>
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
          <Select value={serviceType} onValueChange={setServiceType}>
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
            <label className="text-sm font-semibold">Which pets? <span className="text-red-500">*</span></label>
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

        {ownerPets.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <strong>No pets added yet!</strong> You'll need to add your pet before booking.
            <Button 
              variant="link" 
              className="p-0 h-auto ml-1 text-amber-800 underline"
              onClick={() => navigate('/profile?tab=pets')}
            >
              Add a pet now →
            </Button>
          </div>
        )}

        {/* Special Instructions */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">Special instructions (optional)</label>
          <Textarea 
            placeholder="Any special care instructions, dietary needs, or other notes..."
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            className="min-h-[80px] border-2"
          />
        </div>

        {/* Terms Agreement */}
        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
          <Checkbox 
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            className="mt-0.5"
          />
          <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
            I agree to the booking terms and understand that payment is only required after the sitter accepts my request.
          </label>
        </div>

        {/* Price Summary */}
        {total > 0 && (
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Estimated Total</span>
              <span className="text-2xl text-primary">NZ${total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Final price confirmed when sitter accepts. No payment required now.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <Button 
          onClick={handleBooking}
          disabled={loading || ownerPets.length === 0}
          size="lg"
          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Sending Request...
            </>
          ) : (
            <>
              Send Booking Request
              {total > 0 && <span className="ml-2 opacity-80">• NZ${total.toFixed(2)}</span>}
            </>
          )}
        </Button>
        
        <p className="text-center text-xs text-muted-foreground">
          💳 You won't be charged until the sitter accepts
        </p>
      </CardContent>
    </Card>
  );
}
