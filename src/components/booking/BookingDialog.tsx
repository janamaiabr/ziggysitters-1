import React, { useState, useEffect, useRef } from 'react';
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
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useEventTracking } from '@/hooks/useEventTracking';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays } from 'date-fns';
import { 
  CalendarIcon, Clock, DollarSign, MapPin, Plus, X, AlertCircle, PawPrint, ChevronLeft, ChevronRight, Check
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
  servicesData?: any[];
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

const STEPS = [
  { id: 1, name: 'Service', description: 'Choose your service' },
  { id: 2, name: 'Schedule', description: 'Pick dates & times' },
  { id: 3, name: 'Pets', description: 'Select your pets' },
  { id: 4, name: 'Details', description: 'Add instructions' },
  { id: 5, name: 'Review', description: 'Confirm booking' },
];

// Common time presets for quick selection
const TIME_PRESETS = [
  { label: 'Morning (9am)', start: '09:00', end: '10:00' },
  { label: 'Midday (12pm)', start: '12:00', end: '13:00' },
  { label: 'Afternoon (3pm)', start: '15:00', end: '16:00' },
  { label: 'Evening (6pm)', start: '18:00', end: '19:00' },
];

export default function BookingDialog({ isOpen, onClose, sitter, servicesData = [], initialDates }: BookingDialogProps) {
  // Wizard step state
  const [currentStep, setCurrentStep] = useState(1);
  
  const getServiceRate = (serviceType: string) => {
    const service = servicesData.find(s => s.service_type === serviceType);
    if (!service) return 0;
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
  const [ownerProfileId, setOwnerProfileId] = useState<string>('');
  
  const [showQuickAddPet, setShowQuickAddPet] = useState(false);
  const [quickPetName, setQuickPetName] = useState('');
  const [quickPetSpecies, setQuickPetSpecies] = useState<string>('dog');
  const [addingPet, setAddingPet] = useState(false);
  
  const [walkVisitSessions, setWalkVisitSessions] = useState<WalkVisitSession[]>([
    { id: '1', date: new Date() }
  ]);
  
  const [bookedDates, setBookedDates] = useState<{ start: Date; end: Date }[]>([]);
  const [loadingBookedDates, setLoadingBookedDates] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { trackEvent } = useEventTracking();
  const navigate = useNavigate();
  const hasTrackedOpen = useRef(false);
  const hasStartedBooking = useRef(false);

  // Reset step when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !hasTrackedOpen.current) {
      hasTrackedOpen.current = true;
      trackEvent({
        eventType: 'booking',
        eventName: 'booking_form_viewed',
        eventData: {
          sitter_id: sitter.id,
          sitter_name: sitter.name,
          available_services: servicesData.map(s => s.service_type)
        }
      });
    }
    if (!isOpen) {
      hasTrackedOpen.current = false;
      hasStartedBooking.current = false;
    }
  }, [isOpen]);

  // Pre-fill dates and auto-select service with smart defaults
  useEffect(() => {
    if (initialDates) {
      if (initialDates.checkIn) setStartDate(new Date(initialDates.checkIn));
      if (initialDates.checkOut) setEndDate(new Date(initialDates.checkOut));
      if (initialDates.serviceType) setServiceType(initialDates.serviceType);
    }
  }, [initialDates]);

  // Smart defaults: auto-select most popular service if none selected
  useEffect(() => {
    if (isOpen && servicesData.length > 0 && !serviceType && !initialDates?.serviceType) {
      // Priority: pet_sitting_owners_home > pet_sitting_sitters_home > drop_in_visits > dog_walking
      const priorityOrder = ['pet_sitting_owners_home', 'pet_sitting_sitters_home', 'drop_in_visits', 'dog_walking'];
      for (const type of priorityOrder) {
        const service = servicesData.find(s => s.service_type === type);
        if (service) {
          setServiceType(type);
          break;
        }
      }
    }
  }, [isOpen, servicesData, serviceType, initialDates]);

  useEffect(() => {
    const fetchBookedDates = async () => {
      if (!isOpen || !sitter?.id) {
        setBookedDates([]);
        setLoadingBookedDates(false);
        return;
      }

      setLoadingBookedDates(true);

      try {
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select('start_date, end_date, status')
          .eq('sitter_id', sitter.id.toString())
          .in('status', ['pending', 'awaiting_payment', 'confirmed', 'in_progress']);

        if (error) {
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
          setBookedDates(dates);
        } else {
          setBookedDates([]);
        }
      } catch (err) {
        setBookedDates([]);
      }

      setLoadingBookedDates(false);
    };

    fetchBookedDates();
  }, [isOpen, sitter?.id]);

  useEffect(() => {
    const fetchOwnerPets = async () => {
      if (!user || !isOpen) return;

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('user_id', user.id)
          .single();

        if (!profile) return;
        
        setOwnerProfileId(profile.id);
        
        if (profile.role === 'pet_sitter') {
          toast({
            title: "Not Available",
            description: "Pet sitters cannot book other sitters. Please switch to a pet owner account.",
            variant: "destructive",
          });
          onClose();
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
        // Silent fail
      }
    };

    fetchOwnerPets();
  }, [user, isOpen]);

  const isDateBooked = (date: Date) => {
    return bookedDates.some(booking => {
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      const bookingStart = new Date(booking.start);
      bookingStart.setHours(0, 0, 0, 0);
      const bookingEnd = new Date(booking.end);
      bookingEnd.setHours(0, 0, 0, 0);
      return checkDate >= bookingStart && checkDate <= bookingEnd;
    });
  };

  const handleDateSelect = (date: Date | undefined, type: 'start' | 'end') => {
    if (date && isDateBooked(date)) {
      toast({
        title: "Date Unavailable",
        description: "This sitter is already booked on this date. Please select a different date.",
        variant: "destructive",
      });
      return;
    }
    
    if (type === 'start') {
      setStartDate(date);
      setStartDateOpen(false);
      if (date && endDate && endDate < date) {
        setEndDate(undefined);
      }
    } else {
      setEndDate(date);
      setEndDateOpen(false);
    }
  };

  const calculateTotal = () => {
    const service = servicesData.find(s => s.service_type === serviceType);
    if (!service) return 0;
    
    // Allow booking without pets - use 1 as minimum for calculation
    const petCount = Math.max(1, selectedPetIds.length);

    if (serviceType === 'pet_sitting_sitters_home' || serviceType === 'pet_sitting_owners_home') {
      if (!startDate || !endDate) return 0;
      const dailyRate = service.daily_rate;
      if (!dailyRate) return 0;
      const days = differenceInDays(endDate, startDate);
      const totalDays = Math.max(1, days);
      return totalDays * dailyRate * petCount;
      
    } else if (serviceType === 'dog_walking') {
      const hourlyRate = service.hourly_rate;
      if (!hourlyRate || !startTime || !endTime) return 0;
      
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
      
      return durationHours * hourlyRate * daysBooked * petCount;
      
    } else if (serviceType === 'drop_in_visits') {
      const visitRate = service.hourly_rate;
      if (!visitRate) return 0;
      const numberOfVisits = walkVisitSessions.length;
      return numberOfVisits * visitRate;
    }
    return 0;
  };

  const total = calculateTotal();
  const serviceCostExGST = total / 1.15;
  const gstAmount = total - serviceCostExGST;
  const platformFee = serviceCostExGST * 0.10;
  const platformFeeGST = platformFee * 0.15;
  const platformFeeIncGST = platformFee + platformFeeGST;
  const discountedPlatformFee = Math.max(0, platformFeeIncGST - promoDiscount);
  const grandTotal = total + discountedPlatformFee;
  
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

  const handleQuickAddPet = async () => {
    if (!quickPetName.trim()) {
      toast({
        title: 'Pet name required',
        description: 'Please enter your pet\'s name',
        variant: 'destructive'
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to add pets',
        variant: 'destructive'
      });
      return;
    }

    if (!ownerProfileId) {
      toast({
        title: 'Profile not found',
        description: 'Please try again',
        variant: 'destructive'
      });
      return;
    }

    setAddingPet(true);
    try {
      const { data: newPet, error } = await supabase
        .from('pets')
        .insert({
          owner_id: ownerProfileId,
          name: quickPetName.trim(),
          species: quickPetSpecies as any,
        })
        .select('id, name, species, breed')
        .single();

      if (error) throw error;

      setOwnerPets(prev => [...prev, newPet]);
      setSelectedPetIds(prev => [...prev, newPet.id]);
      setQuickPetName('');
      setShowQuickAddPet(false);
      
      toast({
        title: 'Pet added!',
        description: `${newPet.name} has been added. You can add more details later from your profile.`,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to add pet',
        description: error.message || 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setAddingPet(false);
    }
  };

  const handleBooking = async () => {
    // Check if user is logged in - if not, redirect to auth
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in or create an account to complete your booking.',
      });
      navigate('/auth', { state: { returnTo: window.location.pathname } });
      return;
    }

    if (!serviceType) {
      toast({ title: 'Missing Information', description: 'Please select a service type.', variant: 'destructive' });
      return;
    }
    
    if ((serviceType === 'pet_sitting_sitters_home' || serviceType === 'pet_sitting_owners_home') && (!startDate || !endDate)) {
      toast({ title: 'Missing Information', description: 'Please select start and end dates.', variant: 'destructive' });
      return;
    }
    
    if (serviceType === 'dog_walking' && (!startTime || !endTime)) {
      toast({ title: 'Missing Information', description: 'Please select start and end time for dog walking.', variant: 'destructive' });
      return;
    }
    
    if (serviceType === 'dog_walking' && repeatAcrossDays && (!startDate || !endDate)) {
      toast({ title: 'Missing Information', description: 'Please select start and end dates for repeating sessions.', variant: 'destructive' });
      return;
    }
    
    if (serviceType === 'drop_in_visits' && walkVisitSessions.length === 0) {
      toast({ title: 'Missing Information', description: 'Please add at least one visit session.', variant: 'destructive' });
      return;
    }

    // Pet selection is now optional - owners can book without adding pets first

    if (specialInstructions && !specialInstructions.trim()) {
      toast({ title: 'Invalid Instructions', description: 'Special instructions cannot be empty or contain only spaces.', variant: 'destructive' });
      return;
    }

    if (!agreedToTerms) {
      toast({ title: 'Agreement Required', description: 'Please agree to the booking terms and conditions.', variant: 'destructive' });
      return;
    }

    const total = calculateTotal();
    trackEvent({
      eventType: 'booking',
      eventName: 'booking_submitted',
      eventData: {
        sitter_id: sitter.id,
        sitter_name: sitter.name,
        service_type: serviceType,
        total_amount: total,
        pet_count: selectedPetIds.length,
        has_promo: promoDiscount > 0,
      }
    });

    metaPixel.trackInitiateCheckout({ value: total, currency: 'NZD' });

    setLoading(true);

    try {
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
      
      if (serviceType === 'pet_sitting_sitters_home' || serviceType === 'pet_sitting_owners_home') {
        bookingData.startDate = format(startDate!, 'yyyy-MM-dd');
        bookingData.endDate = format(endDate!, 'yyyy-MM-dd');
      } else if (serviceType === 'dog_walking') {
        bookingData.startDate = format(startDate!, 'yyyy-MM-dd');
        bookingData.endDate = repeatAcrossDays && endDate ? format(endDate!, 'yyyy-MM-dd') : format(startDate!, 'yyyy-MM-dd');
        bookingData.startTime = startTime;
        bookingData.endTime = endTime;
      } else if (serviceType === 'drop_in_visits') {
        const sortedSessions = [...walkVisitSessions].sort((a, b) => a.date.getTime() - b.date.getTime());
        bookingData.startDate = format(sortedSessions[0].date, 'yyyy-MM-dd');
        bookingData.endDate = format(sortedSessions[sortedSessions.length - 1].date, 'yyyy-MM-dd');
        bookingData.walkVisitSessions = walkVisitSessions.map(s => ({
          date: format(s.date, 'yyyy-MM-dd')
        }));
      }

      const { data, error } = await supabase.functions.invoke('create-booking', {
        body: bookingData
      });

      if (data && typeof data === 'object' && 'error' in data) {
        const serverError = (data as any).error;
        let errorMessage = 'Unable to create booking. Please try again.';
        let errorTitle = 'Booking Error';
        
        if (typeof serverError === 'string') {
          if (serverError.toLowerCase().includes('not available') || serverError.toLowerCase().includes('overlapping') || serverError.toLowerCase().includes('conflict')) {
            errorTitle = '🚫 Sitter Unavailable';
            errorMessage = '⚠️ This sitter is already booked for the selected dates. Please choose different dates.';
          } else if (serverError.toLowerCase().includes('pricing') || serverError.toLowerCase().includes('rate')) {
            errorMessage = 'There was an issue with the pricing. Please try again or contact support.';
          } else if (serverError.toLowerCase().includes('pet')) {
            errorMessage = 'There was an issue with your pet selection. Please try again.';
          } else {
            errorMessage = serverError;
          }
        }
        
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
          // Silent fail
        }
        
        toast({ title: errorTitle, description: errorMessage, variant: "destructive", duration: 10000 });
        throw new Error(errorMessage);
      }

      if (error) {
        let errorMessage = 'Unable to reach the server. Please check your connection and try again.';
        if (error.message?.includes('FunctionsHttpError')) {
          errorMessage = 'Server error occurred. Please try again or contact support.';
        } else if (error.message?.includes('FunctionsRelayError')) {
          errorMessage = 'Connection error. Please check your internet connection.';
        } else if (error.message?.includes('FunctionsFetchError')) {
          errorMessage = 'Network error. Please try again.';
        }
        toast({ title: "Booking Failed", description: errorMessage + ` (${error.message})`, variant: "destructive" });
        throw new Error('Network error');
      }

      onClose();
      toast({
        title: 'Booking Request Sent!',
        description: data?.message || 'Your booking has been sent to the sitter. You will be notified when they accept.',
        duration: 8000,
      });
    } catch (error: any) {
      const errorMessage = error?.message || error?.error || 'There was an error creating your booking. Please try again.';
      toast({ title: 'Booking Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
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
    setPromoCode('');
    setPromoDiscount(0);
    setPromoError('');
  };

  const handleClose = () => {
    if (hasStartedBooking.current && !loading) {
      trackEvent({
        eventType: 'booking',
        eventName: 'booking_abandoned',
        eventData: {
          sitter_id: sitter.id,
          service_type: serviceType,
          had_dates: !!(startDate || endDate),
          had_pets: selectedPetIds.length > 0,
          step_abandoned: currentStep,
        }
      });
    }
    resetForm();
    onClose();
  };

  // Step validation
  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!serviceType;
      case 2:
        if (serviceType === 'pet_sitting_sitters_home' || serviceType === 'pet_sitting_owners_home') {
          return !!(startDate && endDate);
        } else if (serviceType === 'dog_walking') {
          return !!(startDate && startTime && endTime);
        } else if (serviceType === 'drop_in_visits') {
          return walkVisitSessions.length > 0;
        }
        return false;
      case 3:
        return selectedPetIds.length > 0 || (!user && ownerPets.length === 0);
      case 4:
        return true;
      case 5:
        return agreedToTerms;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < 5 && canProceedFromStep(currentStep)) {
      if (!hasStartedBooking.current && currentStep === 1) {
        hasStartedBooking.current = true;
        trackEvent({
          eventType: 'booking',
          eventName: 'booking_started',
          eventData: { sitter_id: sitter.id, sitter_name: sitter.name, service_type: serviceType }
        });
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Step content renderers
  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-4 sm:mb-6">
        <h3 className="font-semibold text-lg sm:text-xl">What service do you need?</h3>
        <p className="text-sm text-muted-foreground">Select the type of care for your pet</p>
      </div>
      
      {servicesData.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="text-lg font-semibold text-muted-foreground">No Services Available</div>
          <p className="text-sm text-muted-foreground">This sitter hasn't configured their services yet.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {servicesData.map((service) => {
            let rate = 0;
            let rateLabel = '';
            let serviceName = '';
            let serviceIcon = '🏠';
            
            switch (service.service_type) {
              case 'pet_sitting_sitters_home':
                serviceName = "Pet Sitting (Sitter's Home)";
                rate = service.daily_rate || 0;
                rateLabel = '/day/pet';
                serviceIcon = '🏡';
                break;
              case 'pet_sitting_owners_home':
                serviceName = "Pet Sitting (Your Home)";
                rate = service.daily_rate || 0;
                rateLabel = '/day/pet';
                serviceIcon = '🏠';
                break;
              case 'drop_in_visits':
                serviceName = "Drop-in Visits";
                rate = service.hourly_rate || 0;
                rateLabel = '/visit';
                serviceIcon = '👋';
                break;
              case 'dog_walking':
                serviceName = "Dog Walking";
                rate = service.hourly_rate || 0;
                rateLabel = '/hour/pet';
                serviceIcon = '🐕';
                break;
              default:
                serviceName = service.service_type;
                rate = service.daily_rate || service.hourly_rate || 0;
                rateLabel = '/day';
            }
            
            return (
              <Card 
                key={service.id}
                className={cn(
                  "p-4 sm:p-4 cursor-pointer transition-all hover:border-primary active:scale-[0.98]",
                  "min-h-[60px] sm:min-h-0", // Larger touch target on mobile
                  serviceType === service.service_type && "border-primary bg-primary/5 ring-1 ring-primary"
                )}
                onClick={() => setServiceType(service.service_type)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-xl sm:text-base">{serviceIcon}</span>
                    <div className={cn(
                      "w-6 h-6 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      serviceType === service.service_type ? "border-primary bg-primary" : "border-muted-foreground"
                    )}>
                      {serviceType === service.service_type && <Check className="w-4 h-4 sm:w-3 sm:h-3 text-primary-foreground" />}
                    </div>
                    <span className="font-medium text-base sm:text-sm">{serviceName}</span>
                  </div>
                  <Badge variant="secondary" className="text-sm sm:text-xs">${rate.toFixed(2)}{rateLabel}</Badge>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="font-semibold text-lg">When do you need care?</h3>
        <p className="text-sm text-muted-foreground">Select your preferred dates and times</p>
      </div>

      {bookedDates.length > 0 && (
        <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800 p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-800 dark:text-orange-200">
              Dates highlighted in red are already booked
            </div>
          </div>
        </Card>
      )}

      {(serviceType === 'pet_sitting_sitters_home' || serviceType === 'pet_sitting_owners_home' || serviceType === 'dog_walking') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date *</Label>
            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
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
                  modifiers={{ booked: (date) => isDateBooked(date) }}
                  modifiersStyles={{
                    booked: { backgroundColor: 'hsl(0 84.2% 60.2%)', color: 'white', textDecoration: 'line-through', opacity: 0.7 }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {((serviceType === 'pet_sitting_sitters_home' || serviceType === 'pet_sitting_owners_home') || 
            (serviceType === 'dog_walking' && repeatAcrossDays)) && (
            <div className="space-y-2">
              <Label>End Date *</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
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
                    modifiers={{ booked: (date) => isDateBooked(date) }}
                    modifiersStyles={{
                      booked: { backgroundColor: 'hsl(0 84.2% 60.2%)', color: 'white', textDecoration: 'line-through', opacity: 0.7 }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      )}

      {serviceType === 'dog_walking' && (
        <>
          <div className="flex items-start space-x-3 p-4 sm:p-3 border rounded-lg bg-muted/30 min-h-[52px]">
            <input
              type="checkbox"
              id="repeat-days"
              checked={repeatAcrossDays}
              onChange={(e) => {
                setRepeatAcrossDays(e.target.checked);
                if (!e.target.checked) setEndDate(undefined);
              }}
              className="mt-1 h-5 w-5 sm:h-4 sm:w-4"
            />
            <div className="flex-1">
              <label htmlFor="repeat-days" className="text-sm font-medium cursor-pointer">
                Repeat this session across multiple days
              </label>
              <p className="text-xs text-muted-foreground mt-1">Enable to book the same session for multiple days</p>
            </div>
          </div>

          {/* Quick Time Presets */}
          <div className="space-y-2">
            <Label className="text-sm">Quick Select Time</Label>
            <div className="grid grid-cols-2 gap-2">
              {TIME_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant={startTime === preset.start && endTime === preset.end ? "default" : "outline"}
                  size="sm"
                  className="h-10 sm:h-9 text-xs sm:text-sm"
                  onClick={() => {
                    setStartTime(preset.start);
                    setEndTime(preset.end);
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time *</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="h-11 sm:h-10" />
            </div>
            <div className="space-y-2">
              <Label>End Time *</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="h-11 sm:h-10" />
            </div>
          </div>

          {startTime && endTime && (() => {
            const [startHour, startMin] = startTime.split(':').map(Number);
            const [endHour, endMin] = endTime.split(':').map(Number);
            let startMinutes = startHour * 60 + startMin;
            let endMinutes = endHour * 60 + endMin;
            if (endMinutes <= startMinutes) endMinutes += 24 * 60;
            const durationMinutes = endMinutes - startMinutes;
            const durationHours = Math.max(0.5, Math.round((durationMinutes / 60) * 2) / 2);
            
            return (
              <Card className="p-3 bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  Session length: <span className="font-semibold text-foreground">{durationHours} {durationHours === 1 ? 'hour' : 'hours'}</span>
                </p>
              </Card>
            );
          })()}
        </>
      )}

      {serviceType === 'drop_in_visits' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Drop-in Visit Sessions *</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setWalkVisitSessions([...walkVisitSessions, { id: Date.now().toString(), date: new Date() }])}
            >
              <Plus className="w-4 h-4 mr-1" /> Add Session
            </Button>
          </div>
          
          <div className="space-y-3">
            {walkVisitSessions.map((session, index) => (
              <Card key={session.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Session {index + 1}</span>
                  {walkVisitSessions.length > 1 && (
                    <Button type="button" size="sm" variant="ghost" onClick={() => setWalkVisitSessions(walkVisitSessions.filter(s => s.id !== session.id))}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" size="sm" className="w-full justify-start text-left font-normal">
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
                          if (isDateBooked(date)) {
                            toast({ title: "🚫 Date Unavailable", description: "This sitter is already booked on this date.", variant: "destructive" });
                            return;
                          }
                          setWalkVisitSessions(walkVisitSessions.map(s => s.id === session.id ? { ...s, date } : s));
                        }
                      }}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today || isDateBooked(date);
                      }}
                      modifiers={{ booked: (date) => isDateBooked(date) }}
                      modifiersStyles={{
                        booked: { backgroundColor: 'hsl(0 84.2% 60.2%)', color: 'white', textDecoration: 'line-through', opacity: 0.7 }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-4 sm:mb-6">
        <h3 className="font-semibold text-lg sm:text-xl">Which pets need care?</h3>
        <p className="text-sm text-muted-foreground">Select the pets for this booking</p>
      </div>

      {!user ? (
        <Card className="p-6 border-dashed border-2 border-primary/30 bg-primary/5">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <PawPrint className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">Login to Select Pets</h4>
              <p className="text-sm text-muted-foreground">
                You'll be asked to log in when you submit your booking. Your pets will be loaded then.
              </p>
            </div>
            <Badge variant="secondary">Continue to review your booking</Badge>
          </div>
        </Card>
      ) : ownerPets.length === 0 ? (
        <Card className="p-4 border-dashed border-2 border-primary/30 bg-primary/5">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <PawPrint className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">Add Your Pet</h4>
              <p className="text-sm text-muted-foreground">Quick add your pet to continue booking</p>
            </div>
            
            {!showQuickAddPet ? (
              <Button type="button" onClick={() => setShowQuickAddPet(true)} className="w-full h-12 sm:h-10">
                <Plus className="w-4 h-4 mr-2" /> Add Pet
              </Button>
            ) : (
              <div className="space-y-3 text-left">
                <div className="space-y-2">
                  <Label htmlFor="quick-pet-name">Pet Name *</Label>
                  <Input id="quick-pet-name" placeholder="e.g., Max, Bella" value={quickPetName} onChange={(e) => setQuickPetName(e.target.value)} className="h-11 sm:h-10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quick-pet-species">Pet Type *</Label>
                  <Select value={quickPetSpecies} onValueChange={setQuickPetSpecies}>
                    <SelectTrigger className="h-11 sm:h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Dog</SelectItem>
                      <SelectItem value="cat">Cat</SelectItem>
                      <SelectItem value="bird">Bird</SelectItem>
                      <SelectItem value="rabbit">Rabbit</SelectItem>
                      <SelectItem value="reptile">Reptile</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowQuickAddPet(false)} className="flex-1 h-11 sm:h-10">Cancel</Button>
                  <Button type="button" onClick={handleQuickAddPet} disabled={addingPet || !quickPetName.trim()} className="flex-1 h-11 sm:h-10">
                    {addingPet ? 'Adding...' : 'Add Pet'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-4">
          <div className="space-y-2">
            {ownerPets.map((pet) => (
              <div 
                key={pet.id} 
                className={cn(
                  "flex items-center gap-3 p-4 sm:p-3 rounded-lg cursor-pointer transition-all active:scale-[0.98]",
                  "min-h-[56px] sm:min-h-0", // Larger touch target on mobile
                  selectedPetIds.includes(pet.id) 
                    ? "bg-primary/10 border border-primary/30" 
                    : "hover:bg-muted/50 border border-transparent"
                )}
                onClick={() => {
                  if (selectedPetIds.includes(pet.id)) {
                    setSelectedPetIds(selectedPetIds.filter(id => id !== pet.id));
                  } else {
                    setSelectedPetIds([...selectedPetIds, pet.id]);
                  }
                }}
              >
                <div className={cn(
                  "w-6 h-6 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                  selectedPetIds.includes(pet.id) ? "border-primary bg-primary" : "border-muted-foreground"
                )}>
                  {selectedPetIds.includes(pet.id) && <Check className="w-4 h-4 sm:w-3 sm:h-3 text-primary-foreground" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-base sm:text-sm">{pet.name}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {pet.species} {pet.breed ? `• ${pet.breed}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {selectedPetIds.length === 0 && (
            <p className="text-sm text-orange-600 mt-2">Please select at least one pet</p>
          )}
          
          <div className="mt-3 pt-3 border-t">
            {!showQuickAddPet ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowQuickAddPet(true)} className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Add Another Pet
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Name</Label>
                    <Input placeholder="Pet name" value={quickPetName} onChange={(e) => setQuickPetName(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Type</Label>
                    <Select value={quickPetSpecies} onValueChange={setQuickPetSpecies}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dog">Dog</SelectItem>
                        <SelectItem value="cat">Cat</SelectItem>
                        <SelectItem value="bird">Bird</SelectItem>
                        <SelectItem value="rabbit">Rabbit</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => { setShowQuickAddPet(false); setQuickPetName(''); }} className="flex-1">Cancel</Button>
                  <Button type="button" size="sm" onClick={handleQuickAddPet} disabled={addingPet || !quickPetName.trim()} className="flex-1">
                    {addingPet ? 'Adding...' : 'Add'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="font-semibold text-lg">Any special instructions?</h3>
        <p className="text-sm text-muted-foreground">Let the sitter know about any specific needs</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Special Instructions (Optional)</Label>
        <Textarea
          id="instructions"
          placeholder="e.g., Feeding schedule, medications, walking preferences, emergency contacts..."
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          rows={4}
        />
      </div>

      {(serviceType === 'pet_sitting_sitters_home' || serviceType === 'pet_sitting_owners_home') && (
        <Card className="p-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="daily-reports"
              checked={requiresDailyReports}
              onChange={(e) => setRequiresDailyReports(e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <div className="flex-1">
              <label htmlFor="daily-reports" className="text-sm font-medium cursor-pointer">
                Request daily reports
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Receive daily updates with photos and notes about your pet's day
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="font-semibold text-lg">Review & Confirm</h3>
        <p className="text-sm text-muted-foreground">Check your booking details before submitting</p>
      </div>

      {/* Promo Code */}
      <Card className="p-4">
        <div className="space-y-2">
          <Label>Promo Code (Optional)</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            />
            <Button type="button" onClick={checkPromoCode} disabled={!promoCode.trim() || checkingPromo} variant="outline">
              {checkingPromo ? 'Checking...' : 'Apply'}
            </Button>
          </div>
          {promoError && <p className="text-sm text-destructive">{promoError}</p>}
          {promoDiscount > 0 && <p className="text-sm text-green-600 font-medium">🎊 You're saving ${promoDiscount.toFixed(2)} on platform fees!</p>}
        </div>
      </Card>

      {/* Booking Summary */}
      {total > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Booking Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Service</span>
              <span className="font-medium">{serviceLabels[serviceType as keyof typeof serviceLabels]}</span>
            </div>
            <div className="flex justify-between">
              <span>Pets</span>
              <span className="font-medium">{selectedPetIds.length || 'Will select after login'}</span>
            </div>
            
            {(serviceType === 'pet_sitting_sitters_home' || serviceType === 'pet_sitting_owners_home') && startDate && endDate && (
              <div className="flex justify-between">
                <span>Duration</span>
                <span className="font-medium">{differenceInDays(endDate, startDate) || 1} days</span>
              </div>
            )}
            
            <Separator className="my-2" />
            
            <div className="flex justify-between">
              <span>Service Cost (inc GST)</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Platform fee (10%)</span>
              <span className={promoDiscount > 0 ? 'line-through' : ''}>${platformFeeIncGST.toFixed(2)}</span>
            </div>
            {promoDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Promo Discount</span>
                <span>-${promoDiscount.toFixed(2)}</span>
              </div>
            )}
            
            <Separator className="my-2" />
            
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Terms Agreement */}
      <Card className="p-4">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 h-4 w-4"
          />
          <div className="flex-1">
            <label htmlFor="terms" className="text-sm font-medium cursor-pointer">
              I agree to the booking terms and conditions *
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              By checking this box, you agree to our terms of service and cancellation policy
            </p>
          </div>
        </div>
      </Card>

      {!user && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Login Required to Complete</p>
              <p className="text-xs text-muted-foreground">You'll be asked to log in or create an account when you submit this booking.</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return null;
    }
  };

  // Running total for display
  const runningTotal = calculateTotal();
  const showRunningTotal = serviceType && (
    (serviceType.includes('pet_sitting') && startDate && endDate && selectedPetIds.length > 0) ||
    (serviceType === 'dog_walking' && startDate && startTime && endTime && selectedPetIds.length > 0) ||
    (serviceType === 'drop_in_visits' && walkVisitSessions.length > 0)
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {loadingBookedDates && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading availability...</p>
            </div>
          </div>
        )}
        
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-3">
            <img src={sitter.avatar} alt={sitter.name} className="w-12 h-12 sm:w-10 sm:h-10 rounded-full object-cover" />
            <div>
              <div className="font-semibold text-base sm:text-lg">Book {sitter.name}</div>
              <div className="text-sm text-muted-foreground flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {sitter.location}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Book a service with {sitter.name}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator - Compact on mobile */}
        <div className="space-y-2 py-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {currentStep} of 5</span>
            <span className="font-medium">{STEPS[currentStep - 1].name}</span>
          </div>
          <Progress value={(currentStep / 5) * 100} className="h-2" />
          <div className="hidden sm:flex justify-between">
            {STEPS.map((step) => (
              <div 
                key={step.id} 
                className={cn(
                  "flex flex-col items-center",
                  step.id === currentStep && "text-primary",
                  step.id < currentStep && "text-primary",
                  step.id > currentStep && "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs border-2",
                  step.id === currentStep && "border-primary bg-primary text-primary-foreground",
                  step.id < currentStep && "border-primary bg-primary text-primary-foreground",
                  step.id > currentStep && "border-muted-foreground"
                )}>
                  {step.id < currentStep ? <Check className="w-3 h-3" /> : step.id}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Running Total Banner - Shows estimated price as user fills form */}
        {showRunningTotal && currentStep < 5 && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Estimated Total</span>
            </div>
            <span className="text-lg font-bold text-primary">${runningTotal.toFixed(2)}</span>
          </div>
        )}

        {/* Step Content */}
        <div className="min-h-[280px] sm:min-h-[300px]">
          {renderCurrentStep()}
        </div>

        {/* Navigation Buttons - Larger touch targets on mobile */}
        <div className="flex gap-3 pt-4 border-t">
          {currentStep > 1 ? (
            <Button variant="outline" onClick={prevStep} className="flex-1 h-12 sm:h-10 text-base sm:text-sm">
              <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4 mr-1" /> Back
            </Button>
          ) : (
            <Button variant="outline" onClick={handleClose} className="flex-1 h-12 sm:h-10 text-base sm:text-sm">
              Cancel
            </Button>
          )}
          
          {currentStep < 5 ? (
            <Button 
              onClick={nextStep} 
              disabled={!canProceedFromStep(currentStep)}
              className="flex-1 h-12 sm:h-10 text-base sm:text-sm"
            >
              Continue <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4 ml-1" />
            </Button>
          ) : (
            <Button 
              onClick={handleBooking}
              disabled={!agreedToTerms || loading}
              className="flex-1 h-12 sm:h-10 text-base sm:text-sm"
            >
              {loading ? 'Submitting...' : user ? 'Send Booking Request' : 'Login & Submit'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
