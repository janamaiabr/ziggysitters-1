import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';
import { format, isSameDay, parseISO, startOfDay, addDays, eachDayOfInterval } from 'date-fns';
import { CalendarDays, Plus, X, CheckCircle, Clock, AlertCircle, Ban, Eye, Calendar as CalIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  service_type: string;
  owner_id: string;
  status: string;
  booking_reference: string;
  total_amount: number;
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
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [availabilityNotes, setAvailabilityNotes] = useState('');
  const [dateToUpdate, setDateToUpdate] = useState<Date | null>(null);
  const [blockMode, setBlockMode] = useState<'single' | 'range'>('single');
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();

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
      .in('status', ['pending', 'confirmed', 'in_progress', 'awaiting_payment', 'completed', 'cancelled']);

    if (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your bookings',
        variant: 'destructive'
      });
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
    
    // Check for bookings (prioritize confirmed, then others)
    const dateBookings = bookings.filter(b => {
      const checkDate = startOfDay(date);
      const startDate = startOfDay(parseISO(b.start_date));
      const endDate = startOfDay(parseISO(b.end_date));
      return checkDate >= startDate && checkDate <= endDate;
    });

    if (dateBookings.length > 0) {
      // Prioritize: confirmed > in_progress > awaiting_payment > pending > cancelled
      const confirmed = dateBookings.find(b => b.status === 'confirmed' || b.status === 'in_progress');
      const awaitingPayment = dateBookings.find(b => b.status === 'awaiting_payment');
      const pending = dateBookings.find(b => b.status === 'pending');
      const cancelled = dateBookings.find(b => b.status === 'cancelled');
      
      const booking = confirmed || awaitingPayment || pending || cancelled;
      return { type: 'booking', data: booking, status: booking?.status };
    }

    // Check availability
    const avail = availability.find(a => a.date === dateStr);
    if (avail && !avail.is_available) {
      return { type: 'unavailable', data: avail };
    }

    return { type: 'none', data: null };
  };

  const updateAvailability = async (dates: Date[], isAvailable: boolean, notes: string = '') => {
    if (!profile?.id) return;

    try {
      for (const date of dates) {
        const dateStr = format(date, 'yyyy-MM-dd');
        const existingAvail = availability.find(a => a.date === dateStr);

        if (existingAvail) {
          await supabase
            .from('sitter_availability')
            .update({ 
              is_available: isAvailable, 
              notes: notes.trim() || null 
            })
            .eq('id', existingAvail.id);
        } else {
          await supabase
            .from('sitter_availability')
            .insert({
              sitter_id: profile.id,
              date: dateStr,
              is_available: isAvailable,
              notes: notes.trim() || null
            });
        }
      }

      toast({
        title: 'Success',
        description: `${dates.length} day(s) marked as ${isAvailable ? 'available' : 'unavailable'}`,
      });

      fetchAvailability();
      setShowBlockForm(false);
      setAvailabilityNotes('');
      setDateToUpdate(null);
      setRangeStart(null);
      setRangeEnd(null);
      setBlockMode('single');
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to update availability',
        variant: 'destructive'
      });
    }
  };

  const handleDateClick = (date: Date) => {
    const status = getDateStatus(date);
    
    if (status.type === 'booking') {
      setSelectedBooking(status.data as Booking);
      setShowBlockForm(false);
      return;
    }
    
    setSelectedDate(date);
    setDateToUpdate(date);
    const avail = status.type === 'unavailable' ? status.data as Availability : null;
    setAvailabilityNotes(avail?.notes || '');
    setBlockMode('single');
    setRangeStart(null);
    setRangeEnd(null);
    setShowBlockForm(true);
    setSelectedBooking(null);
  };

  const handleBlockRange = () => {
    if (!rangeStart || !rangeEnd) return;
    
    const dates = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
    updateAvailability(dates, false, availabilityNotes);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'in_progress':
        return 'bg-green-500 hover:bg-green-600';
      case 'pending':
        return 'bg-amber-500 hover:bg-amber-600';
      case 'awaiting_payment':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'cancelled':
        return 'bg-gray-400 hover:bg-gray-500 line-through';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'in_progress':
        return <CheckCircle className="h-3 w-3" />;
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'awaiting_payment':
        return <AlertCircle className="h-3 w-3" />;
      case 'cancelled':
        return <Ban className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const modifiers = {
    confirmed: (date: Date) => {
      const status = getDateStatus(date);
      return status.type === 'booking' && (status.status === 'confirmed' || status.status === 'in_progress');
    },
    pending: (date: Date) => {
      const status = getDateStatus(date);
      return status.type === 'booking' && status.status === 'pending';
    },
    awaitingPayment: (date: Date) => {
      const status = getDateStatus(date);
      return status.type === 'booking' && status.status === 'awaiting_payment';
    },
    cancelled: (date: Date) => {
      const status = getDateStatus(date);
      return status.type === 'booking' && status.status === 'cancelled';
    },
    unavailable: (date: Date) => {
      const status = getDateStatus(date);
      return status.type === 'unavailable';
    }
  };

  const modifiersStyles = {
    confirmed: { 
      backgroundColor: 'hsl(142 76% 36%)', // green-600
      color: 'white',
      fontWeight: 'bold'
    },
    pending: { 
      backgroundColor: 'hsl(38 92% 50%)', // amber-500
      color: 'white',
      fontWeight: 'bold'
    },
    awaitingPayment: { 
      backgroundColor: 'hsl(217 91% 60%)', // blue-500
      color: 'white',
      fontWeight: 'bold'
    },
    cancelled: { 
      backgroundColor: 'hsl(215 14% 34%)', // gray-600
      color: 'white',
      textDecoration: 'line-through',
      opacity: 0.6
    },
    unavailable: { 
      backgroundColor: 'hsl(0 84% 60%)', // red-500
      color: 'white',
      fontWeight: 'bold'
    }
  };

  const selectedDateBookings = selectedDate ? bookings.filter(b => {
    const checkDate = startOfDay(selectedDate);
    const startDate = startOfDay(parseISO(b.start_date));
    const endDate = startOfDay(parseISO(b.end_date));
    return checkDate >= startDate && checkDate <= endDate;
  }) : [];

  const upcomingBookings = bookings
    .filter(b => ['pending', 'confirmed', 'awaiting_payment', 'in_progress'].includes(b.status))
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Quick Actions Bar */}
      <div className="flex flex-wrap gap-3">
        <Button 
          variant="outline"
          onClick={() => {
            setBlockMode('single');
            setDateToUpdate(new Date());
            setAvailabilityNotes('');
            setShowBlockForm(true);
            setSelectedBooking(null);
          }}
        >
          <Ban className="h-4 w-4 mr-2" />
          Block Single Day
        </Button>
        <Button 
          variant="outline"
          onClick={() => {
            setBlockMode('range');
            setRangeStart(null);
            setRangeEnd(null);
            setAvailabilityNotes('');
            setShowBlockForm(true);
            setSelectedBooking(null);
          }}
        >
          <CalIcon className="h-4 w-4 mr-2" />
          Block Date Range
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Your Calendar
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Click any date to view details or block availability
            </p>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              onDayClick={handleDateClick}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md border pointer-events-auto"
            />
            
            {/* Legend */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-3 text-sm">Calendar Legend</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-green-600"></div>
                  <span className="text-sm">Confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-amber-500"></div>
                  <span className="text-sm">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-blue-500"></div>
                  <span className="text-sm">Awaiting Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-red-500"></div>
                  <span className="text-sm">Blocked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-gray-600 opacity-60"></div>
                  <span className="text-sm">Cancelled Booking</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Details / Block Form / Upcoming Bookings */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              {showBlockForm ? (blockMode === 'single' ? 'Block Single Day' : 'Block Date Range') : selectedBooking ? 'Booking Details' : 'Upcoming Bookings'}
              {(selectedBooking || showBlockForm) && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSelectedBooking(null);
                    setShowBlockForm(false);
                    setAvailabilityNotes('');
                    setRangeStart(null);
                    setRangeEnd(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showBlockForm ? (
              <div className="space-y-4 animate-fade-in">
                {blockMode === 'single' ? (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-1">Selected Date</p>
                    <p className="text-sm text-muted-foreground">
                      {dateToUpdate ? format(dateToUpdate, 'EEEE, MMMM d, yyyy') : 'No date selected'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Start Date</label>
                      <input
                        type="date"
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                        value={rangeStart ? format(rangeStart, 'yyyy-MM-dd') : ''}
                        onChange={(e) => setRangeStart(e.target.value ? new Date(e.target.value) : null)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">End Date</label>
                      <input
                        type="date"
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                        value={rangeEnd ? format(rangeEnd, 'yyyy-MM-dd') : ''}
                        onChange={(e) => setRangeEnd(e.target.value ? new Date(e.target.value) : null)}
                        min={rangeStart ? format(rangeStart, 'yyyy-MM-dd') : undefined}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">Notes (optional)</label>
                  <Textarea 
                    value={availabilityNotes}
                    onChange={(e) => setAvailabilityNotes(e.target.value)}
                    placeholder="E.g., 'On vacation', 'Family emergency', etc."
                    rows={3}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowBlockForm(false);
                      setAvailabilityNotes('');
                      setRangeStart(null);
                      setRangeEnd(null);
                      setBlockMode('single');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      if (blockMode === 'single' && dateToUpdate) {
                        updateAvailability([dateToUpdate], false, availabilityNotes);
                      } else if (blockMode === 'range') {
                        handleBlockRange();
                      }
                    }}
                    className="flex-1"
                    disabled={blockMode === 'range' && (!rangeStart || !rangeEnd)}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Block {blockMode === 'range' ? 'Range' : 'Day'}
                  </Button>
                </div>
              </div>
            ) : selectedBooking ? (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reference</span>
                  <Badge variant="outline">{selectedBooking.booking_reference}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className={`${getStatusColor(selectedBooking.status)} text-white border-0 flex items-center gap-1`}>
                    {getStatusIcon(selectedBooking.status)}
                    {selectedBooking.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Service</span>
                  <span className="text-sm font-medium">
                    {selectedBooking.service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Dates</span>
                  <span className="text-sm font-medium">
                    {format(parseISO(selectedBooking.start_date), 'MMM d')} - {format(parseISO(selectedBooking.end_date), 'MMM d, yyyy')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="text-lg font-bold">${selectedBooking.total_amount}</span>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => navigate(`/booking/${selectedBooking.id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Full Details
                </Button>
              </div>
            ) : upcomingBookings.length > 0 ? (
              <div className="space-y-3">
                {upcomingBookings.map(booking => (
                  <div 
                    key={booking.id} 
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors animate-scale-in"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {booking.booking_reference}
                      </Badge>
                      <Badge 
                        className={`text-xs flex items-center gap-1 ${getStatusColor(booking.status)} text-white border-0`}
                      >
                        {getStatusIcon(booking.status)}
                        {booking.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">
                      {booking.service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(parseISO(booking.start_date), 'MMM d')} - {format(parseISO(booking.end_date), 'MMM d, yyyy')}
                    </p>
                    <p className="text-sm font-semibold mt-2">
                      ${booking.total_amount}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No upcoming bookings</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}