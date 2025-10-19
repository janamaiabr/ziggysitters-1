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
import { CalendarIcon, Clock, DollarSign, MapPin, User, Shield, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { metaPixel } from '@/lib/metaPixel';

interface WalkVisitSession {
  id: string;
  date: Date;
}

interface DogWalkingConfig {
  sessionDuration: number; // in hours: 0.5, 1, 2
  selectedDates: Date[];
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
  const [endTime, setEndTime] = useState('17:00');
  const [serviceType, setServiceType] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [requiresDailyReports, setRequiresDailyReports] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ownerPets, setOwnerPets] = useState<any[]>([]);
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
  
  // For dog walking - session-based booking
  const [dogWalkingConfig, setDogWalkingConfig] = useState<DogWalkingConfig>({
    sessionDuration: 1, // default 1 hour
    selectedDates: []
  });
  
  // For drop-in visits - multiple sessions
  const [walkVisitSessions, setWalkVisitSessions] = useState<WalkVisitSession[]>([
    { id: '1', date: new Date() }
  ]);
  
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
        
        // For dog walking, populate selected dates from date range
        if (initialDates.serviceType === 'dog_walking' && initialDates.checkIn && initialDates.checkOut) {
          const start = new Date(initialDates.checkIn);
          const end = new Date(initialDates.checkOut);
          const dates: Date[] = [];
          
          let currentDate = new Date(start);
          while (currentDate <= end) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
          }
          
          setDogWalkingConfig(prev => ({ ...prev, selectedDates: dates }));
        }
        
        // For drop-in visits, create sessions from date range
        if (initialDates.serviceType === 'drop_in_visits' && initialDates.checkIn && initialDates.checkOut) {
          const start = new Date(initialDates.checkIn);
          const end = new Date(initialDates.checkOut);
          const sessions: WalkVisitSession[] = [];
          
          let currentDate = new Date(start);
          let sessionId = 1;
          
          while (currentDate <= end) {
            sessions.push({
              id: sessionId.toString(),
              date: new Date(currentDate)
            });
            currentDate.setDate(currentDate.getDate() + 1);
            sessionId++;
          }
          
          if (sessions.length > 0) {
            setWalkVisitSessions(sessions);
          }
        }
      }
    }
  }, [initialDates]);

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

  const handleDateSelect = (date: Date | undefined, type: 'start' | 'end') => {
    console.log(`=== handleDateSelect called ===`);
    console.log(`Type: ${type}`);
    console.log(`Selected date:`, date);
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
      
      if (!hourlyRate || dogWalkingConfig.selectedDates.length === 0) {
        return 0;
      }
      
      // Calculate: price per session × number of days
      // Session price = hourly_rate × session_duration × number_of_pets
      const pricePerSession = hourlyRate * dogWalkingConfig.sessionDuration * petCount;
      const numberOfDays = dogWalkingConfig.selectedDates.length;
      
      return pricePerSession * numberOfDays;
      
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
    
    // For dog walking, validate dates selected
    if (serviceType === 'dog_walking') {
      if (dogWalkingConfig.selectedDates.length === 0) {
        toast({
          title: 'Missing Information',
          description: 'Please select at least one date for dog walking.',
          variant: 'destructive'
        });
        return;
      }
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

    setLoading(true);

    try {
      const total = calculateTotal();
      
      // Only allow daily reports for overnight pet sitting services
      const allowsDailyReports = serviceType === 'pet_sitting_sitters_home' || serviceType === 'pet_sitting_owners_home';
      
      let bookingData: any = {
        sitterId: sitter.id.toString(),
        serviceType,
        petIds: selectedPetIds,
        specialInstructions,
        totalAmount: total,
        requiresDailyReports: allowsDailyReports ? requiresDailyReports : false
      };
      
      // Add date fields based on service type
      if (serviceType === 'pet_sitting_sitters_home' || serviceType === 'pet_sitting_owners_home') {
        bookingData.startDate = format(startDate!, 'yyyy-MM-dd');
        bookingData.endDate = format(endDate!, 'yyyy-MM-dd');
      } else if (serviceType === 'dog_walking') {
        // For dog walking, use session-based config
        const sortedDates = [...dogWalkingConfig.selectedDates].sort((a, b) => a.getTime() - b.getTime());
        bookingData.startDate = format(sortedDates[0], 'yyyy-MM-dd');
        bookingData.endDate = format(sortedDates[sortedDates.length - 1], 'yyyy-MM-dd');
        bookingData.dogWalkingConfig = {
          sessionDuration: dogWalkingConfig.sessionDuration,
          selectedDates: dogWalkingConfig.selectedDates.map(d => format(d, 'yyyy-MM-dd'))
        };
      } else if (serviceType === 'drop_in_visits') {
        // For visits, store all visit sessions
        const sortedSessions = [...walkVisitSessions].sort((a, b) => a.date.getTime() - b.date.getTime());
        bookingData.startDate = format(sortedSessions[0].date, 'yyyy-MM-dd');
        bookingData.endDate = format(sortedSessions[sortedSessions.length - 1].date, 'yyyy-MM-dd');
        bookingData.walkVisitSessions = walkVisitSessions.map(s => ({
          date: format(s.date, 'yyyy-MM-dd')
        }));
      }

      console.log('Sending booking data:', bookingData);

      const { data, error } = await supabase.functions.invoke('create-booking', {
        body: bookingData
      });

      if (error) throw error;

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
    setEndTime('17:00');
    setServiceType('');
    setSpecialInstructions('');
    setRequiresDailyReports(false);
    setAgreedToTerms(false);
    setSelectedPetIds([]);
    setDogWalkingConfig({ sessionDuration: 1, selectedDates: [] });
    setWalkVisitSessions([{ id: '1', date: new Date() }]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const total = calculateTotal();
  
  // GST is included in the price (15% GST in NZ)
  // So if total is $100, the GST component is $13.04 (100/1.15 * 0.15)
  const serviceCostExGST = total / 1.15;
  const gstAmount = total - serviceCostExGST;
  
  // Platform fee is 10% of the service cost (ex GST)
  const platformFee = serviceCostExGST * 0.1;
  const platformFeeGST = platformFee * 0.15;
  const platformFeeIncGST = platformFee + platformFeeGST;
  
  // Grand total = service cost (inc GST) + platform fee (inc GST)
  const grandTotal = total + platformFeeIncGST;

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

          {/* Date Selection - Only for pet sitting */}
          {serviceType && (serviceType === 'pet_sitting_sitters_home' || serviceType === 'pet_sitting_owners_home') && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-sm font-medium">Start Date *</label>
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
                        return date < today;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

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
                        return date < minDate;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Dog Walking Configuration */}
          {serviceType === 'dog_walking' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="text-sm font-medium">Session Duration *</label>
                <Select 
                  value={dogWalkingConfig.sessionDuration.toString()} 
                  onValueChange={(value) => setDogWalkingConfig(prev => ({ ...prev, sessionDuration: parseFloat(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">30 minutes</SelectItem>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Select Walking Dates *</label>
                <Calendar
                  mode="multiple"
                  selected={dogWalkingConfig.selectedDates}
                  onSelect={(dates) => setDogWalkingConfig(prev => ({ ...prev, selectedDates: dates || [] }))}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                  className="rounded-md border"
                />
                {dogWalkingConfig.selectedDates.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {dogWalkingConfig.selectedDates.length} {dogWalkingConfig.selectedDates.length === 1 ? 'day' : 'days'} selected
                  </p>
                )}
              </div>

              {dogWalkingConfig.selectedDates.length > 0 && selectedPetIds.length > 0 && (
                <Card className="p-4 bg-muted/50">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Session duration:</span>
                      <span className="font-medium">{dogWalkingConfig.sessionDuration === 0.5 ? '30 min' : `${dogWalkingConfig.sessionDuration} hour${dogWalkingConfig.sessionDuration > 1 ? 's' : ''}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Number of pets:</span>
                      <span className="font-medium">{selectedPetIds.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Number of days:</span>
                      <span className="font-medium">{dogWalkingConfig.selectedDates.length}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-base font-semibold">
                      <span>Price per session:</span>
                      <span>${(servicesData.find(s => s.service_type === 'dog_walking')?.hourly_rate || 0) * dogWalkingConfig.sessionDuration * selectedPetIds.length}</span>
                    </div>
                    <div className="flex justify-between text-base font-semibold text-primary">
                      <span>Total for {dogWalkingConfig.selectedDates.length} days:</span>
                      <span>${calculateTotal()}</span>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

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
                                return date < today;
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

          {/* Agreement Download - Only for pet sitting in owner's home */}
          {serviceType === 'pet_sitting_owners_home' && (
            <Card className="border-2 border-blue-200 bg-blue-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Recommended: House & Pet Sitting Agreement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  We strongly recommend completing a short agreement between you and the sitter to confirm terms, responsibilities, and care instructions.
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = '/templates/House_Pet_Sitting_Agreement_NZ_Template.docx';
                      link.download = 'House_Pet_Sitting_Agreement_NZ_Template.docx';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      toast({
                        title: "Template Downloaded",
                        description: "Please print, complete, and sign this agreement with your sitter for your records.",
                      });
                    }}
                  >
                    📄 Download Agreement Template
                  </Button>
                  <p className="text-xs text-muted-foreground italic">
                    Print and complete this form with your sitter outside of the platform. Keep it for your records.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

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
                    {/* Dog walking summary */}
                    <div className="flex justify-between">
                      <span>Session Duration</span>
                      <span>{dogWalkingConfig.sessionDuration === 0.5 ? '30 min' : `${dogWalkingConfig.sessionDuration} hour${dogWalkingConfig.sessionDuration > 1 ? 's' : ''}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Number of Days</span>
                      <span>{dogWalkingConfig.selectedDates.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pets</span>
                      <span>{selectedPetIds.length}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Rate</span>
                      <span>${servicesData.find(s => s.service_type === serviceType)?.hourly_rate || 0}/hour/pet</span>
                    </div>
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
                
                <div className="flex justify-between">
                  <span>Platform Fee (inc GST)</span>
                  <span>${platformFeeIncGST.toFixed(2)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total (inc GST)</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
                
                <div className="text-xs text-muted-foreground text-right">
                  Total GST: ${(gstAmount + platformFeeGST).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button variant="outline" onClick={handleClose} className="w-full sm:flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleBooking} 
              disabled={!startDate || !endDate || !serviceType || loading}
              className="w-full sm:flex-1"
            >
              {loading ? 'Creating Booking...' : 'Send Booking Request'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}