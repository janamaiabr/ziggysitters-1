import React, { useState } from 'react';
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
}

const serviceRates = {
  'dog-walking': 27.50,
  'pet-sitting': 33.00,
  'overnight-care': 66.00,
};

const serviceLabels = {
  'dog-walking': 'Dog Walking',
  'pet-sitting': 'Pet Sitting', 
  'overnight-care': 'Overnight Care',
};

export default function BookingDialog({ isOpen, onClose, sitter }: BookingDialogProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [serviceType, setServiceType] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleDateSelect = (date: Date | undefined, type: 'start' | 'end') => {
    console.log(`Date selected: ${type}`, date);
    if (type === 'start') {
      setStartDate(date);
      // If end date is before new start date, reset it
      if (date && endDate && endDate < date) {
        setEndDate(undefined);
      }
    } else {
      setEndDate(date);
    }
  };

  const calculateTotal = () => {
    if (!startDate || !endDate || !serviceType) return 0;
    
    const rate = serviceRates[serviceType as keyof typeof serviceRates];
    if (!rate) return 0;

    if (serviceType === 'overnight-care') {
      const nights = differenceInDays(endDate, startDate);
      return Math.max(1, nights) * rate;
    } else {
      const startDateTime = new Date(startDate);
      startDateTime.setHours(parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1]));
      
      const endDateTime = new Date(endDate);
      endDateTime.setHours(parseInt(endTime.split(':')[0]), parseInt(endTime.split(':')[1]));
      
      const hours = differenceInHours(endDateTime, startDateTime);
      return Math.max(1, hours) * rate;
    }
  };

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to book a sitter.',
        variant: 'destructive'
      });
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

    setLoading(true);

    try {
      const total = calculateTotal();
      
      const bookingData = {
        sitterId: sitter.id.toString(),
        serviceType,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        startTime: serviceType !== 'overnight-care' ? startTime : undefined,
        endTime: serviceType !== 'overnight-care' ? endTime : undefined,
        petIds: [], // This would come from user's pets in a real implementation
        specialInstructions,
        totalAmount: total
      };

      console.log('Sending booking data:', bookingData);

      const { data, error } = await supabase.functions.invoke('create-booking', {
        body: bookingData
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe checkout
        window.open(data.url, '_blank');
        onClose();
        toast({
          title: 'Redirecting to Payment',
          description: `Booking reference: ${data.booking_reference}`,
        });
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking Failed',
        description: 'There was an error creating your booking. Please try again.',
        variant: 'destructive'
      });
    } finally {
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
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const total = calculateTotal();
  const platformFee = Math.round(total * 0.1 * 100) / 100;
  const grandTotal = total + platformFee;

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
                {sitter.services.map((service) => {
                  const serviceKey = service.toLowerCase().replace(' ', '-');
                  const rate = serviceRates[serviceKey as keyof typeof serviceRates];
                  return (
                    <SelectItem key={serviceKey} value={serviceKey}>
                      <div className="flex justify-between w-full">
                        <span>{service}</span>
                        <span className="text-muted-foreground ml-4">
                          ${rate}/{serviceKey === 'overnight-care' ? 'night' : 'hour'}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-sm font-medium">Start Date *</label>
              <Popover>
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
              <Popover>
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

          {/* Time Selection - Only for non-overnight services */}
          {serviceType && serviceType !== 'overnight-care' && (
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
                
                {serviceType === 'overnight-care' ? (
                  <div className="flex justify-between">
                    <span>Duration</span>
                    <span>
                      {startDate && endDate ? differenceInDays(endDate, startDate) : 0} nights
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
                  <span>Platform Fee (10%)</span>
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