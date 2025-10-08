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
  'dog-walking': 27.50,     // per service
  'pet-sitting': 55.00,     // per day
  'overnight-care': 75.00,  // per night
  'drop-in-visits': 27.50,  // per service
  'pet-boarding': 75.00,    // per night
  'grooming': 27.50,        // per service
};

const serviceLabels = {
  'dog-walking': 'Dog Walking',
  'pet-sitting': 'Pet Sitting', 
  'overnight-care': 'Overnight Care',
  'drop-in-visits': 'Drop-in Visits',
  'pet-boarding': 'Pet Boarding',
  'grooming': 'Grooming',
};

const serviceUnits = {
  'dog-walking': 'service',
  'pet-sitting': 'day',
  'overnight-care': 'night',
  'drop-in-visits': 'service',
  'pet-boarding': 'night',
  'grooming': 'service',
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
  const [endTime, setEndTime] = useState('17:00');
  const [serviceType, setServiceType] = useState(initialServiceType || '');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [requiresDailyReports, setRequiresDailyReports] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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
    if (!startDate || !endDate || !serviceType) return 0;
    
    // Try to find the service in real data first
    const realService = servicesData.find(s => s.service_type === serviceType);
    if (realService) {
      if (serviceType === 'dog_walking' || serviceType === 'pet_care') {
        return realService.hourly_rate || realService.daily_rate || 0;
      } else if (serviceType === 'pet_sitting_owners_home' || serviceType === 'pet_sitting_sitters_home' || serviceType === 'daycare') {
        const days = Math.max(1, differenceInDays(endDate, startDate) + 1);
        return days * (realService.daily_rate || realService.hourly_rate || 0);
      } else if (serviceType === 'overnight_boarding') {
        const nights = Math.max(1, differenceInDays(endDate, startDate));
        return nights * (realService.overnight_rate || realService.daily_rate || 0);
      }
    }
    
    // Fallback to hardcoded rates
    const rate = serviceRates[serviceType as keyof typeof serviceRates];
    if (!rate) return 0;

    if (serviceType === 'dog-walking' || serviceType === 'drop-in-visits' || serviceType === 'grooming') {
      return 1 * rate;
    } else if (serviceType === 'pet-sitting') {
      const days = Math.max(1, differenceInDays(endDate, startDate) + 1);
      return days * rate;
    } else if (serviceType === 'overnight-care' || serviceType === 'pet-boarding') {
      const nights = Math.max(1, differenceInDays(endDate, startDate));
      return nights * rate;
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

    console.log('Setting loading to true');
    setLoading(true);

    try {
      const total = calculateTotal();
      console.log('Calculated total:', total);
      
      const bookingData = {
        sitterId: sitter.id,
        serviceType,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        startTime: (serviceType === 'dog-walking' || serviceType === 'drop-in-visits') ? startTime : undefined,
        endTime: (serviceType === 'dog-walking' || serviceType === 'drop-in-visits') ? endTime : undefined,
        petIds: [],
        specialInstructions,
        totalAmount: total,
        requiresDailyReports
      };

      console.log('Booking data:', bookingData);
      console.log('Calling create-booking function...');

      const { data, error } = await supabase.functions.invoke('create-booking', {
        body: bookingData
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Function returned error:', error);
        throw error;
      }

      if (data?.requires_payment_setup) {
        console.log('Booking created, payment setup required');
        // Booking created but sitter needs to complete Stripe setup
        toast({
          title: 'Booking Created',
          description: `Your booking (${data.booking_reference}) has been created! However, ${data.sitter_name} needs to complete their payment setup before payment can be processed. They will be notified to complete this step.`,
          duration: 8000,
        });
        
        // Call the callback to redirect to bookings after successful booking creation
        if (onBookingComplete) {
          setTimeout(() => {
            onBookingComplete();
          }, 1000);
        }
      } else if (data?.url) {
        console.log('Redirecting to Stripe checkout URL:', data.url);
        // Redirect to Stripe checkout in the same window
        window.location.href = data.url;
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
    setEndTime('17:00');
    setServiceType('');
    setSpecialInstructions('');
    setRequiresDailyReports(true);
    setAgreedToTerms(false);
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
                            case 'daycare': return 'Pet Sitting';
                            case 'overnight_boarding': return 'Overnight Care';
                            case 'pet_sitting_owners_home': return 'Pet Sitting in Owner\'s Home';
                            case 'pet_sitting_sitters_home': return 'Pet Sitting in Sitter\'s Home';
                            case 'pet_care': return 'Pet Care';
                            default: return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                          }
                        };

                        const getRate = () => {
                          if (service.hourly_rate) return `$${service.hourly_rate.toFixed(2)}/hour`;
                          if (service.daily_rate) return `$${service.daily_rate.toFixed(2)}/day`;
                          if (service.overnight_rate) return `$${service.overnight_rate.toFixed(2)}/night`;
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
                      // Fallback to hardcoded services if no real data
                      sitter.services.map((service) => {
                        const serviceKey = service.toLowerCase().replace(' ', '-');
                        const rate = serviceRates[serviceKey as keyof typeof serviceRates];
                        const unit = serviceUnits[serviceKey as keyof typeof serviceUnits];
                        return (
                          <SelectItem key={serviceKey} value={serviceKey}>
                            <div className="flex justify-between w-full">
                              <span>{service}</span>
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
              </div>

              {/* Time Selection - Only for dog walking */}
              {serviceType && serviceType === 'dog-walking' && (
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

              {/* Daily Reports Option */}
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
                    Get daily updates with photos and detailed information about your pet's activities, meals, mood, and wellbeing during their stay.
                  </p>
                  <p className="text-xs font-medium text-primary mt-2">
                    💡 Note: If the sitter doesn't provide the requested daily reports, they may receive a reduced payment.
                  </p>
                </div>
              </div>

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
                    
                    {(serviceType === 'dog-walking' || serviceType === 'drop-in-visits' || serviceType === 'grooming') && (
                      <div className="flex justify-between">
                        <span>Duration</span>
                        <span>1 service</span>
                      </div>
                    )}
                    
                    {serviceType === 'pet-sitting' && (
                      <div className="flex justify-between">
                        <span>Duration</span>
                        <span>
                          {startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0} days
                        </span>
                      </div>
                    )}
                    
                    {(serviceType === 'overnight-care' || serviceType === 'pet-boarding') && (
                      <div className="flex justify-between">
                        <span>Duration</span>
                        <span>
                          {startDate && endDate ? differenceInDays(endDate, startDate) : 0} nights
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
              <div className="flex gap-3">
                <Button variant="outline" onClick={resetForm} className="flex-1">
                  Reset Form
                </Button>
                <Button 
                  onClick={handleBooking} 
                  disabled={!startDate || !endDate || !serviceType || !agreedToTerms || loading}
                  className="flex-1"
                >
                  {loading ? 'Creating Booking...' : `Pay with Stripe - $${grandTotal.toFixed(2)}`}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}