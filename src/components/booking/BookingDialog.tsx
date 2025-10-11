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
import { CalendarIcon, Clock, DollarSign, MapPin, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { metaPixel } from '@/lib/metaPixel';

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
  initialDates?: {
    checkIn?: string;
    checkOut?: string;
    serviceType?: string;
  };
}

const serviceRates = {
  'pet_sitting_sitters_home': 66.00, // per day
  'pet_sitting_owners_home': 55.00,  // per day
  'drop_in_visits': 27.50,           // per hour
};

const serviceLabels = {
  'pet_sitting_sitters_home': 'Pet Sitting in Sitter\'s Home',
  'pet_sitting_owners_home': 'Pet Sitting in Owner\'s Home', 
  'drop_in_visits': 'Drop-in Visits',
};

export default function BookingDialog({ isOpen, onClose, sitter, initialDates }: BookingDialogProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [serviceType, setServiceType] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [requiresDailyReports, setRequiresDailyReports] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
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
    if (!startDate || !endDate || !serviceType) return 0;
    
    const rate = serviceRates[serviceType as keyof typeof serviceRates];
    if (!rate) return 0;

    if (serviceType === 'pet_sitting_sitters_home' || serviceType === 'pet_sitting_owners_home') {
      const days = differenceInDays(endDate, startDate) || 1;
      return Math.max(1, days) * rate;
    } else if (serviceType === 'drop_in_visits') {
      // For drop-in visits, calculate based on time on the same or different days
      const startDateTime = new Date(startDate);
      startDateTime.setHours(parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1]));
      
      const endDateTime = new Date(endDate);
      endDateTime.setHours(parseInt(endTime.split(':')[0]), parseInt(endTime.split(':')[1]));
      
      const hours = differenceInHours(endDateTime, startDateTime);
      return Math.max(1, hours) * rate;
    }
    return 0;
  };

  const handleBooking = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!startDate || !endDate || !serviceType) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
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
      
      const bookingData = {
        sitterId: sitter.id.toString(),
        serviceType,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        startTime: serviceType === 'drop_in_visits' ? startTime : undefined,
        endTime: serviceType === 'drop_in_visits' ? endTime : undefined,
        petIds: [], // This would come from user's pets in a real implementation
        specialInstructions,
        totalAmount: total,
        requiresDailyReports: allowsDailyReports ? requiresDailyReports : false
      };

      console.log('Sending booking data:', bookingData);

      const { data, error } = await supabase.functions.invoke('create-booking', {
        body: bookingData
      });

      if (error) throw error;

      if (data?.requires_payment_setup) {
        // Booking created but sitter needs to complete Stripe setup
        onClose();
        toast({
          title: 'Booking Created',
          description: `Your booking (${data.booking_reference}) has been created! However, ${data.sitter_name} needs to complete their payment setup before payment can be processed. They will be notified to complete this step.`,
          duration: 8000,
        });
      } else if (data?.url) {
        // Track initiate checkout
        metaPixel.trackInitiateCheckout({ value: total, currency: 'NZD' });
        
        // Redirect to Stripe checkout
        window.open(data.url, '_blank');
        onClose();
        toast({
          title: 'Redirecting to Payment',
          description: `Booking reference: ${data.booking_reference}`,
        });
      }
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
    setRequiresDailyReports(true);
    setAgreedToTerms(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const total = calculateTotal();
  const platformFee = Math.round(total * 0.1 * 100) / 100;
  const grandTotal = total;

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
                <SelectItem value="pet_sitting_sitters_home">
                  <div className="flex justify-between w-full">
                    <span>Pet Sitting in Sitter's Home</span>
                    <span className="text-muted-foreground ml-4">$66.00/day</span>
                  </div>
                </SelectItem>
                <SelectItem value="pet_sitting_owners_home">
                  <div className="flex justify-between w-full">
                    <span>Pet Sitting in Owner's Home</span>
                    <span className="text-muted-foreground ml-4">$55.00/day</span>
                  </div>
                </SelectItem>
                <SelectItem value="drop_in_visits">
                  <div className="flex justify-between w-full">
                    <span>Drop-in Visits</span>
                    <span className="text-muted-foreground ml-4">$27.50/hour</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
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
                    {startDate ? (
                      (() => {
                        try {
                          return format(startDate, "PPP");
                        } catch (error) {
                          console.error('Date formatting error:', error);
                          return `Selected: ${startDate.toDateString()}`;
                        }
                      })()
                    ) : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-0" 
                  align="start"
                  side="bottom"
                  sideOffset={4}
                >
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      console.log('Start date selected:', date);
                      handleDateSelect(date, 'start');
                    }}
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
                    {endDate ? (
                      (() => {
                        try {
                          return format(endDate, "PPP");
                        } catch (error) {
                          console.error('Date formatting error:', error);
                          return `Selected: ${endDate.toDateString()}`;
                        }
                      })()
                    ) : "Select end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-0" 
                  align="start"
                  side="bottom"
                  sideOffset={4}
                >
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      console.log('End date selected:', date);
                      handleDateSelect(date, 'end');
                    }}
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

          {/* Time Selection - Only for drop-in visits */}
          {serviceType && serviceType === 'drop_in_visits' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-sm font-medium">Start Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      console.log('Start time changed:', e.target.value);
                      setStartTime(e.target.value);
                    }}
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
                    onChange={(e) => {
                      console.log('End time changed:', e.target.value);
                      setEndTime(e.target.value);
                    }}
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
                
                {(serviceType === 'pet_sitting_sitters_home' || serviceType === 'pet_sitting_owners_home') ? (
                  <div className="flex justify-between">
                    <span>Duration</span>
                    <span>
                      {startDate && endDate ? (differenceInDays(endDate, startDate) || 1) : 1} days
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span>Duration</span>
                    <span>
                      {startDate && endDate ? differenceInHours(
                        new Date(`${format(endDate, 'yyyy-MM-dd')} ${endTime}`),
                        new Date(`${format(startDate, 'yyyy-MM-dd')} ${startTime}`)
                      ) : 0} hours
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Service Cost</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
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
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleBooking} 
              disabled={!startDate || !endDate || !serviceType || loading}
              className="flex-1"
            >
              {loading ? 'Creating Booking...' : `Book Now - $${grandTotal.toFixed(2)}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}