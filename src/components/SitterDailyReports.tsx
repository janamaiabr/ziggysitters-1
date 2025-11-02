import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, FileText, Camera, Plus } from 'lucide-react';
import { format } from 'date-fns';
import DailyReportForm from '@/components/daily-reports/DailyReportForm';

interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  pet_ids: string[];
  owner_id: string;
  booking_reference: string;
  daily_reports_required: number;
  daily_reports_completed: number;
}

interface DailyReport {
  id: string;
  booking_id: string;
  report_date: string;
  general_notes: string;
  mood: string;
  food_consumption: string;
  exercise_duration: number;
  photo_urls: string[];
  submitted_at: string;
  booking?: {
    booking_reference: string;
  };
}

interface BookingWithReportCount extends Booking {
  actualReportsCount: number;
}

export default function SitterDailyReports() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [activeBookings, setActiveBookings] = useState<BookingWithReportCount[]>([]);
  const [recentReports, setRecentReports] = useState<DailyReport[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchActiveBookings();
      fetchRecentReports();
    }
  }, [profile?.id]);

  const fetchActiveBookings = async () => {
    if (!profile?.id) return;

    try {
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select(`
          id,
          start_date,
          end_date,
          status,
          pet_ids,
          owner_id,
          booking_reference,
          daily_reports_required,
          daily_reports_completed,
          requires_daily_reports
        `)
        .eq('sitter_id', profile.id)
        .eq('requires_daily_reports', true)
        .in('status', ['confirmed', 'in_progress'])
        .order('start_date', { ascending: true });

      if (error) throw error;

      // Fetch actual report counts for each booking
      const bookingsWithCounts = await Promise.all(
        (bookingsData || []).map(async (booking) => {
          const { count } = await supabase
            .from('daily_reports')
            .select('*', { count: 'exact', head: true })
            .eq('booking_id', booking.id);

          return {
            ...booking,
            actualReportsCount: count || 0
          };
        })
      );

      setActiveBookings(bookingsWithCounts);
    } catch (error) {
      console.error('Error fetching active bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentReports = async () => {
    if (!profile?.id) return;

    try {
      const { data: reportsData, error } = await supabase
        .from('daily_reports')
        .select(`
          id,
          booking_id,
          report_date,
          general_notes,
          mood,
          food_consumption,
          exercise_duration,
          photo_urls,
          submitted_at
        `)
        .eq('sitter_id', profile.id)
        .order('submitted_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Fetch booking references for each report
      const reportsWithBookings = await Promise.all(
        (reportsData || []).map(async (report) => {
          const { data: booking } = await supabase
            .from('bookings')
            .select('booking_reference')
            .eq('id', report.booking_id)
            .single();

          return {
            ...report,
            booking: booking || undefined
          };
        })
      );

      setRecentReports(reportsWithBookings);
    } catch (error) {
      console.error('Error fetching recent reports:', error);
    }
  };

  const handleReportSubmitted = () => {
    setShowReportForm(false);
    setSelectedBooking(null);
    fetchActiveBookings();
    fetchRecentReports();
    toast({
      title: "Report submitted",
      description: "Your daily report has been submitted successfully.",
    });
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (showReportForm && selectedBooking) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Submit Daily Report</h2>
          <Button 
            variant="outline" 
            onClick={() => {
              setShowReportForm(false);
              setSelectedBooking(null);
            }}
          >
            Back to Reports
          </Button>
        </div>
        <DailyReportForm 
          bookingId={selectedBooking.id}
          sitterId={profile?.id || ''}
          reportDate={new Date().toISOString().split('T')[0]}
          onSubmit={handleReportSubmitted}
          onCancel={() => {
            setShowReportForm(false);
            setSelectedBooking(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Daily Reports</h2>
      </div>

      {/* Active Bookings Requiring Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Active Bookings Requesting Daily Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeBookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No active bookings requesting daily reports at the moment.
            </p>
          ) : (
            <div className="space-y-4">
              {activeBookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium">Booking #{booking.booking_reference}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(booking.start_date), 'MMM dd')} - {format(new Date(booking.end_date), 'MMM dd, yyyy')}
                      </div>
                    </div>
                    <Badge variant={booking.status === 'in_progress' ? 'default' : 'secondary'}>
                      {booking.status === 'in_progress' ? 'In Progress' : 'Confirmed'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      Reports: {booking.actualReportsCount} / {booking.daily_reports_required}
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowReportForm(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Submit Report
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Recent Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentReports.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No reports submitted yet.
            </p>
          ) : (
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div key={report.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium">
                          Report for {format(new Date(report.report_date), 'MMM dd, yyyy')}
                        </div>
                        {report.booking?.booking_reference && (
                          <Badge variant="secondary" className="text-xs">
                            {report.booking.booking_reference}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Submitted {format(new Date(report.submitted_at), 'MMM dd, yyyy h:mm a')}
                      </div>
                    </div>
                    {report.photo_urls.length > 0 && (
                      <Badge variant="outline">
                        <Camera className="w-3 h-3 mr-1" />
                        {report.photo_urls.length} photos
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Mood:</span> {report.mood}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Food:</span> {report.food_consumption}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Exercise:</span> {report.exercise_duration} mins
                    </div>
                  </div>
                  
                  {report.general_notes && (
                    <div className="mt-3 p-3 bg-muted rounded text-sm">
                      <strong>Notes:</strong> {report.general_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}