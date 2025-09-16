import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { format, isSameDay } from 'date-fns';
import { CalendarDays, Plus, X } from 'lucide-react';

interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  service_type: string;
  owner_id: string;
  status: string;
  booking_reference: string;
}

interface Availability {
  id: string;
  date: string;
  is_available: boolean;
  notes?: string;
}

export default function SitterCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);
  const [availabilityNotes, setAvailabilityNotes] = useState('');
  const [dateToUpdate, setDateToUpdate] = useState<Date | null>(null);
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.id) {
      fetchBookings();
      fetchAvailability();
    }
  }, [profile?.id]);

  const fetchBookings = async () => {
    if (!profile?.id) return;
    
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('sitter_id', profile.id)
      .in('status', ['pending', 'confirmed', 'in_progress']);

    if (error) {
      console.error('Error fetching bookings:', error);
    } else {
      setBookings(data || []);
    }
  };

  const fetchAvailability = async () => {
    if (!profile?.id) return;
    
    const { data, error } = await supabase
      .from('sitter_availability')
      .select('*')
      .eq('sitter_id', profile.id);

    if (error) {
      console.error('Error fetching availability:', error);
    } else {
      setAvailability(data || []);
    }
  };

  const getDateStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Check for bookings
    const booking = bookings.find(b => {
      const startDate = new Date(b.start_date);
      const endDate = new Date(b.end_date);
      return date >= startDate && date <= endDate;
    });

    if (booking) {
      return { type: 'booking', data: booking };
    }

    // Check availability
    const avail = availability.find(a => a.date === dateStr);
    if (avail) {
      return { type: 'availability', data: avail };
    }

    return { type: 'none', data: null };
  };

  const updateAvailability = async (date: Date, isAvailable: boolean, notes: string = '') => {
    if (!profile?.id) return;

    const dateStr = format(date, 'yyyy-MM-dd');
    const existingAvail = availability.find(a => a.date === dateStr);

    if (existingAvail) {
      const { error } = await supabase
        .from('sitter_availability')
        .update({ 
          is_available: isAvailable, 
          notes: notes.trim() || null 
        })
        .eq('id', existingAvail.id);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update availability',
          variant: 'destructive'
        });
      }
    } else {
      const { error } = await supabase
        .from('sitter_availability')
        .insert({
          sitter_id: profile.id,
          date: dateStr,
          is_available: isAvailable,
          notes: notes.trim() || null
        });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to set availability',
          variant: 'destructive'
        });
      }
    }

    fetchAvailability();
    setShowAvailabilityDialog(false);
    setAvailabilityNotes('');
    setDateToUpdate(null);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const status = getDateStatus(date);
    
    if (status.type === 'booking') {
      // Show booking details
      return;
    }
    
    // Open availability dialog
    setDateToUpdate(date);
    const avail = status.type === 'availability' ? status.data as Availability : null;
    setAvailabilityNotes(avail?.notes || '');
    setShowAvailabilityDialog(true);
  };

  const modifiers = {
    booking: (date: Date) => {
      return bookings.some(b => {
        const startDate = new Date(b.start_date);
        const endDate = new Date(b.end_date);
        return date >= startDate && date <= endDate;
      });
    },
    unavailable: (date: Date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const avail = availability.find(a => a.date === dateStr);
      return avail && !avail.is_available;
    },
    available: (date: Date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const avail = availability.find(a => a.date === dateStr);
      return avail && avail.is_available;
    }
  };

  const modifiersStyles = {
    booking: { 
      backgroundColor: 'hsl(var(--primary))', 
      color: 'hsl(var(--primary-foreground))',
      fontWeight: 'bold'
    },
    unavailable: { 
      backgroundColor: 'hsl(var(--destructive))', 
      color: 'hsl(var(--destructive-foreground))' 
    },
    available: { 
      backgroundColor: 'hsl(var(--success))', 
      color: 'white' 
    }
  };

  const selectedDateBookings = selectedDate ? bookings.filter(b => {
    const startDate = new Date(b.start_date);
    const endDate = new Date(b.end_date);
    return selectedDate >= startDate && selectedDate <= endDate;
  }) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Your Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            onDayClick={handleDateClick}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="rounded-md border"
          />
          
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-primary"></div>
              <span className="text-sm">Bookings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-destructive"></div>
              <span className="text-sm">Unavailable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-green-500"></div>
              <span className="text-sm">Available</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a date'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedDate && (
            <>
              {selectedDateBookings.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium">Bookings:</h4>
                  {selectedDateBookings.map(booking => (
                    <div key={booking.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">
                          {booking.booking_reference}
                        </Badge>
                        <Badge variant={
                          booking.status === 'confirmed' ? 'default' : 
                          booking.status === 'pending' ? 'secondary' : 'outline'
                        }>
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {booking.service_type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No bookings for this date</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => handleDateClick(selectedDate)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Set Availability
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Availability Dialog */}
      <Dialog open={showAvailabilityDialog} onOpenChange={setShowAvailabilityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Set Availability for {dateToUpdate && format(dateToUpdate, 'EEEE, MMMM d')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea 
                value={availabilityNotes}
                onChange={(e) => setAvailabilityNotes(e.target.value)}
                placeholder="Any special notes for this date..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="destructive"
                onClick={() => dateToUpdate && updateAvailability(dateToUpdate, false, availabilityNotes)}
                className="flex-1"
              >
                Mark Unavailable
              </Button>
              <Button 
                onClick={() => dateToUpdate && updateAvailability(dateToUpdate, true, availabilityNotes)}
                className="flex-1"
              >
                Mark Available
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}