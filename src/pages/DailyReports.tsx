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
  AlertCircle, CheckCircle, Info, Clock, Utensils, Dumbbell
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isWithinInterval } from 'date-fns';
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
  requires_daily_reports: boolean;
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

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}

interface Pet {
  id: string;
  name: string;
}

export default function DailyReports() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [pets, setPets] = useState<Map<string, Pet>>(new Map());
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const isSitter = profile?.role === 'pet_sitter';

  useEffect(() => {
    if (profile?.id) {
      fetchData();
    }
  }, [profile?.id]);

  const fetchData = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      
      // Fetch bookings
      let bookingsQuery = supabase
        .from('bookings')
        .select('*')
        .eq('requires_daily_reports', true)
        .in('status', ['confirmed', 'in_progress', 'completed']);

      if (isSitter) {
        bookingsQuery = bookingsQuery.eq('sitter_id', profile.id);
      } else {
        bookingsQuery = bookingsQuery.eq('owner_id', profile.id);
      }

      const { data: bookingsData, error: bookingsError } = await bookingsQuery;
      if (bookingsError) throw bookingsError;

      setBookings(bookingsData || []);

      // Fetch all reports
      let reportsQuery = supabase.from('daily_reports').select('*');
      
      if (isSitter) {
        reportsQuery = reportsQuery.eq('sitter_id', profile.id);
      } else {
        const bookingIds = (bookingsData || []).map(b => b.id);
        if (bookingIds.length > 0) {
          reportsQuery = reportsQuery.in('booking_id', bookingIds);
        } else {
          reportsQuery = reportsQuery.eq('booking_id', 'none'); // No bookings
        }
      }

      const { data: reportsData, error: reportsError } = await reportsQuery;
      if (reportsError) throw reportsError;

      setReports(reportsData || []);

      // Fetch all unique profiles
      const uniqueProfileIds = new Set<string>();
      (bookingsData || []).forEach(booking => {
        uniqueProfileIds.add(booking.owner_id);
        uniqueProfileIds.add(booking.sitter_id);
      });

      if (uniqueProfileIds.size > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url')
          .in('id', Array.from(uniqueProfileIds));

        if (profilesData) {
          const profilesMap = new Map<string, Profile>();
          profilesData.forEach(p => profilesMap.set(p.id, p));
          setProfiles(profilesMap);
        }
      }

      // Fetch all unique pets
      const uniquePetIds = new Set<string>();
      (bookingsData || []).forEach(booking => {
        booking.pet_ids?.forEach(id => uniquePetIds.add(id));
      });

      if (uniquePetIds.size > 0) {
        const { data: petsData } = await supabase
          .from('pets')
          .select('id, name')
          .in('id', Array.from(uniquePetIds));

        if (petsData) {
          const petsMap = new Map<string, Pet>();
          petsData.forEach(p => petsMap.set(p.id, p));
          setPets(petsMap);
        }
      }
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
    const thisMonth = reports.filter(r => {
      const reportDate = new Date(r.report_date);
      const now = new Date();
      return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
    }).length;
    const bookingsWithReducedPay = bookings.filter(b => 
      b.status === 'completed' && 
      b.daily_reports_completed < b.daily_reports_required
    ).length;

    return { totalRequired, totalCompleted, completionRate, thisMonth, bookingsWithReducedPay };
  };

  const getDayBookings = (date: Date) => {
    return bookings.filter(booking => {
      const start = new Date(booking.start_date);
      const end = new Date(booking.end_date);
      return isWithinInterval(date, { start, end });
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
    return dayReports.length >= dayBookings.length ? 'completed' : 'pending';
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const startDayOfWeek = monthStart.getDay();
    const paddingDays = Array(startDayOfWeek).fill(null);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              ← Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                setCurrentMonth(today);
                setSelectedDate(today);
              }}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              Next →
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-7 bg-muted/50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-semibold">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {[...paddingDays, ...daysInMonth].map((day, index) => {
              if (!day) {
                return <div key={`padding-${index}`} className="bg-muted/20 min-h-24 border-r border-b" />;
              }

              const status = getDayStatus(day);
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);
              const dayBookings = getDayBookings(day);
              const dayReports = getDayReports(day);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative min-h-24 p-2 border-r border-b transition-all
                    ${isSelected ? 'bg-primary/10 ring-2 ring-primary ring-inset' : 'bg-background hover:bg-muted/30'}
                    ${status === 'completed' ? 'bg-green-50/50' : ''}
                    ${status === 'pending' ? 'bg-red-50/50' : ''}
                  `}
                >
                  <div className="flex flex-col h-full">
                    <span className={`
                      text-sm font-medium mb-1
                      ${isToday ? 'text-primary font-bold' : ''}
                      ${status === 'none' ? 'text-muted-foreground' : ''}
                    `}>
                      {format(day, 'd')}
                    </span>
                    
                    {dayBookings.length > 0 && (
                      <div className="flex-1 flex flex-col items-center justify-center gap-1">
                        <div className={`
                          w-5 h-5 rounded-full shadow-md
                          ${status === 'completed' ? 'bg-green-500' : 'bg-red-500'}
                        `} />
                        <span className="text-xs font-medium text-foreground">
                          {dayReports.length}/{dayBookings.length}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-green-500 shadow-md" />
            <span className="text-muted-foreground">Report submitted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-red-500 shadow-md" />
            <span className="text-muted-foreground">Report due</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gray-300 shadow-md" />
            <span className="text-muted-foreground">No bookings</span>
          </div>
        </div>
      </div>
    );
  };

  const renderSelectedDayDetails = () => {
    const dayBookings = getDayBookings(selectedDate);
    const dayReports = getDayReports(selectedDate);

    if (dayBookings.length === 0) {
      return (
        <Card>
          <CardContent className="py-16 text-center">
            <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-lg font-medium text-muted-foreground mb-1">No bookings on this date</p>
            <p className="text-sm text-muted-foreground">Select a date with bookings to view details</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dayBookings.map(booking => {
            const bookingReport = dayReports.find(r => r.booking_id === booking.id);
            const otherPersonId = isSitter ? booking.owner_id : booking.sitter_id;
            const otherPerson = profiles.get(otherPersonId);
            const bookingPets = booking.pet_ids?.map(id => pets.get(id)).filter(Boolean) || [];

            return (
              <div key={booking.id} className="border-2 rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-12 w-12 border-2">
                      <AvatarImage src={otherPerson?.avatar_url || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {otherPerson?.first_name?.[0] || '?'}{otherPerson?.last_name?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-lg">
                        {otherPerson?.first_name || 'Loading'} {otherPerson?.last_name || '...'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isSitter ? 'Pet Owner' : 'Pet Sitter'}
                      </p>
                      <p className="text-sm font-medium mt-1">
                        🐾 {bookingPets.map(p => p?.name).join(', ') || 'Loading pets...'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Booking #{booking.booking_reference}
                      </p>
                    </div>
                  </div>
                  
                  {bookingReport ? (
                    <Badge className="bg-green-500 hover:bg-green-600 text-white border-0">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Submitted
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Due
                    </Badge>
                  )}
                </div>

                {bookingReport ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="text-2xl">{bookingReport.mood === 'very_happy' ? '😄' : bookingReport.mood === 'happy' ? '😊' : bookingReport.mood === 'calm' ? '😌' : bookingReport.mood === 'anxious' ? '😰' : '😢'}</div>
                        <div>
                          <p className="text-xs text-muted-foreground">Mood</p>
                          <p className="text-sm font-medium capitalize">{bookingReport.mood.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Utensils className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Food</p>
                          <p className="text-sm font-medium capitalize">{bookingReport.food_consumption}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Dumbbell className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Exercise</p>
                          <p className="text-sm font-medium">{bookingReport.exercise_duration} mins</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Camera className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Photos</p>
                          <p className="text-sm font-medium">{bookingReport.photo_urls?.length || 0} uploaded</p>
                        </div>
                      </div>
                    </div>
                    
                    {bookingReport.general_notes && (
                      <div className="p-3 bg-background border rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Notes:</p>
                        <p className="text-sm">{bookingReport.general_notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedReport(bookingReport)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Full Report
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {isSitter ? (
                      <Button
                        className="w-full"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowReportForm(true);
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Submit Report
                      </Button>
                    ) : (
                      <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          Waiting for sitter to submit daily report. Reports must be submitted by 9 PM.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
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
    const otherPersonId = booking ? (isSitter ? booking.owner_id : booking.sitter_id) : null;
    const otherPerson = otherPersonId ? profiles.get(otherPersonId) : null;

    return (
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Daily Report - {format(new Date(selectedReport.report_date), 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Submitted at {format(new Date(selectedReport.submitted_at), 'h:mm a')}
              {otherPerson && ` • ${isSitter ? 'Owner' : 'Sitter'}: ${otherPerson.first_name} ${otherPerson.last_name}`}
            </p>
          </DialogHeader>

          <div className="space-y-6">
            {selectedReport.photo_urls && selectedReport.photo_urls.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-lg">
                  <Camera className="w-5 h-5" />
                  Photos ({selectedReport.photo_urls.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedReport.photo_urls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Report photo ${index + 1}`}
                        className="rounded-lg object-cover aspect-square w-full cursor-pointer hover:opacity-90 transition-opacity border-2"
                        onClick={() => window.open(url, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Activity & Mood</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <DetailItem label="Mood" value={selectedReport.mood.replace('_', ' ')} />
                  <DetailItem label="Food Consumption" value={selectedReport.food_consumption} />
                  <DetailItem label="Exercise Duration" value={`${selectedReport.exercise_duration} minutes`} />
                  {selectedReport.exercise_notes && (
                    <DetailItem label="Exercise Notes" value={selectedReport.exercise_notes} />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Rest & Care</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <DetailItem label="Sleep Quality" value={selectedReport.sleep_quality || 'Not specified'} />
                  {selectedReport.sleep_notes && (
                    <DetailItem label="Sleep Notes" value={selectedReport.sleep_notes} />
                  )}
                  <DetailItem label="Time Alone" value={`${selectedReport.time_alone_hours || 0} hours`} />
                  <DetailItem label="Medication Given" value={selectedReport.medication_given ? 'Yes' : 'No'} />
                  {selectedReport.medication_notes && (
                    <DetailItem label="Medication Notes" value={selectedReport.medication_notes} />
                  )}
                </CardContent>
              </Card>
            </div>

            {selectedReport.general_notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">General Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{selectedReport.general_notes}</p>
                </CardContent>
              </Card>
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
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading daily reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <FileText className="h-10 w-10 text-primary" />
          Daily Reports Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          {isSitter 
            ? "Manage daily pet reports for bookings. Submit reports by 9 PM to ensure full payment."
            : "View daily updates from your pet sitter with photos, feeding info, exercise details, and more."
          }
        </p>
      </div>

      <Alert className="border-l-4 border-l-primary">
        <Info className="h-5 w-5 text-primary" />
        <AlertDescription>
          <div className="font-semibold mb-2 text-base">How Daily Reports Work</div>
          <ul className="space-y-1.5 text-sm">
            {isSitter ? (
              <>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span><strong>Only when requested:</strong> You only provide reports when specifically requested by the pet owner</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span><strong>Short visits:</strong> 1-hour walks typically don't require reports unless requested</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 text-orange-600 flex-shrink-0" />
                  <span><strong>When required:</strong> Submit daily by 9 PM to receive full payment (15% deduction if missed)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Camera className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span><strong>Requirements:</strong> At least one photo + comprehensive details</span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span><strong>Your choice:</strong> Request daily reports when booking - they're optional</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span><strong>Guaranteed:</strong> When requested, sitters must deliver or face payment reduction</span>
                </li>
                <li className="flex items-start gap-2">
                  <Camera className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span><strong>What you get:</strong> Daily photos, feeding info, exercise details, mood, and sitter's notes</span>
                </li>
              </>
            )}
          </ul>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">{stats.completionRate}%</span>
              {stats.completionRate >= 80 ? (
                <Badge className="mb-1 bg-green-500 hover:bg-green-600">Excellent</Badge>
              ) : (
                <Badge variant="destructive" className="mb-1">Needs Work</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports Submitted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <span className="text-4xl font-bold">{stats.totalCompleted}</span>
              <p className="text-sm text-muted-foreground">of {stats.totalRequired} required</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <span className="text-4xl font-bold">{stats.thisMonth}</span>
              <p className="text-sm text-muted-foreground">reports submitted</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Payment Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <span className="text-4xl font-bold text-red-600">{stats.bookingsWithReducedPay}</span>
              <p className="text-sm text-muted-foreground">with reduced pay</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {isSitter && (
        <Alert className="border-l-4 border-l-orange-500 bg-orange-50/50">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <AlertDescription>
            <div className="font-semibold text-orange-900 mb-2">⚠️ Payment Policy (When Reports Are Requested)</div>
            <div className="text-sm text-orange-800 space-y-1.5">
              <p className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span><strong>100% Payment:</strong> Submit reports for ALL required days</span>
              </p>
              <p className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span><strong>15% Deduction:</strong> Miss even one report</span>
              </p>
              <p className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span><strong>Deadline:</strong> 9 PM daily</span>
              </p>
              <p className="flex items-start gap-2">
                <Camera className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span><strong>Requirements:</strong> Minimum 1 photo + detailed notes</span>
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CalendarIcon className="h-6 w-6 text-primary" />
              Daily Reports Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderCalendar()}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {renderSelectedDayDetails()}
        </div>
      </div>

      {isSitter && showReportForm && selectedBooking && (
        <Dialog open={showReportForm} onOpenChange={setShowReportForm}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit Daily Report</DialogTitle>
            </DialogHeader>
            <DailyReportForm
              bookingId={selectedBooking.id}
              sitterId={profile?.id || ''}
              reportDate={format(selectedDate, 'yyyy-MM-dd')}
              onSubmit={() => {
                setShowReportForm(false);
                setSelectedBooking(null);
                fetchData();
                toast({
                  title: "Report submitted!",
                  description: "The pet owner has been notified via email.",
                });
              }}
              onCancel={() => {
                setShowReportForm(false);
                setSelectedBooking(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {renderReportDetails()}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-muted-foreground mb-1">{label}</h4>
      <p className="capitalize text-sm">{value}</p>
    </div>
  );
}
