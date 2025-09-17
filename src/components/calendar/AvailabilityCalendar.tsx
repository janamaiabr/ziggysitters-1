import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, addMonths, subMonths, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, Check, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvailabilityData {
  date: string;
  is_available: boolean;
}

interface AvailabilityCalendarProps {
  sitterId: string;
}

export default function AvailabilityCalendar({ sitterId }: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availability, setAvailability] = useState<AvailabilityData[]>([]);
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
        .select('date, is_available')
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

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
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
          is_available: isAvailable
        });

      if (error) throw error;

      setAvailability(prev => {
        const filtered = prev.filter(a => a.date !== dateStr);
        return [...filtered, { 
          date: dateStr, 
          is_available: isAvailable
        }];
      });

      toast({
        title: "Availability updated",
        description: `Date marked as ${isAvailable ? 'available' : 'unavailable'}`,
      });

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive",
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

      setAvailability(prev => prev.filter(a => a.date !== dateStr));

      toast({
        title: "Availability cleared",
        description: "Date availability has been reset to default (available)",
      });

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error clearing availability:', error);
      toast({
        title: "Error",
        description: "Failed to clear availability",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const getDayClassName = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayAvailability = availability.find(a => a.date === dateStr);
    
    if (!dayAvailability) return '';
    
    return cn(
      "relative",
      dayAvailability.is_available 
        ? "bg-green-100 text-green-900 hover:bg-green-200" 
        : "bg-red-100 text-red-900 hover:bg-red-200"
    );
  };

  const getDayContent = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayAvailability = availability.find(a => a.date === dateStr);
    
    if (!dayAvailability) return null;
    
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className={cn(
          "w-2 h-2 rounded-full",
          dayAvailability.is_available ? "bg-green-500" : "bg-red-500"
        )} />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-sm font-medium text-muted-foreground">
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
            
            return (
              <button
                key={i}
                onClick={() => isCurrentMonth && handleDateClick(currentDay)}
                className={cn(
                  "h-12 p-1 text-sm border rounded-md hover:bg-accent transition-colors",
                  isCurrentMonth ? "text-foreground" : "text-muted-foreground",
                  isToday && "ring-2 ring-primary",
                  getDayClassName(currentDay),
                  !isCurrentMonth && "opacity-50"
                )}
                disabled={!isCurrentMonth}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  {format(currentDay, 'd')}
                  {isCurrentMonth && getDayContent(currentDay)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
            Unavailable
          </div>
          <div className="text-muted-foreground">
            Default: Available (no indicator)
          </div>
        </div>

        {/* Dialog for setting availability */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Set Availability for {selectedDate && format(selectedDate, 'MMMM dd, yyyy')}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Current status */}
              {selectedDate && (() => {
                const dateStr = format(selectedDate, 'yyyy-MM-dd');
                const currentAvailability = availability.find(a => a.date === dateStr);
                
                return (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Current Status:</span>
                      <Badge variant={currentAvailability?.is_available !== false ? 'default' : 'destructive'}>
                        {currentAvailability ? (currentAvailability.is_available ? 'Available' : 'Unavailable') : 'Available (default)'}
                      </Badge>
                    </div>
                  </div>
                );
              })()}

              {/* Action buttons */}
              <div className="flex space-x-2">
                <Button 
                  onClick={() => handleSaveAvailability(true)}
                  disabled={loading}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark Available
                </Button>
                <Button 
                  onClick={() => handleSaveAvailability(false)}
                  disabled={loading}
                  variant="destructive"
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Mark Unavailable
                </Button>
              </div>

              {selectedDate && (() => {
                const dateStr = format(selectedDate, 'yyyy-MM-dd');
                const hasAvailability = availability.some(a => a.date === dateStr);
                
                return hasAvailability ? (
                  <Button 
                    onClick={handleClearAvailability}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Reset to Default (Available)
                  </Button>
                ) : null;
              })()}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}