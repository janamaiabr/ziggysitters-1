import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar as CalendarIcon, FileText, Camera, TrendingUp, 
  AlertCircle, CheckCircle, Info
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import DailyReportForm from '@/components/daily-reports/DailyReportForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  booking_reference: string;
  daily_reports_required: number;
  daily_reports_completed: number;
  owner_id: string;
  sitter_id: string;
  pet_ids: string[];
  owner?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  sitter?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  pets?: Array<{ id: string; name: string }>;
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
  sleep_quality?: string;
  exercise_notes?: string;
  medication_given?: boolean;
  medication_notes?: string;
  sleep_notes?: string;
  time_alone_hours?: number;
}

export default function DailyReports() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const isSitter = profile?.role === 'pet_sitter';
  const isOwner = profile?.role === 'pet_owner';

  useEffect(() => {
    if (profile?.id) {
      fetchData();
    }
  }, [profile?.id]);

  const fetchData = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      
      // Fetch bookings based on role
      const bookingsQuery = supabase
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
          owner_id,
          sitter_id,
          pet_ids
        `)
        .eq('requires_daily_reports', true)
        .in('status', ['confirmed', 'in_progress', 'completed']);

      if (isSitter) {
        bookingsQuery.eq('sitter_id', profile.id);
      } else if (isOwner) {
        bookingsQuery.eq('owner_id', profile.id);
      }

      const { data: bookingsData, error: bookingsError } = await bookingsQuery;
      if (bookingsError) throw bookingsError;

      // Fetch related profiles and pets
      const bookingsWithDetails = await Promise.all(
        (bookingsData || []).map(async (booking) => {
          const [ownerRes, sitterRes, petsRes] = await Promise.all([
            supabase.from('profiles').select('id, first_name, last_name, avatar_url').eq('id', booking.owner_id).maybeSingle(),
            supabase.from('profiles').select('id, first_name, last_name, avatar_url').eq('id', booking.sitter_id).maybeSingle(),
            supabase.from('pets').select('id, name').in('id', booking.pet_ids || [])
          ]);

          return {
            ...booking,
            owner: ownerRes.data || undefined,
            sitter: sitterRes.data || undefined,
            pets: petsRes.data || []
          };
        })
      );

      setBookings(bookingsWithDetails);

      // Fetch all reports
      const reportsQuery = supabase
        .from('daily_reports')
        .select('*');

      if (isSitter) {
        reportsQuery.eq('sitter_id', profile.id);
      } else if (isOwner) {
        // For owners, get reports from their bookings
        const bookingIds = bookingsWithDetails.map(b => b.id);
        if (bookingIds.length > 0) {
          reportsQuery.in('booking_id', bookingIds);
        }
      }

      const { data: reportsData, error: reportsError } = await reportsQuery;
      if (reportsError) throw reportsError;

      setReports(reportsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load daily reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatistics = () => {
    const totalRequired = bookings.reduce((sum, b) => sum + (b.daily_reports_required || 0), 0);
    const totalCompleted = reports.length;
    const completionRate = totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0;
    const thisMonth = reports.filter(r => 
      new Date(r.report_date).getMonth() === new Date().getMonth() &&
      new Date(r.report_date).getFullYear() === new Date().getFullYear()
    ).length;
    const bookingsWithReducedPay = bookings.filter(b => 
      b.daily_reports_completed < b.daily_reports_required && b.status === 'completed'
    ).length;

    return { totalRequired, totalCompleted, completionRate, thisMonth, bookingsWithReducedPay };
  };

  const getDayBookings = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookings.filter(booking => {
      const start = new Date(booking.start_date);
      const end = new Date(booking.end_date);
      const checkDate = new Date(dateStr);
      return checkDate >= start && checkDate <= end;
    });
  };

  const getDayReports = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return reports.filter(report => report.report_date === dateStr);
  };

  const getDayStatus = (date: Date): 'completed' | 'pending' | 'none' => {
    const dayBookings = getDayBookings(date);
    if (dayBookings.length === 0) return 'none';
    
    const dayReports = getDayReports(date);
    const reportsNeeded = dayBookings.length;
    
    return dayReports.length >= reportsNeeded ? 'completed' : 'pending';
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Calculate padding days for the start of month
    const startDayOfWeek = monthStart.getDay();
    const paddingDays = Array(startDayOfWeek).fill(null);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              Next
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="border rounded-lg overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 bg-muted">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-px bg-border">
            {[...paddingDays, ...daysInMonth].map((day, index) => {
              if (!day) {
                return <div key={`padding-${index}`} className="bg-muted/30 min-h-20" />;
              }

              const status = getDayStatus(day);
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const dayBookings = getDayBookings(day);
              const dayReports = getDayReports(day);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative min-h-20 p-2 bg-background hover:bg-muted/50 transition-colors
                    ${isSelected ? 'ring-2 ring-primary ring-inset' : ''}
                    ${isToday ? 'font-bold' : ''}
                  `}
                >
                  <div className="flex flex-col items-start h-full">
                    <span className={`text-sm ${isToday ? 'text-primary' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    
                    {status !== 'none' && (
                      <div className="mt-1 w-full">
                        {status === 'completed' ? (
                          <div className="w-2 h-2 rounded-full bg-green-500 mx-auto" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-red-500 mx-auto" />
                        )}
                      </div>
                    )}

                    {dayBookings.length > 0 && (
                      <div className="mt-auto text-xs text-muted-foreground">
                        {dayReports.length}/{dayBookings.length}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Report submitted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Report due</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <span>No bookings</span>
          </div>
        </div>
      </div>
    );
  };

  const renderSelectedDayDetails = () => {
    if (!selectedDate) return null;

    const dayBookings = getDayBookings(selectedDate);
    const dayReports = getDayReports(selectedDate);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    if (dayBookings.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No bookings on this date</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dayBookings.map(booking => {
            const bookingReport = dayReports.find(r => r.booking_id === booking.id);
            const otherPerson = isSitter ? booking.owner : booking.sitter;

            return (
              <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={otherPerson?.avatar_url || ''} />
                      <AvatarFallback>
                        {otherPerson?.first_name?.[0]}{otherPerson?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {otherPerson?.first_name} {otherPerson?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Pets: {booking.pets?.map(p => p.name).join(', ') || 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Booking #{booking.booking_reference}
                      </p>
                    </div>
                  </div>
                  
                  {bookingReport ? (
                    <Badge className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Submitted
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Due
                    </Badge>
                  )}
                </div>

                {bookingReport && (
                  <div className="border-t pt-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Mood:</span>{' '}
                        <span className="capitalize">{bookingReport.mood.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Food:</span>{' '}
                        <span className="capitalize">{bookingReport.food_consumption}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Exercise:</span>{' '}
                        {bookingReport.exercise_duration} mins
                      </div>
                      <div>
                        <span className="text-muted-foreground">Photos:</span>{' '}
                        {bookingReport.photo_urls?.length || 0}
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setSelectedReport(bookingReport)}
                    >
                      View Full Report
                    </Button>
                  </div>
                )}

                {!bookingReport && isSitter && (
                  <Button
                    className="w-full"
                    onClick={() => {
                      setShowReportForm(true);
                    }}
                  >
                    Submit Report
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  const renderReportDetails = () => {
    if (!selectedReport) return null;

    const booking = bookings.find(b => b.id === selectedReport.booking_id);
    const otherPerson = isSitter ? booking?.owner : booking?.sitter;

    return (
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Daily Report - {format(new Date(selectedReport.report_date), 'MMMM d, yyyy')}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Submitted {format(new Date(selectedReport.submitted_at), 'h:mm a')} • 
              {otherPerson && ` ${isSitter ? 'Owner' : 'Sitter'}: ${otherPerson.first_name} ${otherPerson.last_name}`}
            </p>
          </DialogHeader>

          <div className="space-y-6">
            {/* Photos */}
            {selectedReport.photo_urls && selectedReport.photo_urls.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Photos ({selectedReport.photo_urls.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedReport.photo_urls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Report photo ${index + 1}`}
                      className="rounded-lg object-cover aspect-square cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => window.open(url, '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <DetailItem label="Mood" value={selectedReport.mood.replace('_', ' ')} />
                <DetailItem label="Food Consumption" value={selectedReport.food_consumption} />
                <DetailItem label="Exercise Duration" value={`${selectedReport.exercise_duration} minutes`} />
                {selectedReport.exercise_notes && (
                  <DetailItem label="Exercise Notes" value={selectedReport.exercise_notes} />
                )}
              </div>

              <div className="space-y-3">
                <DetailItem label="Sleep Quality" value={selectedReport.sleep_quality || 'Not specified'} />
                {selectedReport.sleep_notes && (
                  <DetailItem label="Sleep Notes" value={selectedReport.sleep_notes} />
                )}
                <DetailItem label="Time Alone" value={`${selectedReport.time_alone_hours || 0} hours`} />
                <DetailItem label="Medication Given" value={selectedReport.medication_given ? 'Yes' : 'No'} />
                {selectedReport.medication_notes && (
                  <DetailItem label="Medication Notes" value={selectedReport.medication_notes} />
                )}
              </div>
            </div>

            {/* General Notes */}
            {selectedReport.general_notes && (
              <div>
                <h4 className="font-medium mb-2">General Notes</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm">{selectedReport.general_notes}</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const stats = getStatistics();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading daily reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Daily Reports Dashboard
        </h1>
        <p className="text-muted-foreground">
          {isSitter 
            ? "Manage daily pet reports for bookings that request them. Stay on top of your reporting to ensure full payment."
            : "View daily updates from your pet sitter. Reports include photos, feeding info, exercise details, and more."
          }
        </p>
      </div>

      {/* How It Works */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="font-semibold mb-2">How Daily Reports Work</div>
          <ul className="space-y-1 text-sm">
            {isSitter ? (
              <>
                <li>✅ <strong>You only provide reports</strong> when specifically requested by the pet owner</li>
                <li>✅ <strong>Short visits (e.g., 1-hour walks)</strong> typically don't require reports unless requested</li>
                <li>⚠️ <strong>When reports are requested,</strong> you must submit them daily by 9 PM to receive full payment</li>
                <li>📸 <strong>Requirements:</strong> At least one photo + comprehensive details required</li>
              </>
            ) : (
              <>
                <li>✅ <strong>Pet owners choose</strong> whether to request daily reports when booking</li>
                <li>✅ <strong>Your choice:</strong> Reports are optional - choose them only if you want daily updates</li>
                <li>✅ <strong>Guaranteed delivery:</strong> When you request reports, sitters must deliver them or face payment reduction</li>
                <li>📸 <strong>What you'll see:</strong> Photos, feeding info, exercise details, mood, and sitter's notes</li>
              </>
            )}
          </ul>
        </AlertDescription>
      </Alert>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{stats.completionRate}%</span>
              {stats.completionRate >= 80 ? (
                <Badge className="bg-green-500">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Good
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Needs Improvement
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reports Submitted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{stats.totalCompleted}</span>
              <span className="text-sm text-muted-foreground">of {stats.totalRequired} required</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{stats.thisMonth}</span>
              <span className="text-sm text-muted-foreground">reports submitted</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Payment Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{stats.bookingsWithReducedPay}</span>
              <span className="text-sm text-muted-foreground">bookings with reduced pay</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Policy */}
      {isSitter && (
        <Alert className="border-l-4 border-l-orange-500 bg-orange-50/50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="font-semibold text-orange-900 mb-2">Daily Report Payment Policy (When Requested)</div>
            <div className="text-sm text-orange-800 space-y-1">
              <p>✅ <strong>100% Payment:</strong> Submit daily reports for ALL required days</p>
              <p>⚠️ <strong>15% Deduction:</strong> Miss even one daily report</p>
              <p>⏰ <strong>Deadline:</strong> Reports must be submitted by 9 PM each day</p>
              <p>📸 <strong>Requirements:</strong> At least one photo + comprehensive details required</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Calendar and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Daily Reports Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderCalendar()}
            </CardContent>
          </Card>
        </div>

        <div>
          {renderSelectedDayDetails()}
        </div>
      </div>

      {/* Report Form Dialog */}
      {isSitter && selectedDate && showReportForm && (
        <Dialog open={showReportForm} onOpenChange={setShowReportForm}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit Daily Report</DialogTitle>
            </DialogHeader>
            <DailyReportForm
              bookingId={getDayBookings(selectedDate)[0]?.id || ''}
              sitterId={profile?.id || ''}
              reportDate={format(selectedDate, 'yyyy-MM-dd')}
              onSubmit={() => {
                setShowReportForm(false);
                fetchData();
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

      {/* Report Details Dialog */}
      {renderReportDetails()}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-muted-foreground mb-1">{label}</h4>
      <p className="capitalize">{value}</p>
    </div>
  );
}
