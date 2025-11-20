import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, differenceInHours, differenceInDays } from 'date-fns';
import { 
  CalendarIcon, Clock, DollarSign, MapPin, User, Shield, Plus, X, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { metaPixel } from '@/lib/metaPixel';

interface WalkVisitSession {
  id: string;
  date: Date;
}

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sitter: {
    id: number;
    name: string;
    location: string;
    hourlyRate: number;
    services: string[];
    avatar: string;
  };
  servicesData?: any[]; // Actual sitter services with rates
  initialDates?: {
    checkIn?: string;
    checkOut?: string;
    serviceType?: string;
  };
}

const serviceLabels = {
  'pet_sitting_sitters_home': 'Pet Sitting (Sitter\'s Home)',
  'pet_sitting_owners_home': 'Pet Sitting (Your Home)', 
  'drop_in_visits': 'Drop-in Visits',
  'dog_walking': 'Dog Walking',
};

export default function BookingDialog({ isOpen, onClose, sitter, servicesData = [], initialDates }: BookingDialogProps) {
  // Get service rates from actual sitter services or use defaults
  const getServiceRate = (serviceType: string) => {
    const service = servicesData.find(s => s.service_type === serviceType);
    if (!service) return 0;
    
    // Return appropriate rate based on service type
    if (serviceType === 'pet_sitting_sitters_home' || serviceType === 'pet_sitting_owners_home') {
      return service.daily_rate || service.overnight_rate || 0;
    } else {
      return service.hourly_rate || 0;
    }
  };
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [serviceType, setServiceType] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [requiresDailyReports, setRequiresDailyReports] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [checkingPromo, setCheckingPromo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ownerPets, setOwnerPets] = useState<any[]>([]);
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
  const [repeatAcrossDays, setRepeatAcrossDays] = useState(false);
  
  // For dog walking and drop-in visits - multiple sessions
  const [walkVisitSessions, setWalkVisitSessions] = useState<WalkVisitSession[]>([
    { id: '1', date: new Date() }
  ]);
  
  const [bookedDates, setBookedDates] = useState<{ start: Date; end: Date }[]>([]);
  const [loadingBookedDates, setLoadingBookedDates] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Pre-populate dates from URL params
  useEffect(() => {
    if (initialDates) {
      if (initialDates.checkIn) {
        setStartDate(new Date(initialDates.checkIn));
      }
      if (initialDates.checkOut) {
        setEndDate(new Date(initialDates.checkOut));
      }
      if (initialDates.serviceType) {
        setServiceType(initialDates.serviceType);
      }
    }
  }, [initialDates]);

  // Fetch sitter's booked dates
  useEffect(() => {
    const fetchBookedDates = async () => {
      if (!isOpen || !sitter?.id) {
        setBookedDates([]);
        setLoadingBookedDates(false);
        return;
      }

      setLoadingBookedDates(true);
      console.log('=== Fetching booked dates for sitter:', sitter.id);

      try {
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select('start_date, end_date, status')
          .eq('sitter_id', sitter.id.toString())
          .in('status', ['pending', 'awaiting_payment', 'confirmed', 'in_progress']);

        if (error) {
          console.error('Error fetching booked dates:', error);
          toast({
            title: "Warning",
            description: "Unable to load sitter availability. Please refresh and try again.",
            variant: "destructive"
          });
          setLoadingBookedDates(false);
          return;
        }

        if (bookings && bookings.length > 0) {
          const dates = bookings.map(b => ({
            start: new Date(b.start_date),
            end: new Date(b.end_date)
          }));
          console.log('=== Booked dates loaded:', dates.length, 'bookings');
          console.log('Booked date ranges:', dates.map(d => `${d.start.toDateString()} - ${d.end.toDateString()}`));
          setBookedDates(dates);
        } else {
          console.log('=== No bookings found for this sitter');
          setBookedDates([]);
        }
      } catch (err) {
        console.error('Unexpected error fetching booked dates:', err);
        setBookedDates([]);
      }

      setLoadingBookedDates(false);
    };

    fetchBookedDates();
  }, [isOpen, sitter?.id]);

  // Fetch owner's pets when dialog opens
  useEffect(() => {
    const fetchOwnerPets = async () => {
      if (!user || !isOpen) return;

      try {
        // Get owner's profile ID and role
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('user_id', user.id)
          .single();

        if (!profile) return;
        
        // CRITICAL FIX: Prevent sitters from booking other sitters
        if (profile.role === 'pet_sitter') {
          toast({
            title: "Not Available",
            description: "Pet sitters cannot book other sitters. Please switch to a pet owner account.",
            variant: "destructive",
          });
          onClose();
          return;
        }

        // Fetch owner's pets
        const { data: pets, error } = await supabase
          .from('pets')
          .select('id, name, species, breed')
          .eq('owner_id', profile.id);

        if (error) throw error;

        setOwnerPets(pets || []);
        // Pre-select all pets by default
        if (pets && pets.length > 0) {
          setSelectedPetIds(pets.map(p => p.id));
        }
      } catch (error) {
        console.error('Error fetching pets:', error);
      }
    };

    fetchOwnerPets();
  }, [user, isOpen]);

  const isDateBooked = (date: Date) => {
    const isBooked = bookedDates.some(booking => {
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      const bookingStart = new Date(booking.start);
      bookingStart.setHours(0, 0, 0, 0);
      const bookingEnd = new Date(booking.end);
      bookingEnd.setHours(0, 0, 0, 0);
      const result = checkDate >= bookingStart && checkDate <= bookingEnd;
      if (result) {
        console.log(`Date ${checkDate.toDateString()} is booked (conflicts with ${bookingStart.toDateString()} - ${bookingEnd.toDateString()})`);
      }
      return result;
    });
    return isBooked;
  };

  const handleDateSelect = (date: Date | undefined, type: 'start' | 'end') => {
    console.log(`=== handleDateSelect called ===`);
    console.log(`Type: ${type}`);
    console.log(`Selected date:`, date);
    console.log(`Total booked dates:`, bookedDates.length);
    
    // Prevent selecting booked dates
    if (date && isDateBooked(date)) {
      console.log('❌ Date is booked! Showing error toast');
      toast({
        title: "Date Unavailable",
        description: "This sitter is already booked on this date. Please select a different date.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('✓ Date is available');
    console.log(`Date type:`, typeof date);
    console.log(`Is valid date:`, date instanceof Date);
    
    if (type === 'start') {
      console.log(`Previous startDate:`, startDate);
      setStartDate(date);
      setStartDateOpen(false);
      console.log(`Setting startDate to:`, date);
      
      // Force a re-render check
      setTimeout(() => {
        console.log(`After setState - startDate should be:`, date);
      }, 100);
      
      if (date && endDate && endDate < date) {
        setEndDate(undefined);
        console.log('End date reset because it was before new start date');
      }
    } else {
      console.log(`Previous endDate:`, endDate);
      setEndDate(date);
      setEndDateOpen(false);
      console.log(`Setting endDate to:`, date);
      
      // Force a re-render check
      setTimeout(() => {
        console.log(`After setState - endDate should be:`, date);
      }, 100);
    }
  };

  const calculateTotal = () => {
    const service = servicesData.find(s => s.service_type === serviceType);
    if (!service) return 0;
    
    // Number of pets selected
    const petCount = selectedPetIds.length;
    if (petCount === 0) return 0;

    if (serviceType === 'pet_sitting_sitters_home' || serviceType === 'pet_sitting_owners_home') {
      if (!startDate || !endDate) return 0;
      
      const dailyRate = service.daily_rate;
      
      if (!dailyRate) {
        return 0;
      }
      
      // Calculate days (not nights) for pet sitting
      const days = differenceInDays(endDate, startDate);
      const totalDays = Math.max(1, days);
      
      // CRITICAL: Daily rate is PER PET
      return totalDays * dailyRate * petCount;
      
    } else if (serviceType === 'dog_walking') {
      const hourlyRate = service.hourly_rate;
      
      if (!hourlyRate || !startTime || !endTime) {
        return 0;
      }
      
      console.log('🔥 NEW DOG WALKING CALCULATION V2 🔥');
      
      // Calculate duration in hours from start and end time
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      let startMinutes = startHour * 60 + startMin;
      let endMinutes = endHour * 60 + endMin;
      
      // Handle crossing midnight
      if (endMinutes <= startMinutes) {
        endMinutes += 24 * 60; // Add 24 hours
      }
      
      let durationHours = (endMinutes - startMinutes) / 60;
      
      // Round to 0.5h increments, minimum 0.5h
      durationHours = Math.max(0.5, Math.round(durationHours * 2) / 2);
      
      // Calculate days booked
      let daysBooked = 1;
      if (repeatAcrossDays && startDate && endDate) {
        daysBooked = Math.max(1, differenceInDays(endDate, startDate));
      }
      
      console.log('Dog Walking Calc:', {
        durationHours,
        daysBooked,
        repeatAcrossDays,
        hourlyRate,
        petCount,
        total: durationHours * hourlyRate * daysBooked * petCount
      });
      
      // Hourly pricing: hourly_rate × duration_in_hours × days_booked × num_pets
      return durationHours * hourlyRate * daysBooked * petCount;
      
    } else if (serviceType === 'drop_in_visits') {
      const visitRate = service.hourly_rate; // Using hourly_rate field for visit rate
      
      if (!visitRate) {
        return 0;
      }
      
      // Drop-in visits charged per visit (flat rate, not per hour)
      // Number of visits = number of sessions
      const numberOfVisits = walkVisitSessions.length;
      // Visits are NOT per pet - it's a flat rate per visit
      return numberOfVisits * visitRate;
    }
    return 0;
  };

  // Cost calculations
  const total = calculateTotal();
  const serviceCostExGST = total / 1.15;
  const gstAmount = total - serviceCostExGST;
  const platformFee = serviceCostExGST * 0.10;
  const platformFeeGST = platformFee * 0.15;
  const platformFeeIncGST = platformFee + platformFeeGST;
  const discountedPlatformFee = Math.max(0, platformFeeIncGST - promoDiscount);
  const grandTotal = total + discountedPlatformFee;
  
  // Function to check promo code
  const checkPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError('');
      setPromoDiscount(0);
      return;
    }
    
    setCheckingPromo(true);
    setPromoError('');
    
    try {
      const { data, error } = await supabase.rpc('validate_promo_code', {
        p_code: promoCode.toUpperCase(),
        p_platform_fee: platformFeeIncGST
      });
      
      if (error) throw error;
      
      const promoResult = data as any;
      if (promoResult && promoResult.valid) {
        setPromoDiscount(Number(promoResult.discount_amount));
        toast({
          title: '🎉 Promo Code Applied!',
          description: `You saved $${Number(promoResult.discount_amount).toFixed(2)} on platform fees!`
        });
      } else {
        setPromoError(promoResult?.error || 'Invalid promo code');
        setPromoDiscount(0);
      }
    } catch (error: any) {
      setPromoError('Failed to validate promo code');
      setPromoDiscount(0);
    } finally {
      setCheckingPromo(false);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Validate required fields based on service type
    if (!serviceType) {
      toast({
        title: 'Missing Information',
        description: 'Please select a service type.',
        variant: 'destructive'
      });
      return;
    }
    
    // For pet sitting, require date range
    if ((serviceType === 'pet_sitting_sitters_home' || serviceType === 'pet_sitting_owners_home') && (!startDate || !endDate)) {
      toast({
        title: 'Missing Information',
        description: 'Please select start and end dates.',
        variant: 'destructive'
      });
      return;
    }
    
    // For dog walking, require start time and end time
    if (serviceType === 'dog_walking' && (!startTime || !endTime)) {
      toast({
        title: 'Missing Information',
        description: 'Please select start and end time for dog walking.',
        variant: 'destructive'
      });
      return;
    }
    
    // For dog walking with repeat, validate date range
    if (serviceType === 'dog_walking' && repeatAcrossDays && (!startDate || !endDate)) {
      toast({
        title: 'Missing Information',
        description: 'Please select start and end dates for repeating sessions.',
        variant: 'destructive'
      });
      return;
    }
    
    // For drop-in visits, validate sessions
    if (serviceType === 'drop_in_visits') {
      if (walkVisitSessions.length === 0) {
        toast({
          title: 'Missing Information',
          description: 'Please add at least one visit session.',
          variant: 'destructive'
        });
        return;
      }
    }

    // Require pet selection - pet owners MUST have pets registered
    if (ownerPets.length === 0) {
      toast({
        title: 'No Pets Registered',
        description: 'Please add your pets to your profile before booking a sitter.',
        variant: 'destructive'
      });
      return;
    }

    if (selectedPetIds.length === 0) {
      toast({
        title: 'No Pets Selected',
        description: 'Please select at least one pet for this booking.',
        variant: 'destructive'
      });
      return;
    }

    // Validate special instructions - prevent empty or spaces-only
    if (specialInstructions && !specialInstructions.trim()) {
      toast({
        title: 'Invalid Instructions',
        description: 'Special instructions cannot be empty or contain only spaces.',
        variant: 'destructive'
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: 'Agreement Required',
        description: 'Please agree to the booking terms and conditions.',
        variant: 'destructive'
      });
      return;
    }

    // Track initiate checkout event
    const total = calculateTotal();
    metaPixel.trackInitiateCheckout({ 
      value: total, 
      currency: 'NZD' 
    });

    setLoading(true);

    try {
      
      // Only allow daily reports for overnight pet sitting services
      const allowsDailyReports = serviceType === 'pet_sitting_sitters_home' || serviceType === 'pet_sitting_owners_home';
      
      let bookingData: any = {
        sitterId: sitter.id.toString(),
        serviceType,
        petIds: selectedPetIds,
        specialInstructions,
        totalAmount: total,
        requiresDailyReports: allowsDailyReports ? requiresDailyReports : false,
        promoCode: promoCode ? promoCode.toUpperCase() : undefined
      };
      
      // Add date fields based on service type
      if (serviceType === 'pet_sitting_sitters_home' || serviceType === 'pet_sitting_owners_home') {
        bookingData.startDate = format(startDate!, 'yyyy-MM-dd');
        bookingData.endDate = format(endDate!, 'yyyy-MM-dd');
      } else if (serviceType === 'dog_walking') {
        // For dog walking
        bookingData.startDate = format(startDate!, 'yyyy-MM-dd');
        bookingData.endDate = repeatAcrossDays && endDate ? format(endDate!, 'yyyy-MM-dd') : format(startDate!, 'yyyy-MM-dd');
        bookingData.startTime = startTime;
        bookingData.endTime = endTime;
      } else if (serviceType === 'drop_in_visits') {
        // For visits, store all visit sessions
        const sortedSessions = [...walkVisitSessions].sort((a, b) => a.date.getTime() - b.date.getTime());
        bookingData.startDate = format(sortedSessions[0].date, 'yyyy-MM-dd');
        bookingData.endDate = format(sortedSessions[sortedSessions.length - 1].date, 'yyyy-MM-dd');
        bookingData.walkVisitSessions = walkVisitSessions.map(s => ({
          date: format(s.date, 'yyyy-MM-dd')
        }));
      }

      console.log('[BOOKING] Sending booking data:', bookingData);
      console.log('[BOOKING] Current user session:', await supabase.auth.getSession());

      const { data, error } = await supabase.functions.invoke('create-booking', {
        body: bookingData
      });

      console.log('[BOOKING] === Response ===');
      console.log('[BOOKING] Data:', JSON.stringify(data, null, 2));
      console.log('[BOOKING] Error:', JSON.stringify(error, null, 2));
      console.log('[BOOKING] Error message:', error?.message);
      console.log('[BOOKING] Error context:', error?.context);

      // Check if data contains an error message first (this happens when edge function returns 400)
      if (data && typeof data === 'object' && 'error' in data) {
        const serverError = (data as any).error;
        let errorMessage = 'Unable to create booking. Please try again.';
        let errorTitle = 'Booking Error';
        
        if (typeof serverError === 'string') {
          if (serverError.toLowerCase().includes('not available') || serverError.toLowerCase().includes('overlapping') || serverError.toLowerCase().includes('conflict')) {
            errorTitle = '🚫 Sitter Unavailable';
            errorMessage = '⚠️ This sitter is already booked for the selected dates. The calendar has been updated to show unavailable dates. Please choose different dates.';
          } else if (serverError.toLowerCase().includes('pricing') || serverError.toLowerCase().includes('rate')) {
            errorMessage = 'There was an issue with the pricing. Please try again or contact support.';
          } else if (serverError.toLowerCase().includes('pet')) {
            errorMessage = 'There was an issue with your pet selection. Please try again.';
          } else {
            errorMessage = serverError;
          }
        }
        
        console.error('Server error:', serverError);
        
        // Force refresh booked dates to show conflicts on calendar BEFORE showing toast
        try {
          const { data: refreshedBookings } = await supabase
            .from('bookings')
            .select('start_date, end_date, status')
            .eq('sitter_id', sitter.id.toString())
            .in('status', ['pending', 'awaiting_payment', 'confirmed', 'in_progress']);
          
          if (refreshedBookings) {
            const dates = refreshedBookings.map(b => ({
              start: new Date(b.start_date),
              end: new Date(b.end_date)
            }));
            setBookedDates(dates);
          }
        } catch (refreshError) {
          console.error('Error refreshing booked dates:', refreshError);
        }
        
        // Show a more prominent, longer-lasting toast for unavailability
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
          duration: 10000, // 10 seconds instead of 6
        });
        
        throw new Error(errorMessage);
      }

      // Handle network/function errors
      if (error) {
        console.error('[BOOKING] Edge function error:', error);
        console.error('[BOOKING] Error details:', {
          message: error.message,
          name: error.name,
          context: error.context,
          status: error.status
        });
        
        let errorMessage = 'Unable to reach the server. Please check your connection and try again.';
        
        // Provide more specific error message based on error type
        if (error.message?.includes('FunctionsHttpError')) {
          errorMessage = 'Server error occurred. Please try again or contact support.';
        } else if (error.message?.includes('FunctionsRelayError')) {
          errorMessage = 'Connection error. Please check your internet connection.';
        } else if (error.message?.includes('FunctionsFetchError')) {
          errorMessage = 'Network error. Please try again.';
        }
        
        toast({
          title: "Booking Failed",
          description: errorMessage + ` (${error.message})`,
          variant: "destructive",
        });
        throw new Error('Network error');
      }

      // Booking created successfully - payment will be requested after sitter accepts
      onClose();
      toast({
        title: 'Booking Request Sent!',
        description: data?.message || 'Your booking has been sent to the sitter. You will be notified when they accept, and then you can complete payment.',
        duration: 8000,
      });
    } catch (error: any) {
      console.error('Booking error:', error);
      
      // Extract error message from the response
      const errorMessage = error?.message || error?.error || 'There was an error creating your booking. Please try again.';
      
      toast({
        title: 'Booking Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setStartDateOpen(false);
    setEndDateOpen(false);
    setStartTime('09:00');
    setEndTime('10:00');
    setRepeatAcrossDays(false);
    setServiceType('');
    setSpecialInstructions('');
    setRequiresDailyReports(false);
    setAgreedToTerms(false);
    setSelectedPetIds([]);
    setWalkVisitSessions([{ id: '1', date: new Date() }]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Debug render cycles
  console.log(`=== BookingDialog render ===`);
  console.log(`Current startDate:`, startDate);
  console.log(`Current endDate:`, endDate);
  console.log(`Current serviceType:`, serviceType);
  console.log(`startDate type:`, typeof startDate);
  console.log(`endDate type:`, typeof endDate);

  // Test date formatting
  if (startDate) {
    try {
      const formatted = format(startDate, "PPP");
      console.log(`Formatted startDate:`, formatted);
    } catch (error) {
      console.error(`Error formatting startDate:`, error);
    }
  }
  
  if (endDate) {
    try {
      const formatted = format(endDate, "PPP");
      console.log(`Formatted endDate:`, formatted);
    } catch (error) {
      console.error(`Error formatting endDate:`, error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {loadingBookedDates && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading availability...</p>
            </div>
          </div>
        )}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <img 
                src={sitter.avatar} 
                alt={sitter.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-semibold">Book {sitter.name}</div>
                <div className="text-sm text-muted-foreground flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {sitter.location}
                </div>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Select your preferred service, dates, and times to book with {sitter.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* No Services Available Message */}
          {servicesData.length === 0 ? (
            <Card className="p-6 text-center">
              <div className="space-y-3">
                <div className="text-lg font-semibold text-muted-foreground">No Services Available</div>
                <p className="text-sm text-muted-foreground">
                  This sitter hasn't configured their services yet. Please check back later or contact them directly.
                </p>
              </div>
            </Card>
          ) : (
            <>
              {/* Service Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Service Type *</label>
                <Select value={serviceType} onValueChange={(value) => {
                  console.log('Service type selected:', value);
                  setServiceType(value);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicesData.map((service) => {
                      let rate = 0;
                      let rateLabel = '';
                      let serviceName = '';
                      
                      switch (service.service_type) {
                        case 'pet_sitting_sitters_home':
                          serviceName = "Pet Sitting (Sitter's Home)";
                          rate = service.daily_rate || 0;
                          rateLabel = '/day/pet';
                          break;
                        case 'pet_sitting_owners_home':
                          serviceName = "Pet Sitting (Your Home)";
                          rate = service.daily_rate || 0;
                          rateLabel = '/day/pet';
                          break;
                        case 'drop_in_visits':
                          serviceName = "Drop-in Visits";
                          rate = service.hourly_rate || 0;
                          rateLabel = '/visit';
                          break;
                        case 'dog_walking':
                          serviceName = "Dog Walking";
                          rate = service.hourly_rate || 0;
                          rateLabel = '/hour/pet';
                          break;
                        default:
                          serviceName = service.service_type;
                          rate = service.daily_rate || service.hourly_rate || 0;
                          rateLabel = '/day';
                      }
                      
                      return (
                        <SelectItem key={service.id} value={service.service_type}>
                          <div className="flex justify-between w-full items-center">
                            <span>{serviceName}</span>
                            <span className="text-sm text-muted-foreground ml-4">${rate.toFixed(2)}{rateLabel}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          
          {/* Only show rest of form if services are available and service is selected */}
          {servicesData.length > 0 && serviceType && (
            <>

          {/* Date Selection - For pet sitting and dog walking */}
          {serviceType && (serviceType === 'pet_sitting_sitters_home' || serviceType === 'pet_sitting_owners_home' || serviceType === 'dog_walking') && (
            <div className="space-y-4">
              {/* Booked dates info banner */}
              {bookedDates.length > 0 && (
                <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-orange-900 dark:text-orange-100">
                        <span className="font-semibold">Note:</span> Dates with a red background are already booked and cannot be selected. Please choose different dates.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className={cn("grid gap-4", serviceType === 'dog_walking' ? "grid-cols-1" : "grid-cols-2")}>
                <div className="space-y-3">
                  <label className="text-sm font-medium">{serviceType === 'dog_walking' ? 'Start Date' : 'Start Date'} *</label>
                  <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Select start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => handleDateSelect(date, 'start')}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today || isDateBooked(date);
                        }}
                        modifiers={{
                          booked: (date) => isDateBooked(date)
                        }}
                        modifiersStyles={{
                          booked: { 
                            backgroundColor: 'hsl(0 84.2% 60.2%)',
                            color: 'white',
                            textDecoration: 'line-through',
                            opacity: 0.7,
                            fontWeight: 'bold'
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* End Date - For pet sitting (always) and dog walking (only if repeat is enabled) */}
                {((serviceType === 'pet_sitting_sitters_home' || serviceType === 'pet_sitting_owners_home') || 
                  (serviceType === 'dog_walking' && repeatAcrossDays)) && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">End Date *</label>
                    <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Select end date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => handleDateSelect(date, 'end')}
                          disabled={(date) => {
                            if (!startDate) return true;
                            const minDate = new Date(startDate);
                            minDate.setHours(0, 0, 0, 0);
                            return date < minDate || isDateBooked(date);
                          }}
                          modifiers={{
                            booked: (date) => isDateBooked(date)
                          }}
                          modifiersStyles={{
                            booked: { 
                              backgroundColor: 'hsl(0 84.2% 60.2%)',
                              color: 'white',
                              textDecoration: 'line-through',
                              opacity: 0.7,
                              fontWeight: 'bold'
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>

              {/* Repeat across days toggle - Only for dog walking */}
              {serviceType === 'dog_walking' && (
                <div className="flex items-start space-x-3 p-3 border rounded-lg bg-muted/30">
                  <input
                    type="checkbox"
                    id="repeat-days"
                    checked={repeatAcrossDays}
                    onChange={(e) => {
                      setRepeatAcrossDays(e.target.checked);
                      if (!e.target.checked) {
                        setEndDate(undefined);
                      }
                    }}
                    className="mt-1 h-4 w-4"
                  />
                  <div className="flex-1">
                    <label htmlFor="repeat-days" className="text-sm font-medium cursor-pointer">
                      Repeat this session across multiple days
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enable this to book the same walking session for multiple days
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Time Selection - Only for dog walking */}
          {serviceType === 'dog_walking' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-sm font-medium">Start Time *</label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium">End Time *</label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Duration display for dog walking */}
          {serviceType === 'dog_walking' && startTime && endTime && (() => {
            const [startHour, startMin] = startTime.split(':').map(Number);
            const [endHour, endMin] = endTime.split(':').map(Number);
            let startMinutes = startHour * 60 + startMin;
            let endMinutes = endHour * 60 + endMin;
            
            // Handle crossing midnight
            if (endMinutes <= startMinutes) {
              endMinutes += 24 * 60;
            }
            
            const durationMinutes = endMinutes - startMinutes;
            const durationHours = Math.max(0.5, Math.round((durationMinutes / 60) * 2) / 2);
            
            return (
              <Card className="p-3 bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  Session length: <span className="font-semibold text-foreground">{durationHours} {durationHours === 1 ? 'hour' : 'hours'}</span>
                  {durationMinutes > 24 * 60 && <span className="text-orange-600 ml-2">(crosses midnight)</span>}
                </p>
              </Card>
            );
          })()}

          {/* Drop-in Visit Sessions */}
          {serviceType === 'drop_in_visits' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Drop-in Visit Sessions *</label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setWalkVisitSessions([
                      ...walkVisitSessions,
                      {
                        id: Date.now().toString(),
                        date: new Date()
                      }
                    ]);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Session
                </Button>
              </div>
              
              <div className="space-y-3">
                {walkVisitSessions.map((session, index) => (
                  <Card key={session.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Session {index + 1}</span>
                        {walkVisitSessions.length > 1 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setWalkVisitSessions(walkVisitSessions.filter(s => s.id !== session.id));
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-3 w-3" />
                              {format(session.date, "PPP")}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={session.date}
                              onSelect={(date) => {
                                if (date) {
                                  // Check if date is booked
                                  if (isDateBooked(date)) {
                                    toast({
                                      title: "🚫 Date Unavailable",
                                      description: "This sitter is already booked on this date. Please choose a different date - booked dates are shown with a red background.",
                                      variant: "destructive",
                                      duration: 8000,
                                    });
                                    return;
                                  }
                                  setWalkVisitSessions(
                                    walkVisitSessions.map(s =>
                                      s.id === session.id ? { ...s, date } : s
                                    )
                                  );
                                }
                              }}
                              disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return date < today || isDateBooked(date);
                              }}
                              modifiers={{
                                booked: (date) => isDateBooked(date)
                              }}
                              modifiersStyles={{
                                booked: { 
                                  backgroundColor: 'hsl(0 84.2% 60.2%)',
                                  color: 'white',
                                  textDecoration: 'line-through',
                                  opacity: 0.7,
                                  fontWeight: 'bold'
                                }
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              <p className="text-xs text-muted-foreground">
                Each visit is charged at ${servicesData.find(s => s.service_type === serviceType)?.hourly_rate || 0}/visit
              </p>
            </div>
          )}

          {/* Pet Selection */}
          {ownerPets.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Select Pet(s) for this Booking *</label>
              <Card className="p-4">
                <div className="space-y-3">
                  {ownerPets.map((pet) => (
                    <div key={pet.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <input
                        type="checkbox"
                        id={`pet-${pet.id}`}
                        checked={selectedPetIds.includes(pet.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPetIds([...selectedPetIds, pet.id]);
                          } else {
                            setSelectedPetIds(selectedPetIds.filter(id => id !== pet.id));
                          }
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                      <label htmlFor={`pet-${pet.id}`} className="flex-1 cursor-pointer">
                        <div className="font-medium">{pet.name}</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {pet.species} {pet.breed ? `• ${pet.breed}` : ''}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
                {selectedPetIds.length === 0 && (
                  <p className="text-sm text-orange-600 mt-2">Please select at least one pet</p>
                )}
              </Card>
            </div>
          )}

          {/* Special Instructions */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Special Instructions</label>
            <Textarea
              placeholder="Any special care instructions for your pets..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={3}
            />
          </div>


          {/* Daily Reports Option - Only for overnight pet sitting services */}
          {(serviceType === 'pet_sitting_sitters_home' || serviceType === 'pet_sitting_owners_home') && (
            <div className="flex items-start space-x-3 p-4 border-2 rounded-lg bg-primary/5 border-primary/20">
              <input
                type="checkbox"
                id="daily-reports"
                checked={requiresDailyReports}
                onChange={(e) => setRequiresDailyReports(e.target.checked)}
                className="mt-1 h-4 w-4"
              />
              <div className="flex-1">
                <label htmlFor="daily-reports" className="text-sm font-semibold cursor-pointer flex items-center gap-2">
                  Request daily reports
                  <Badge variant="secondary" className="text-xs">Recommended</Badge>
                </label>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Get daily updates with photos and detailed information about your pet's activities, meals, mood, and wellbeing during their overnight stay.
                </p>
                <p className="text-xs font-medium text-primary mt-2">
                  💡 Note: If the sitter doesn't provide the requested daily reports, they may receive a reduced payment.
                </p>
              </div>
            </div>
          )}

          {/* Terms Agreement */}
          <div className="flex items-start space-x-3 p-4 border rounded-lg bg-primary/5">
            <input
              type="checkbox"
              id="terms-agreement"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1"
            />
            <div className="flex-1">
              <label htmlFor="terms-agreement" className="text-sm font-medium cursor-pointer">
                I agree to the booking terms *
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                I understand that this booking is subject to ZiggySitters' terms of service and cancellation policy. 
                The sitter agrees to provide the selected service, and I agree to pay the stated amount.
              </p>
            </div>
          </div>

          {/* Promo Code Section */}
          <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">🎉 Have a Promo Code?</label>
                  {promoDiscount > 0 && (
                    <Badge variant="default" className="bg-green-600">Applied!</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code (e.g., BLACKFRIDAY50)"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value.toUpperCase());
                      setPromoError('');
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={checkPromoCode}
                    disabled={!promoCode.trim() || checkingPromo}
                    variant="outline"
                  >
                    {checkingPromo ? 'Checking...' : 'Apply'}
                  </Button>
                </div>
                {promoError && (
                  <p className="text-sm text-destructive">{promoError}</p>
                )}
                {promoDiscount > 0 && (
                  <p className="text-sm text-green-600 font-medium">
                    🎊 You're saving ${promoDiscount.toFixed(2)} on platform fees!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Booking Summary */}
          {total > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Service</span>
                  <span>{serviceLabels[serviceType as keyof typeof serviceLabels]}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Number of Pets</span>
                  <span>{selectedPetIds.length}</span>
                </div>
                
                {(serviceType === 'pet_sitting_sitters_home' || serviceType === 'pet_sitting_owners_home') ? (
                  <>
                    <div className="flex justify-between">
                      <span>Duration</span>
                      <span>
                        {startDate && endDate ? (differenceInDays(endDate, startDate) || 1) : 1} days
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Rate</span>
                      <span>${servicesData.find(s => s.service_type === serviceType)?.daily_rate || 0}/day/pet</span>
                    </div>
                  </>
                ) : serviceType === 'dog_walking' ? (
                  <>
                    {/* Dog walking hourly summary */}
                    {(() => {
                      const [startHour, startMin] = startTime.split(':').map(Number);
                      const [endHour, endMin] = endTime.split(':').map(Number);
                      let startMinutes = startHour * 60 + startMin;
                      let endMinutes = endHour * 60 + endMin;
                      
                      // Handle crossing midnight
                      if (endMinutes <= startMinutes) {
                        endMinutes += 24 * 60;
                      }
                      
                      const durationHours = Math.max(0.5, Math.round(((endMinutes - startMinutes) / 60) * 2) / 2);
                      const daysBooked = repeatAcrossDays && startDate && endDate ? Math.max(1, differenceInDays(endDate, startDate)) : 1;
                      const rate = servicesData.find(s => s.service_type === serviceType)?.hourly_rate || 0;
                      const subtotal = rate * durationHours * daysBooked * selectedPetIds.length;
                      
                      return (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Session length</span>
                            <span className="font-medium">{durationHours} {durationHours === 1 ? 'hour' : 'hours'}</span>
                          </div>
                          {repeatAcrossDays && (
                            <div className="flex justify-between text-sm">
                              <span>Days booked</span>
                              <span className="font-medium">{daysBooked}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span>Number of Pets</span>
                            <span className="font-medium">{selectedPetIds.length}</span>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Rate</span>
                            <span>${rate.toFixed(2)}/hour</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span className="font-medium">${subtotal.toFixed(2)}</span>
                          </div>
                        </>
                      );
                    })()}
                  </>
                ) : (
                  <>
                    {/* Drop-in visits summary */}
                    <div className="space-y-2">
                      <div className="font-medium text-sm">Visits:</div>
                      {walkVisitSessions.map((session) => (
                        <div key={session.id} className="flex justify-between text-sm text-muted-foreground pl-4">
                          <span>{format(session.date, "MMM d, yyyy")}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between">
                      <span>Total Visits</span>
                      <span>{walkVisitSessions.length}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Rate</span>
                      <span>${servicesData.find(s => s.service_type === serviceType)?.hourly_rate || 0}/visit</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between text-sm">
                  <span>Service Cost (ex GST)</span>
                  <span>${serviceCostExGST.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>GST (15%)</span>
                  <span>${gstAmount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Service Cost (inc GST)</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Platform Fee (10% ex GST)</span>
                  <span>${platformFee.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Platform Fee GST (15%)</span>
                  <span>${platformFeeGST.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Platform fee (10%)</span>
                  <span className={promoDiscount > 0 ? 'line-through text-muted-foreground' : ''}>
                    ${platformFeeIncGST.toFixed(2)}
                  </span>
                </div>
                
                {promoDiscount > 0 && (
                  <>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Promo Discount</span>
                      <span>-${promoDiscount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-green-600">
                      <span>Platform fee after discount</span>
                      <span>${discountedPlatformFee.toFixed(2)}</span>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Sitter receives (90%)</span>
                  <span>${(serviceCostExGST * 0.9).toFixed(2)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Close conditional wrapper for when service is selected */}
          </>
          )}

          {/* Action Buttons - Show cancel button always, submit only when services exist */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button variant="outline" onClick={handleClose} className="w-full sm:flex-1">
              Cancel
            </Button>
            {servicesData.length > 0 && (
              <Button 
                onClick={handleBooking} 
                disabled={!serviceType || loading || 
                  (serviceType !== 'dog_walking' && serviceType !== 'drop_in_visits' && (!startDate || !endDate)) ||
                  (serviceType === 'dog_walking' && (!startDate || !startTime || !endTime))}
                className="w-full sm:flex-1"
              >
                {loading ? 'Creating Booking...' : 'Send Booking Request'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}