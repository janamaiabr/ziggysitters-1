import React, { useState } from 'react';
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
  isOpen?: boolean;
}

const serviceRates = {
  'dog-walking': 25.00,     // per service
  'pet-sitting': 45.00,     // per day
  'overnight-care': 75.00,  // per night
};

const serviceLabels = {
  'dog-walking': 'Dog Walking',
  'pet-sitting': 'Pet Sitting', 
  'overnight-care': 'Overnight Care',
};

const serviceUnits = {
  'dog-walking': 'service',
  'pet-sitting': 'day',
  'overnight-care': 'night',
};

export default function BookingAccordion({ sitter, isOpen = false }: BookingAccordionProps) {
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
    
    const rate = serviceRates[serviceType as keyof typeof serviceRates];
    if (!rate) return 0;

    if (serviceType === 'dog-walking') {
      // Dog walking is per service - user selects number of services
      return 1 * rate; // For now, assume 1 service. Could add quantity selector later
    } else if (serviceType === 'pet-sitting') {
      // Pet sitting is per day
      const days = Math.max(1, differenceInDays(endDate, startDate) + 1); // +1 to include both start and end day
      return days * rate;
    } else if (serviceType === 'overnight-care') {
      // Overnight care is per night
      const nights = Math.max(1, differenceInDays(endDate, startDate));
      return nights * rate;
    }
    
    return 0;
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
        sitterId: sitter.id,
        serviceType,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        startTime: serviceType === 'dog-walking' ? startTime : undefined,
        endTime: serviceType === 'dog-walking' ? endTime : undefined,
        petIds: [],
        specialInstructions,
        totalAmount: total
      };

      const { data, error } = await supabase.functions.invoke('create-booking', {
        body: bookingData
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
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

  const total = calculateTotal();
  const platformFee = Math.round(total * 0.1 * 100) / 100;
  const grandTotal = total + platformFee;

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
        <Accordion type="single" collapsible defaultValue={isOpen ? "booking-form" : undefined}>
          <AccordionItem value="booking-form">
            <AccordionTrigger className="text-lg font-medium">
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
                    {sitter.services.map((service) => {
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
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Start Date *</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : undefined;
                        handleDateSelect(date, 'start');
                      }}
                      className="pl-10"
                      min={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">End Date *</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : undefined;
                        handleDateSelect(date, 'end');
                      }}
                      className="pl-10"
                      min={startDate ? format(startDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
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
                    
                    {serviceType === 'dog-walking' && (
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
                    
                    {serviceType === 'overnight-care' && (
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
                <Button variant="outline" onClick={resetForm} className="flex-1">
                  Reset Form
                </Button>
                <Button 
                  onClick={handleBooking} 
                  disabled={!startDate || !endDate || !serviceType || loading}
                  className="flex-1"
                >
                  {loading ? 'Creating Booking...' : `Book Now - $${grandTotal.toFixed(2)}`}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}