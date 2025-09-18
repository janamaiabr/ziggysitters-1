import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarIcon, CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DailyReportForm from './DailyReportForm';
import { cn } from '@/lib/utils';

interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  owner_id: string;
  owner_name: string;
  pet_names: string[];
}

interface DailyReport {
  id: string;
  booking_id: string;
  report_date: string;
  submitted_at: string;
  general_notes: string;
  mood: string;
}

interface ReportsCalendarProps {
  sitterId: string;
}

export default function ReportsCalendar({ sitterId }: ReportsCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookingsAndReports();
  }, [sitterId]);

  const fetchBookingsAndReports = async () => {
    try {
      // Fetch sitter's bookings
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          id,
          start_date,
          end_date,
          status,
          owner_id,
          pet_ids,
          profiles!bookings_owner_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq('sitter_id', sitterId)
        .in('status', ['confirmed', 'in_progress', 'completed']);

      if (bookingError) throw bookingError;

      // Process bookings to get pet names and owner names
      const processedBookings = await Promise.all(
        (bookingData || []).map(async (booking) => {
          // Get pet names
          const { data: pets } = await supabase
            .from('pets')
            .select('name')
            .in('id', booking.pet_ids);

          return {
            id: booking.id,
            start_date: booking.start_date,
            end_date: booking.end_date,
            status: booking.status,
            owner_id: booking.owner_id,
            owner_name: `${booking.profiles?.first_name} ${booking.profiles?.last_name}`,
            pet_names: pets?.map(p => p.name) || [],
          };
        })
      );

      setBookings(processedBookings);

      // Fetch reports
      const { data: reportData, error: reportError } = await supabase
        .from('daily_reports')
        .select('*')
        .eq('sitter_id', sitterId);

      if (reportError) throw reportError;

      setReports(reportData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load bookings and reports",
        variant: "destructive",
      });
    }
  };

  const getDateStatus = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const activeBookings = bookings.filter(booking => 
      dateStr >= booking.start_date && 
      dateStr <= booking.end_date &&
      booking.status !== 'completed'
    );

    if (activeBookings.length === 0) return { status: 'none', bookings: [] };

    const hasReport = reports.some(report => 
      report.report_date === dateStr &&
      activeBookings.some(booking => booking.id === report.booking_id)
    );

    return {
      status: hasReport ? 'completed' : 'pending',
      bookings: activeBookings
    };
  };

  const getCalendarDayProps = (date: Date) => {
    const { status } = getDateStatus(date);
    const isToday = date.toDateString() === new Date().toDateString();
    
    let className = '';
    if (status === 'completed') {
      className = 'bg-green-100 text-green-800 hover:bg-green-200';
    } else if (status === 'pending') {
      className = 'bg-red-100 text-red-800 hover:bg-red-200';
    }
    
    if (isToday) {
      className += ' ring-2 ring-primary';
    }
    
    return { className };
  };

  const handleCreateReport = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowReportForm(true);
  };

  const selectedDateStatus = selectedDate ? getDateStatus(selectedDate) : null;
  const selectedDateStr = selectedDate?.toISOString().split('T')[0];
  const existingReport = selectedDateStr ? reports.find(r => r.report_date === selectedDateStr) : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Daily Reports Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className={cn("rounded-md border pointer-events-auto")}
                modifiers={{
                  completed: (date) => getDateStatus(date).status === 'completed',
                  pending: (date) => getDateStatus(date).status === 'pending',
                }}
                modifiersStyles={{
                  completed: { backgroundColor: '#dcfce7', color: '#166534' },
                  pending: { backgroundColor: '#fecaca', color: '#dc2626' },
                }}
              />
              
              {/* Legend */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border rounded"></div>
                  <span className="text-sm">Report submitted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border rounded"></div>
                  <span className="text-sm">Report due</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border rounded"></div>
                  <span className="text-sm">No bookings</span>
                </div>
              </div>
            </div>

            {/* Selected Date Info */}
            <div>
              {selectedDate && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>

                  {selectedDateStatus?.bookings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No bookings on this date</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedDateStatus?.bookings.map((booking) => {
                        const hasReport = reports.some(r => 
                          r.report_date === selectedDateStr && 
                          r.booking_id === booking.id
                        );

                        return (
                          <Card key={booking.id} className="border-l-4 border-l-primary">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium">{booking.owner_name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Pets: {booking.pet_names.join(', ')}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    {hasReport ? (
                                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Report Submitted
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        Report Due
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {!hasReport && (
                                  <Dialog open={showReportForm} onOpenChange={setShowReportForm}>
                                    <DialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        onClick={() => handleCreateReport(booking)}
                                        className="ml-2"
                                      >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Submit Report
                                      </Button>
                                    </DialogTrigger>
                                  </Dialog>
                                )}
                              </div>

                              {hasReport && existingReport && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                  <p className="text-sm text-gray-600 mb-1">
                                    <strong>Mood:</strong> {existingReport.mood.replace('_', ' ')}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    <strong>Notes:</strong> {existingReport.general_notes.substring(0, 100)}...
                                  </p>
                                  <p className="text-xs text-gray-500 mt-2">
                                    Submitted: {new Date(existingReport.submitted_at).toLocaleTimeString()}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Form Dialog */}
      {selectedBooking && (
        <Dialog open={showReportForm} onOpenChange={setShowReportForm}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Daily Report for {selectedBooking.owner_name}</DialogTitle>
            </DialogHeader>
            <DailyReportForm
              bookingId={selectedBooking.id}
              sitterId={sitterId}
              reportDate={selectedDateStr || ''}
              onSubmit={() => {
                setShowReportForm(false);
                fetchBookingsAndReports();
                toast({
                  title: "Report submitted!",
                  description: "The pet owner has been notified via email.",
                });
              }}
              onCancel={() => setShowReportForm(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}