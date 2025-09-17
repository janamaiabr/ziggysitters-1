import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, addMonths, subMonths, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvailabilityData {
  date: string;
  is_available: boolean;
  notes?: string;
}

interface AvailabilityCalendarProps {
  sitterId: string;
}

export default function AvailabilityCalendar({ sitterId }: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availability, setAvailability] = useState<AvailabilityData[]>([]);
  const [notes, setNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailability();
  }, [currentDate, sitterId]);

  const fetchAvailability = async () => {
    try {
      const startDate = startOfMonth(currentDate);
      const endDate = endOfMonth(currentDate);

      const { data, error } = await supabase
        .from('sitter_availability')
        .select('date, is_available, notes')
        .eq('sitter_id', sitterId)
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'));

      if (!error && data) {
        setAvailability(data);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const getAvailabilityForDate = (date: Date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return undefined;
    }
    return availability.find(a => a.date === format(date, 'yyyy-MM-dd'));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const existing = getAvailabilityForDate(date);
    setNotes(existing?.notes || '');
    setIsDialogOpen(true);
  };

  const handleSaveAvailability = async (isAvailable: boolean) => {
    if (!selectedDate) return;

    setLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      const { error } = await supabase
        .from('sitter_availability')
        .upsert({
          sitter_id: sitterId,
          date: dateStr,
          is_available: isAvailable,
          notes: notes.trim() || null
        }, {
          onConflict: 'sitter_id,date'
        });

      if (error) throw error;

      // Update local state
      setAvailability(prev => {
        const filtered = prev.filter(a => a.date !== dateStr);
        return [...filtered, { date: dateStr, is_available: isAvailable, notes: notes.trim() || undefined }];
      });

      toast({
        title: 'Availability updated',
        description: `${format(selectedDate, 'MMM dd, yyyy')} marked as ${isAvailable ? 'available' : 'unavailable'}`,
      });

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to update availability. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearAvailability = async () => {
    if (!selectedDate) return;

    setLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      const { error } = await supabase
        .from('sitter_availability')
        .delete()
        .eq('sitter_id', sitterId)
        .eq('date', dateStr);

      if (error) throw error;

      // Update local state
      setAvailability(prev => prev.filter(a => a.date !== dateStr));

      toast({
        title: 'Availability cleared',
        description: `${format(selectedDate, 'MMM dd, yyyy')} reset to default`,
      });

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error clearing availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear availability. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const getDayClassName = (date: Date) => {
    const availability = getAvailabilityForDate(date);
    if (!availability) return 'bg-green-50 hover:bg-green-100 border-green-200'; // Default to available
    
    return availability.is_available 
      ? 'bg-green-100 hover:bg-green-200 border-green-300' 
      : 'bg-red-100 hover:bg-red-200 border-red-300';
  };

  const getDayContent = (date: Date) => {
    const availability = getAvailabilityForDate(date);
    if (!availability) {
      return (
        <div className="absolute top-0 right-0 p-1">
          <Check className="h-3 w-3 text-green-600" />
        </div>
      );
    }
    
    return (
      <div className="absolute top-0 right-0 p-1">
        {availability.is_available ? (
          <Check className="h-3 w-3 text-green-600" />
        ) : (
          <X className="h-3 w-3 text-red-600" />
        )}
      </div>
    );
  };

  const currentMonthDays = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              My Calendar
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold px-4">
                {format(currentDate, 'MMMM yyyy')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center font-medium text-sm text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, index) => (
              <div key={index} className="p-2 h-24"></div>
            ))}
            
            {/* Days of the month */}
            {currentMonthDays.map(date => {
              const availability = getAvailabilityForDate(date);
              const isPast = date.getTime() < new Date().setHours(0, 0, 0, 0);
              
              return (
                <div
                  key={date.toString()}
                  className={cn(
                    'relative p-2 h-24 border border-border rounded-md cursor-pointer transition-colors',
                    'hover:bg-accent',
                    getDayClassName(date),
                    isPast && 'opacity-50'
                  )}
                  onClick={() => !isPast && handleDateClick(date)}
                >
                  <div className="font-medium text-sm">
                    {format(date, 'd')}
                  </div>
                  {getDayContent(date)}
                  {availability?.notes && (
                    <div className="absolute bottom-1 left-1">
                      <Clock className="h-3 w-3 text-blue-600" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span className="text-sm">Unavailable</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Has notes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Set Availability for {selectedDate && format(selectedDate, 'MMMM dd, yyyy')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any special notes for this day..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => handleSaveAvailability(true)}
                disabled={loading}
                className="flex-1"
                variant="default"
              >
                <Check className="h-4 w-4 mr-2" />
                Mark Available
              </Button>
              <Button
                onClick={() => handleSaveAvailability(false)}
                disabled={loading}
                className="flex-1"
                variant="destructive"
              >
                <X className="h-4 w-4 mr-2" />
                Mark Unavailable
              </Button>
            </div>
            
            {getAvailabilityForDate(selectedDate!) && (
              <Button
                onClick={handleClearAvailability}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                Clear Availability
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}