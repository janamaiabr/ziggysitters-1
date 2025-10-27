import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, FileText, Camera, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface BookingWithReports {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  booking_reference: string;
  daily_reports_required: number;
  daily_reports_completed: number;
  sitter: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  daily_reports: DailyReport[];
}

interface DailyReport {
  id: string;
  report_date: string;
  general_notes: string;
  mood: string;
  food_consumption: string;
  exercise_duration: number;
  exercise_notes: string;
  medication_given: boolean;
  medication_notes: string;
  sleep_quality: string;
  sleep_notes: string;
  time_alone_hours: number;
  photo_urls: string[];
  submitted_at: string;
}

export default function ClientDailyReports() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [bookingsWithReports, setBookingsWithReports] = useState<BookingWithReports[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchBookingsWithReports();
    }
  }, [profile?.id]);

  const fetchBookingsWithReports = async () => {
    if (!profile?.id) return;

    try {
      // First fetch bookings that require daily reports
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          start_date,
          end_date,
          status,
          booking_reference,
          daily_reports_required,
          daily_reports_completed,
          requires_daily_reports,
          sitter_id
        `)
        .eq('owner_id', profile.id)
        .eq('requires_daily_reports', true)
        .in('status', ['confirmed', 'in_progress', 'completed'])
        .order('start_date', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Then fetch sitter details and reports for each booking
      const bookingsWithDetails = await Promise.all(
        (bookingsData || []).map(async (booking) => {
          // Fetch sitter details
          const { data: sitterData, error: sitterError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, avatar_url')
            .eq('id', booking.sitter_id)
            .maybeSingle();

          // Fetch daily reports
          const { data: reportsData, error: reportsError } = await supabase
            .from('daily_reports')
            .select(`
              id,
              report_date,
              general_notes,
              mood,
              food_consumption,
              exercise_duration,
              exercise_notes,
              medication_given,
              medication_notes,
              sleep_quality,
              sleep_notes,
              time_alone_hours,
              photo_urls,
              submitted_at
            `)
            .eq('booking_id', booking.id)
            .order('report_date', { ascending: false });

          return {
            ...booking,
            sitter: sitterData || { id: '', first_name: '', last_name: '', avatar_url: null },
            daily_reports: reportsData || []
          };
        })
      );

      setBookingsWithReports(bookingsWithDetails);
    } catch (error) {
      console.error('Error fetching bookings with reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (selectedReport) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Daily Report Details</h2>
          <button 
            className="text-primary hover:underline"
            onClick={() => setSelectedReport(null)}
          >
            ← Back to Reports
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Report for {format(new Date(selectedReport.report_date), 'EEEE, MMMM dd, yyyy')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Submitted {format(new Date(selectedReport.submitted_at), 'h:mm a')}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Photo Gallery */}
            {selectedReport.photo_urls.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Photos ({selectedReport.photo_urls.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {selectedReport.photo_urls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Daily report photo ${index + 1}`}
                      className="rounded-lg object-cover aspect-square cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => window.open(url, '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Report Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Mood</h4>
                  <p className="capitalize">{selectedReport.mood}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Food Consumption</h4>
                  <p className="capitalize">{selectedReport.food_consumption}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Exercise Duration</h4>
                  <p>{selectedReport.exercise_duration} minutes</p>
                </div>
                {selectedReport.exercise_notes && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Exercise Notes</h4>
                    <p className="text-sm">{selectedReport.exercise_notes}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Sleep Quality</h4>
                  <p className="capitalize">{selectedReport.sleep_quality || 'Not specified'}</p>
                </div>
                {selectedReport.sleep_notes && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Sleep Notes</h4>
                    <p className="text-sm">{selectedReport.sleep_notes}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Time Alone</h4>
                  <p>{selectedReport.time_alone_hours || 0} hours</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Medication Given</h4>
                  <p>{selectedReport.medication_given ? 'Yes' : 'No'}</p>
                </div>
                {selectedReport.medication_notes && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Medication Notes</h4>
                    <p className="text-sm">{selectedReport.medication_notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* General Notes */}
            {selectedReport.general_notes && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">General Notes</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <p>{selectedReport.general_notes}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Daily Reports</h2>
      </div>

      {/* How to Get Daily Reports Notice */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2 text-blue-900">💡 How to Get Daily Reports</h3>
          <ul className="text-sm space-y-1 text-blue-800">
            <li>✅ <strong>Select "Daily Reports"</strong> when creating a booking to request them from your sitter</li>
            <li>✅ <strong>Your choice:</strong> Reports are optional - choose them only if you want daily updates</li>
            <li>✅ <strong>Guaranteed delivery:</strong> When you request reports, sitters must deliver them or face payment reduction</li>
            <li>✅ <strong>What you'll see:</strong> Photos, feeding info, exercise details, mood, and sitter's notes</li>
            <li>✅ <strong>Reporting schedule:</strong> Sitters submit one report per day during the booking period (first report on start date)</li>
            <li>✅ <strong>Easy viewing:</strong> Click anywhere on a report card to view the full details</li>
          </ul>
        </CardContent>
      </Card>

      {bookingsWithReports.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No reports yet</h3>
            <p className="text-muted-foreground">
              Daily reports will appear here once your sitters start submitting them.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {bookingsWithReports.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={booking.sitter.avatar_url || ''} 
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {booking.sitter.first_name[0]}{booking.sitter.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {booking.sitter.first_name} {booking.sitter.last_name}
                      </CardTitle>
                      <div className="text-sm text-muted-foreground flex items-center gap-4">
                        <span>Booking #{booking.booking_reference}</span>
                        <span>
                          {format(new Date(booking.start_date), 'MMM dd')} - {format(new Date(booking.end_date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={booking.status === 'in_progress' ? 'default' : 
                                   booking.status === 'completed' ? 'secondary' : 'outline'}>
                      {booking.status.replace('_', ' ')}
                    </Badge>
                    <div className="text-sm text-muted-foreground mt-1">
                      {booking.daily_reports_completed} / {booking.daily_reports_required} reports
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {booking.daily_reports.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No reports submitted yet for this booking.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {booking.daily_reports
                      .sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime())
                      .map((report) => (
                        <div 
                          key={report.id} 
                          className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => setSelectedReport(report)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">
                              {format(new Date(report.report_date), 'EEEE, MMM dd')}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {report.photo_urls.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  <Camera className="w-3 h-3 mr-1" />
                                  {report.photo_urls.length}
                                </Badge>
                              )}
                              <span>{format(new Date(report.submitted_at), 'h:mm a')}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Mood:</span> 
                              <span className="ml-1 capitalize">{report.mood}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Food:</span> 
                              <span className="ml-1 capitalize">{report.food_consumption}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Exercise:</span> 
                              <span className="ml-1">{report.exercise_duration} mins</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Sleep:</span> 
                              <span className="ml-1 capitalize">{report.sleep_quality || 'Not specified'}</span>
                            </div>
                          </div>
                          
                          {report.general_notes && (
                            <div className="mt-3 text-sm text-muted-foreground line-clamp-2">
                              {report.general_notes}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}