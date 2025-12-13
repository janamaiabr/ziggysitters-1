import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, differenceInHours, differenceInDays } from 'date-fns';
import { CalendarIcon, Clock, DollarSign, MapPin, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingAccordionProps {
  sitter: {
    id: string;
    name: string;
    location: string;
    hourlyRate: number;
    services: string[];
    avatar: string;
  };
  servicesData?: any[]; // Add real services data
  isOpen?: boolean;
  onBookingComplete?: () => void;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialServiceType?: string;
}

const serviceRates = {
  'pet_sitting_sitters_home': 66.00, // per day
  'pet_sitting_owners_home': 55.00,  // per day
  'drop_in_visits': 27.50,           // per hour
  'dog_walking': 25.00,              // per hour
};

const serviceLabels = {
  'pet_sitting_sitters_home': 'Pet Sitting (Sitter\'s Home)',
  'pet_sitting_owners_home': 'Pet Sitting (Your Home)', 
  'drop_in_visits': 'Drop-in Visits',
  'dog_walking': 'Dog Walking',
};

const serviceUnits = {
  'pet_sitting_sitters_home': 'day',
  'pet_sitting_owners_home': 'day',
  'drop_in_visits': 'hour',
  'dog_walking': 'hour',
};

export default function BookingAccordion({ 
  sitter, 
  servicesData = [], 
  isOpen = false, 
  onBookingComplete,
  initialCheckIn,
  initialCheckOut,
  initialServiceType
}: BookingAccordionProps) {
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
          toast({
            title: "Not Available",
            description: "Pet sitters cannot book other sitters.",
            variant: "destructive",
          });
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

  // Debug logging to verify dates are being received
  useEffect(() => {
    console.log('BookingAccordion initialized with:', {
      initialCheckIn,
      initialCheckOut,
      initialServiceType,
      startDate,
      endDate,
      serviceType
    });
  }, []);

  const handleDateSelect = (date: Date | undefined, type: 'start' | 'end') => {
    if (type === 'start') {
      setStartDate(date);
      if (date && endDate && endDate < date) {
        setEndDate(undefined);
      }
    } else {
      setEndDate(date);
    }
  };

  const calculateTotal = () => {
    // Try to find the service in real data first
    const realService = servicesData.find(s => s.service_type === serviceType);
    
    console.log('🔥 ACCORDION CALCULATE TOTAL V2 🔥', { serviceType, realService });
    
    if (realService) {
      // DOG WALKING - Hourly with optional repeat
      if (serviceType === 'dog_walking' && realService.hourly_rate) {
        if (!startTime || !endTime) return 0;
        
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        let startMinutes = startHour * 60 + startMin;
        let endMinutes = endHour * 60 + endMin;
        
        // Handle crossing midnight
        if (endMinutes <= startMinutes) {
          endMinutes += 24 * 60;
        }
        
        let durationHours = (endMinutes - startMinutes) / 60;
        durationHours = Math.max(0.5, Math.round(durationHours * 2) / 2);
        
        // Calculate days booked
        let daysBooked = 1;
        if (repeatAcrossDays && startDate && endDate) {
          daysBooked = Math.max(1, differenceInDays(endDate, startDate));
        }
        
        const total = durationHours * realService.hourly_rate * daysBooked;
        console.log('Dog walking calc:', { durationHours, daysBooked, repeatAcrossDays, total });
        return total;
      }
      
      // OTHER HOURLY SERVICES (drop-in visits)
      if (realService.hourly_rate && startTime && endTime) {
        if (!startDate || !endDate) return 0;
        const startDateTime = new Date(startDate);
        startDateTime.setHours(parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1]));
        
        const endDateTime = new Date(endDate);
        endDateTime.setHours(parseInt(endTime.split(':')[0]), parseInt(endTime.split(':')[1]));
        
        const hours = Math.max(1, differenceInHours(endDateTime, startDateTime));
        return hours * realService.hourly_rate;
      }
      
      // DAILY/OVERNIGHT SERVICES (pet sitting)
      if (realService.daily_rate || realService.overnight_rate) {
        if (!startDate || !endDate) return 0;
        const rate = realService.daily_rate || realService.overnight_rate;
        // Add 1 because we need to count both start and end dates (e.g., Oct 19-20 = 2 days)
        const totalDays = Math.max(1, differenceInDays(endDate, startDate) + 1);
        return totalDays * rate;
      }
    }
    
    return 0;
  };

  const handleBooking = async () => {
    console.log('=== handleBooking called ===');
    console.log('User:', user);
    console.log('Start date:', startDate);
    console.log('End date:', endDate);
    console.log('Service type:', serviceType);
    console.log('Agreed to terms:', agreedToTerms);
    
    if (!user) {
      console.log('No user, redirecting to auth');
      navigate('/auth');
      return;
    }

    if (!startDate || !endDate || !serviceType) {
      console.log('Missing required fields');
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    if (!agreedToTerms) {
      console.log('Terms not agreed');
      toast({
        title: 'Agreement Required',
        description: 'Please agree to the booking terms and conditions.',
        variant: 'destructive'
      });
      return;
    }

    // Check selected pets
    if (selectedPetIds.length === 0) {
      toast({
        title: 'No Pets Selected',
        description: 'Please select at least one pet for this booking.',
        variant: 'destructive'
      });
      return;
    }

    console.log('Setting loading to true');
    setLoading(true);

    try {
      const total = calculateTotal();
      console.log('Calculated total:', total);
      
      // Only allow daily reports for overnight pet sitting services
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

      console.log('Booking data:', bookingData);
      console.log('Calling create-booking function...');

      const { data, error } = await supabase.functions.invoke('create-booking', {
        body: bookingData
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Function returned error:', error);
        // Extract error message from the response body if available
        const errorMessage = (data as any)?.error || error.message || 'Failed to create booking';
        throw new Error(errorMessage);
      }

      // Check if the response contains an error in the data
      if (data && (data as any).error) {
        throw new Error((data as any).error);
      }

      // Booking created successfully - payment will be requested after sitter accepts
      console.log('Booking created successfully:', data);
      toast({
        title: 'Booking Request Sent!',
        description: data?.message || 'Your booking has been sent to the sitter. You will be notified when they accept, and then you can complete payment.',
        duration: 8000,
      });
      
      // Call the callback to redirect to bookings after successful booking creation
      if (onBookingComplete) {
        setTimeout(() => {
          onBookingComplete();
        }, 1000);
      }
    } catch (error: any) {
      console.error('=== Booking error ===');
      console.error('Error object:', error);
      console.error('Error message:', error?.message);
      console.error('Error details:', error?.error);
      
      // Extract error message from the response
      const errorMessage = error?.message || error?.error || 'There was an error creating your booking. Please try again.';
      
      toast({
        title: 'Booking Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setStartTime('09:00');
    setEndTime('10:00');
    setServiceType('');
    setSpecialInstructions('');
    setRequiresDailyReports(true);
    setAgreedToTerms(false);
    setRepeatAcrossDays(false);
  };

  const total = calculateTotal();
  const platformFee = Math.round(total * 0.1 * 100) / 100;
  const sitterAmount = total - platformFee;
  const grandTotal = total; // Total stays the same, platform fee comes out of sitter's portion

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
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
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Accordion 
          type="single" 
          collapsible 
          defaultValue={isOpen ? "booking-form" : undefined}
          onValueChange={(value) => console.log('Accordion value changed to:', value)}
        >
          <AccordionItem value="booking-form">
            <AccordionTrigger 
              className="text-lg font-medium"
              onClick={() => console.log('Accordion trigger clicked')}
            >
              Book Your Service
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              {/* Service Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Service Type *</label>
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicesData.length > 0 ? (
                      servicesData.map((service) => {
                        const getServiceDisplayName = (type: string) => {
                          switch (type) {
                            case 'dog_walking': return 'Dog Walking';
                            case 'pet_sitting_owners_home': return 'Pet Sitting (Your Home)';
                            case 'pet_sitting_sitters_home': return 'Pet Sitting (Sitter\'s Home)';
                            case 'drop_in_visits': return 'Drop-in Visits';
                            default: return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                          }
                        };

                        const getRate = () => {
                          if (service.hourly_rate) return `$${service.hourly_rate.toFixed(2)}/hour`;
                          if (service.daily_rate) return `$${service.daily_rate.toFixed(2)}/day`;
                          return 'Contact for pricing';
                        };

                        return (
                          <SelectItem key={service.id} value={service.service_type}>
                            <div className="flex justify-between w-full">
                              <span>{getServiceDisplayName(service.service_type)}</span>
                              <span className="text-muted-foreground ml-4">
                                {getRate()}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })
                    ) : (
                      // Fallback to standard services
                      Object.entries(serviceLabels).map(([key, label]) => {
                        const rate = serviceRates[key as keyof typeof serviceRates];
                        const unit = serviceUnits[key as keyof typeof serviceUnits];
                        return (
                          <SelectItem key={key} value={key}>
                            <div className="flex justify-between w-full">
                              <span>{label}</span>
                              <span className="text-muted-foreground ml-4">
                                ${rate}/{unit}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Start Date *</label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="date"
                        value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : undefined;
                          handleDateSelect(date, 'start');
                        }}
                        className="pl-10 h-12 text-base"
                        style={{ WebkitAppearance: 'none' }}
                        min={format(new Date(), 'yyyy-MM-dd')}
                      />
                    </div>
                    {startDate && (
                      <p className="text-sm text-primary font-medium">
                        Selected: {format(startDate, 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>

                  {/* Only show end date for pet sitting OR if dog walking repeat is enabled */}
                  {(serviceType !== 'dog_walking' || repeatAcrossDays) && (
                    <div className="space-y-3">
                      <label className="text-sm font-medium">End Date *</label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                          type="date"
                          value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : undefined;
                            handleDateSelect(date, 'end');
                          }}
                          className="pl-10 h-12 text-base"
                          style={{ WebkitAppearance: 'none' }}
                          min={startDate ? format(startDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                        />
                      </div>
                      {endDate && (
                        <p className="text-sm text-primary font-medium">
                          Selected: {format(endDate, 'MMM dd, yyyy')}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Repeat toggle - Only for dog walking */}
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

              {/* Time Selection - Only for hourly services */}
              {(() => {
                const realService = servicesData.find(s => s.service_type === serviceType);
                const isHourlyService = realService?.hourly_rate || serviceType === 'dog_walking' || serviceType === 'drop_in_visits';
                return isHourlyService && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Start Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">End Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                );
              })()}

              {/* Pet Selection - or prompt to add pet */}
              {ownerPets.length > 0 ? (
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
              ) : (
                <Card className="p-6 border-2 border-dashed border-primary/30 bg-primary/5">
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Add Your Pet First</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        To book a sitter, you need to add your pet's details. This helps sitters prepare for their care.
                      </p>
                    </div>
                    <Button 
                      onClick={() => navigate('/profile?tab=pets&addPet=true')}
                      className="w-full"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Add Your Pet Now
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Takes less than 2 minutes
                    </p>
                  </div>
                </Card>
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
                    I understand that this booking is subject to ZiggySitters'{' '}
                    <a 
                      href="/terms-of-service" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      terms of service
                    </a>
                    {' '}and cancellation policy. 
                    The sitter agrees to provide the selected service, and I agree to pay the stated amount.
                  </p>
                </div>
              </div>

              {/* Booking Summary */}
              {total > 0 && (
                <Card className="bg-muted/50">
                  <CardHeader className="pb-3">
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
                    
                    {(serviceType === 'dog_walking' || serviceType === 'drop_in_visits') && (
                      <div className="flex justify-between">
                        <span>Duration</span>
                        <span>
                          {startTime && endTime ? 
                            Math.max(1, differenceInHours(
                              new Date(`2000-01-01 ${endTime}`), 
                              new Date(`2000-01-01 ${startTime}`)
                            )) + ' hours' 
                            : '1 hour'}
                        </span>
                      </div>
                    )}
                    
                    {(serviceType === 'pet_sitting_sitters_home' || serviceType === 'pet_sitting_owners_home') && (
                      <div className="flex justify-between">
                        <span>Duration</span>
                        <span>
                          {startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0} days
                        </span>
                      </div>
                    )}

                     <div className="flex justify-between">
                       <span>Service Cost</span>
                       <span>${total.toFixed(2)}</span>
                     </div>
                     
                     <div className="flex justify-between text-sm text-green-600">
                       <span>Sitter receives (90%)</span>
                       <span>${sitterAmount.toFixed(2)}</span>
                     </div>
                     
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Listing Fee (10%)</span>
                        <span>${platformFee.toFixed(2)}</span>
                      </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${grandTotal.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button variant="outline" onClick={resetForm} className="w-full sm:flex-1">
                  Reset Form
                </Button>
                <Button 
                  onClick={handleBooking} 
                  disabled={!startDate || !endDate || !serviceType || !agreedToTerms || loading}
                  className="w-full sm:flex-1"
                >
                  {loading ? 'Creating Booking...' : 'Send Booking Request'}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}