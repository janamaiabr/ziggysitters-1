import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { format, addMonths, subMonths, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvailabilityData {
  date: string;
  is_available: boolean;
}

interface PublicAvailabilityCalendarProps {
  sitterId: string;
  sitterName: string;
  onSelectDates?: (startDate: Date, endDate: Date) => void;
}

export default function PublicAvailabilityCalendar({ 
  sitterId, 
  sitterName,
  onSelectDates 
}: PublicAvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState<AvailabilityData[]>([]);
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailabilityData();
  }, [currentDate, sitterId]);

  const fetchAvailabilityData = async () => {
    setLoading(true);
    try {
      const startDate = startOfMonth(currentDate);
      const endDate = endOfMonth(addMonths(currentDate, 1)); // Load 2 months

      // Fetch availability settings (public via RLS)
      const { data: availData } = await supabase
        .from('sitter_availability')
        .select('date, is_available')
        .eq('sitter_id', sitterId)
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'));

      if (availData) {
        setAvailability(availData);
      }

      // Fetch bookings to show blocked dates (public can see booking exists, not details)
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('start_date, end_date')
        .eq('sitter_id', sitterId)
        .in('status', ['confirmed', 'awaiting_payment', 'in_progress'])
        .lte('start_date', format(endDate, 'yyyy-MM-dd'))
        .gte('end_date', format(startDate, 'yyyy-MM-dd'));

      if (bookingsData) {
        const booked = new Set<string>();
        bookingsData.forEach(booking => {
          let current = new Date(booking.start_date);
          const end = new Date(booking.end_date);
          while (current <= end) {
            booked.add(format(current, 'yyyy-MM-dd'));
            current.setDate(current.getDate() + 1);
          }
        });
        setBookedDates(booked);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const getDateStatus = (date: Date): 'available' | 'unavailable' | 'booked' => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Check if booked first
    if (bookedDates.has(dateStr)) {
      return 'booked';
    }
    
    // Check manual availability
    const availRecord = availability.find(a => a.date === dateStr);
    if (availRecord) {
      return availRecord.is_available ? 'available' : 'unavailable';
    }
    
    // Default is available
    return 'available';
  };

  const getDayClassName = (date: Date) => {
    const status = getDateStatus(date);
    const isPast = date < new Date(new Date().setHours(0,0,0,0));
    
    if (isPast) {
      return "opacity-40 cursor-not-allowed";
    }
    
    switch (status) {
      case 'booked':
        return "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400";
      case 'unavailable':
        return "bg-red-50 dark:bg-red-950/50 text-red-400 dark:text-red-500 line-through";
      case 'available':
        return "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 cursor-pointer";
      default:
        return "";
    }
  };

  // Count available days in current month
  const countAvailableDays = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    let count = 0;
    let current = new Date(start);
    
    while (current <= end) {
      if (current >= new Date() && getDateStatus(current) === 'available') {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  const availableDays = countAvailableDays();

  return (
    <div className="space-y-4">
      {/* Header with availability summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">{sitterName.split(' ')[0]}'s Availability</h3>
        </div>
        <Badge variant={availableDays > 10 ? "default" : availableDays > 0 ? "secondary" : "destructive"}>
          {availableDays} days available
        </Badge>
      </div>

      {/* Calendar navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('prev')}
          disabled={currentDate <= new Date()}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="font-medium">{format(currentDate, 'MMMM yyyy')}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('next')}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {/* Day headers */}
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="p-1 text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {Array.from({ length: 42 }, (_, i) => {
            const startOfMonthDate = startOfMonth(currentDate);
            const startOfCalendar = new Date(startOfMonthDate);
            startOfCalendar.setDate(startOfCalendar.getDate() - startOfCalendar.getDay());
            
            const currentDay = new Date(startOfCalendar);
            currentDay.setDate(currentDay.getDate() + i);
            
            const isCurrentMonth = currentDay.getMonth() === currentDate.getMonth();
            const isToday = isSameDay(currentDay, new Date());
            const status = getDateStatus(currentDay);
            
            if (!isCurrentMonth) {
              return <div key={i} className="h-8" />;
            }
            
            return (
              <div
                key={i}
                className={cn(
                  "h-8 flex items-center justify-center rounded text-xs font-medium transition-colors",
                  getDayClassName(currentDay),
                  isToday && "ring-1 ring-primary"
                )}
              >
                {format(currentDay, 'd')}
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground pt-2 border-t">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700" />
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800" />
          <span>Unavailable</span>
        </div>
      </div>

      {/* No login required message */}
      <p className="text-xs text-center text-muted-foreground">
        📅 View real-time availability without signing up
      </p>
    </div>
  );
}
