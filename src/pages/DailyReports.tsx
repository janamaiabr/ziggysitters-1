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
  AlertCircle, CheckCircle, Info, Utensils, Dumbbell, ChevronLeft, ChevronRight, Home, Moon
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import DailyReportForm from '@/components/daily-reports/DailyReportForm';

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
  food_notes?: string;
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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [viewingReport, setViewingReport] = useState<DailyReport | null>(null);
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

      let reportsQuery = supabase.from('daily_reports').select('*');
      
      if (isSitter) {
        reportsQuery = reportsQuery.eq('sitter_id', profile.id);
      } else {
        const bookingIds = (bookingsData || []).map(b => b.id);
        if (bookingIds.length > 0) {
          reportsQuery = reportsQuery.in('booking_id', bookingIds);
        } else {
          reportsQuery = reportsQuery.eq('booking_id', 'none');
        }
      }

      const { data: reportsData, error: reportsError } = await reportsQuery;
      if (reportsError) throw reportsError;

      setReports(reportsData || []);

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

  const stats = getStatistics();
  const dayBookings = getDayBookings(selectedDate);
  const dayReports = getDayReports(selectedDate);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 p-4 md:p-8 flex items-center justify-center">
        <div className="text-2xl font-semibold text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 pb-20">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-[hsl(207,89%,51%)] to-[hsl(182,85%,39%)] text-white py-6 md:py-8 px-4 shadow-lg">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-2">
            <Camera className="h-7 w-7 md:h-8 md:w-8" />
            <h1 className="text-2xl md:text-3xl font-bold">Daily Reports</h1>
          </div>
          <p className="text-base md:text-lg text-white/90 font-medium">
            {isSitter ? 'Submit your daily pet care reports' : 'View your pet\'s daily care reports'}
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-6 md:py-10">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white shadow-md border border-blue-200">
            <CardContent className="p-4">
              <div className="text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">{stats.completionRate}%</div>
                <div className="text-sm md:text-base font-semibold text-gray-700">Completion Rate</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md border border-cyan-200">
            <CardContent className="p-4">
              <div className="text-center">
                <FileText className="h-6 w-6 mx-auto mb-2 text-cyan-600" />
                <div className="text-2xl md:text-3xl font-bold text-cyan-600 mb-1">{stats.totalCompleted}</div>
                <div className="text-sm md:text-base font-semibold text-gray-700">Reports Submitted</div>
                <div className="text-xs text-gray-500">of {stats.totalRequired} required</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md border border-green-200">
            <CardContent className="p-4">
              <div className="text-center">
                <CalendarIcon className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1">{stats.thisMonth}</div>
                <div className="text-sm md:text-base font-semibold text-gray-700">This Month</div>
              </div>
            </CardContent>
          </Card>

          {isSitter && (
            <Card className="bg-white shadow-md border border-orange-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <AlertCircle className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-1">{stats.bookingsWithReducedPay}</div>
                  <div className="text-sm md:text-base font-semibold text-gray-700">Reduced Pay</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Information Alerts */}
        {isSitter && (
          <Alert className="mb-6 border border-orange-300 bg-orange-50">
            <Info className="h-5 w-5 text-orange-600" />
            <AlertDescription className="text-sm text-gray-800 ml-2">
              <strong>Important:</strong> Daily reports help pet owners stay connected with their pets. Quick & easy — most reports take under 5 minutes.
              <br />
              <strong>Reporting Schedule:</strong> Submit one report per day during the booking period, anytime within the 24-hour day. The first report should be submitted on the booking start date.
            </AlertDescription>
          </Alert>
        )}
        
        {!isSitter && (
          <Alert className="mb-6 border border-blue-300 bg-blue-50">
            <Info className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-sm text-gray-800 ml-2">
              <strong>How Daily Reports Work:</strong> Your sitter will submit one report per day during the booking period. Click anywhere on the report card to view full details including photos and notes.
            </AlertDescription>
          </Alert>
        )}

        {/* Calendar */}
        <Card className="mb-8 shadow-lg border-2 border-blue-200 bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-100 border-b border-blue-200">
            <CardTitle className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button
                size="default"
                variant="outline"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="font-semibold border border-blue-300 hover:bg-blue-50"
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Previous
              </Button>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <Button
                size="default"
                variant="outline"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="font-semibold border border-blue-300 hover:bg-blue-50"
              >
                Next
                <ChevronRight className="h-5 w-5 ml-1" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center p-2 font-bold text-sm text-gray-700 bg-blue-50 rounded-lg">
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {eachDayOfInterval({
                start: startOfWeek(startOfMonth(currentMonth)),
                end: endOfWeek(endOfMonth(currentMonth))
              }).map((day) => {
                const status = getDayStatus(day);
                const isToday = isSameDay(day, new Date());
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const bookingsOnDay = getDayBookings(day);
                const reportsOnDay = getDayReports(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    disabled={!isCurrentMonth}
                    className={`
                      relative min-h-16 md:min-h-20 p-2 rounded-lg transition-all text-center flex flex-col items-center justify-center gap-1
                      ${!isCurrentMonth ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                      ${isSelected ? 'ring-2 ring-blue-500 shadow-lg scale-105' : ''}
                      ${status === 'completed' && isCurrentMonth ? 'bg-green-100 hover:bg-green-200' : ''}
                      ${status === 'pending' && isCurrentMonth ? 'bg-red-100 hover:bg-red-200' : ''}
                      ${status === 'none' && isCurrentMonth ? 'bg-white hover:bg-gray-50' : ''}
                      ${isToday ? 'border-2 border-blue-600 font-bold' : 'border border-gray-200'}
                    `}
                  >
                    <span className={`text-lg md:text-xl font-bold ${isToday ? 'text-blue-600' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    
                    {bookingsOnDay.length > 0 && isCurrentMonth && (
                      <>
                        <div className={`
                          w-5 h-5 md:w-6 md:h-6 rounded-full shadow-md
                          ${status === 'completed' ? 'bg-green-500' : 'bg-red-500'}
                        `} />
                        <span className="text-xs md:text-sm font-bold text-gray-700">
                          {reportsOnDay.length}/{bookingsOnDay.length}
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-green-300 shadow-sm">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-800">Report Submitted</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-red-300 shadow-sm">
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-800">Report Due</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        <Card className="shadow-lg border-2 border-cyan-200 bg-white">
          <CardHeader className="bg-gradient-to-r from-cyan-100 to-blue-100 border-b border-cyan-200">
            <CardTitle className="text-lg md:text-xl font-bold text-gray-800">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {dayBookings.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="h-20 w-20 mx-auto mb-4 text-gray-300" />
                <p className="text-2xl font-semibold text-gray-500 mb-2">No bookings on this date</p>
                <p className="text-lg text-gray-400">Select a date with bookings to view details</p>
              </div>
            ) : (
              <div className="space-y-6">
                {dayBookings.map(booking => {
                  const bookingReport = dayReports.find(r => r.booking_id === booking.id);
                  const otherPersonId = isSitter ? booking.owner_id : booking.sitter_id;
                  const otherPerson = profiles.get(otherPersonId);
                  const bookingPets = booking.pet_ids?.map(id => pets.get(id)).filter(Boolean) || [];

                  return (
                    <div key={booking.id} className="border-4 border-blue-200 rounded-2xl p-6 bg-gradient-to-r from-blue-50 to-cyan-50">
                      {/* Booking Header */}
                      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-200">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16 md:h-20 md:w-20 border-4 border-blue-300">
                            <AvatarImage src={otherPerson?.avatar_url || ''} />
                            <AvatarFallback className="bg-blue-200 text-blue-700 text-2xl font-bold">
                              {otherPerson?.first_name?.[0] || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-2xl font-bold text-gray-800">
                              {otherPerson?.first_name || 'Loading'} {otherPerson?.last_name || '...'}
                            </p>
                            <p className="text-lg text-gray-600">
                              {isSitter ? 'Pet Owner' : 'Pet Sitter'}
                            </p>
                            <p className="text-xl font-semibold mt-1 text-blue-600">
                              🐾 {bookingPets.map(p => p?.name).join(', ') || 'Loading pets...'}
                            </p>
                          </div>
                        </div>
                        
                        {bookingReport ? (
                          <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 px-6 py-3 text-lg">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Submitted
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="px-6 py-3 text-lg">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            Due
                          </Badge>
                        )}
                      </div>

                      {/* Report Content or Submit Button */}
                      {bookingReport ? (
                        <div className="space-y-4">
                          {/* View Full Report Button */}
                          {viewingReport?.id === bookingReport.id ? (
                            <div className="space-y-6 border-t-2 border-blue-200 pt-6">
                              {/* Full Report View */}
                              <Button
                                variant="outline"
                                size="lg"
                                onClick={() => setViewingReport(null)}
                                className="w-full text-lg font-semibold border-2"
                              >
                                Hide Full Report
                              </Button>

                              {/* Photos */}
                              {bookingReport.photo_urls && bookingReport.photo_urls.length > 0 && (
                                <div className="space-y-3">
                                  <h4 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Camera className="h-6 w-6 text-blue-600" />
                                    Photos ({bookingReport.photo_urls.length})
                                  </h4>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {bookingReport.photo_urls.map((url, idx) => (
                                      <img
                                        key={idx}
                                        src={url}
                                        alt={`Photo ${idx + 1}`}
                                        className="w-full h-48 object-cover rounded-xl border-4 border-blue-200 shadow-lg"
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Detailed Stats Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-6 rounded-xl border-2 border-blue-200 shadow-md">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="text-4xl">{bookingReport.mood === 'very_happy' ? '😄' : bookingReport.mood === 'happy' ? '😊' : bookingReport.mood === 'calm' ? '😌' : bookingReport.mood === 'anxious' ? '😰' : '😢'}</div>
                                    <div>
                                      <p className="text-sm text-gray-600 font-semibold">Mood</p>
                                      <p className="text-xl font-bold capitalize text-gray-800">{bookingReport.mood?.replace('_', ' ')}</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-white p-6 rounded-xl border-2 border-blue-200 shadow-md">
                                  <div className="flex items-center gap-3 mb-2">
                                    <Utensils className="h-8 w-8 text-blue-600" />
                                    <div>
                                      <p className="text-sm text-gray-600 font-semibold">Food Consumption</p>
                                      <p className="text-xl font-bold capitalize text-gray-800">{bookingReport.food_consumption}</p>
                                    </div>
                                  </div>
                                  {bookingReport.food_notes && (
                                    <p className="text-sm text-gray-600 mt-2">{bookingReport.food_notes}</p>
                                  )}
                                </div>

                                <div className="bg-white p-6 rounded-xl border-2 border-blue-200 shadow-md">
                                  <div className="flex items-center gap-3 mb-2">
                                    <Dumbbell className="h-8 w-8 text-blue-600" />
                                    <div>
                                      <p className="text-sm text-gray-600 font-semibold">Exercise</p>
                                      <p className="text-xl font-bold text-gray-800">{bookingReport.exercise_duration} minutes</p>
                                    </div>
                                  </div>
                                  {bookingReport.exercise_notes && (
                                    <p className="text-sm text-gray-600 mt-2">{bookingReport.exercise_notes}</p>
                                  )}
                                </div>

                                {bookingReport.sleep_quality && (
                                  <div className="bg-white p-6 rounded-xl border-2 border-blue-200 shadow-md">
                                    <div className="flex items-center gap-3 mb-2">
                                      <Moon className="h-8 w-8 text-blue-600" />
                                      <div>
                                        <p className="text-sm text-gray-600 font-semibold">Sleep Quality</p>
                                        <p className="text-xl font-bold capitalize text-gray-800">{bookingReport.sleep_quality}</p>
                                      </div>
                                    </div>
                                    {bookingReport.sleep_notes && (
                                      <p className="text-sm text-gray-600 mt-2">{bookingReport.sleep_notes}</p>
                                    )}
                                  </div>
                                )}

                                {bookingReport.time_alone_hours !== undefined && bookingReport.time_alone_hours !== null && (
                                  <div className="bg-white p-6 rounded-xl border-2 border-blue-200 shadow-md">
                                    <div className="flex items-center gap-3 mb-2">
                                      <Home className="h-8 w-8 text-blue-600" />
                                      <div>
                                        <p className="text-sm text-gray-600 font-semibold">Time Alone</p>
                                        <p className="text-xl font-bold text-gray-800">{bookingReport.time_alone_hours} hours</p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {bookingReport.medication_given && (
                                  <div className="bg-white p-6 rounded-xl border-2 border-blue-200 shadow-md col-span-2">
                                    <div className="flex items-center gap-3 mb-2">
                                      <CheckCircle className="h-8 w-8 text-green-600" />
                                      <div>
                                        <p className="text-sm text-gray-600 font-semibold">Medication</p>
                                        <p className="text-xl font-bold text-gray-800">Given</p>
                                      </div>
                                    </div>
                                    {bookingReport.medication_notes && (
                                      <p className="text-sm text-gray-600 mt-2">{bookingReport.medication_notes}</p>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* General Notes */}
                              {bookingReport.general_notes && (
                                <div className="bg-white p-6 rounded-xl border-2 border-blue-200 shadow-md">
                                  <h4 className="text-xl font-bold text-gray-800 mb-3">General Notes</h4>
                                  <p className="text-lg text-gray-700 leading-relaxed">{bookingReport.general_notes}</p>
                                </div>
                              )}

                              {/* Submission Time */}
                              <div className="text-sm text-gray-500 text-center">
                                Submitted: {format(new Date(bookingReport.submitted_at), 'PPpp')}
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setViewingReport(bookingReport)}
                            >
                              <Button
                                size="lg"
                                className="w-full text-xl font-semibold py-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 pointer-events-none"
                              >
                                <FileText className="h-6 w-6 mr-3" />
                                View Full Report
                              </Button>
                              
                              {/* Quick Summary - Now Clickable */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                                <div className="bg-white p-4 rounded-lg border-2 border-blue-200 text-center hover:border-blue-400 transition-colors">
                                  <div className="text-3xl mb-1">{bookingReport.mood === 'very_happy' ? '😄' : bookingReport.mood === 'happy' ? '😊' : '😌'}</div>
                                  <p className="text-sm font-semibold text-gray-600">Mood</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border-2 border-blue-200 text-center hover:border-blue-400 transition-colors">
                                  <Utensils className="h-8 w-8 mx-auto mb-1 text-blue-600" />
                                  <p className="text-sm font-semibold text-gray-600 capitalize">{bookingReport.food_consumption}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border-2 border-blue-200 text-center hover:border-blue-400 transition-colors">
                                  <Dumbbell className="h-8 w-8 mx-auto mb-1 text-blue-600" />
                                  <p className="text-sm font-semibold text-gray-600">{bookingReport.exercise_duration}m</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border-2 border-blue-200 text-center hover:border-blue-400 transition-colors">
                                  <Camera className="h-8 w-8 mx-auto mb-1 text-blue-600" />
                                  <p className="text-sm font-semibold text-gray-600">{bookingReport.photo_urls?.length || 0} photos</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : isSitter ? (
                        <div className="space-y-4">
                          {showReportForm && selectedBooking?.id === booking.id ? (
                            <div className="border-t-4 border-blue-200 pt-6">
                              <Button
                                variant="outline"
                                size="lg"
                                onClick={() => {
                                  setShowReportForm(false);
                                  setSelectedBooking(null);
                                }}
                                className="mb-6 text-lg font-semibold border-2"
                              >
                                Cancel
                              </Button>
                              <DailyReportForm
                                bookingId={booking.id}
                                sitterId={booking.sitter_id}
                                reportDate={format(selectedDate, 'yyyy-MM-dd')}
                                onSubmit={() => {
                                  setShowReportForm(false);
                                  setSelectedBooking(null);
                                  fetchData();
                                  toast({
                                    title: "Report Submitted!",
                                    description: "Your daily report has been sent to the pet owner.",
                                  });
                                }}
                                onCancel={() => {
                                  setShowReportForm(false);
                                  setSelectedBooking(null);
                                }}
                              />
                            </div>
                          ) : (
                            <Button
                              size="lg"
                              onClick={() => {
                                setShowReportForm(true);
                                setSelectedBooking(booking);
                              }}
                              className="w-full text-xl font-semibold py-8 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                            >
                              <Camera className="h-7 w-7 mr-3" />
                              Submit Report for Today
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-orange-500" />
                          <p className="text-2xl font-semibold text-gray-700">Report not yet submitted</p>
                          <p className="text-lg text-gray-500 mt-2">The sitter hasn't submitted today's report yet</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
