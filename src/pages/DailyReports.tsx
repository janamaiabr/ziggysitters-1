import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, Calendar, Heart, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import ReportsCalendar from '@/components/daily-reports/ReportsCalendar';
import ClientDailyReports from '@/components/ClientDailyReports';
import { supabase } from '@/integrations/supabase/client';

export default function DailyReports() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [stats, setStats] = useState({
    totalReportsRequired: 0,
    totalReportsSubmitted: 0,
    reportsThisMonth: 0,
    paymentImpact: 0,
  });

  useEffect(() => {
    if (profile?.id) {
      fetchReportStats();
    }
  }, [profile]);

  const fetchReportStats = async () => {
    try {
      // Get sitter's bookings that require daily reports
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('sitter_id', profile?.id)
        .eq('requires_daily_reports', true)
        .in('status', ['confirmed', 'in_progress', 'completed']);

      const { data: reports } = await supabase
        .from('daily_reports')
        .select('*')
        .eq('sitter_id', profile?.id);

      let totalRequired = 0;
      let paymentImpactCount = 0;
      const currentMonth = new Date().getMonth();

      // Calculate required reports and payment impact (only for bookings requiring reports)
      bookings?.forEach(booking => {
        const startDate = new Date(booking.start_date);
        const endDate = new Date(booking.end_date);
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
        
        totalRequired += daysDiff;

        // Check if all reports were submitted for this booking
        const bookingReports = reports?.filter(r => r.booking_id === booking.id) || [];
        if (bookingReports.length < daysDiff && booking.status === 'completed') {
          paymentImpactCount++;
        }
      });

      const reportsThisMonth = reports?.filter(r => 
        new Date(r.report_date).getMonth() === currentMonth
      ).length || 0;

      setStats({
        totalReportsRequired: totalRequired,
        totalReportsSubmitted: reports?.length || 0,
        reportsThisMonth,
        paymentImpact: paymentImpactCount,
      });
    } catch (error) {
      console.error('Error fetching report stats:', error);
    }
  };

  // Show client view for pet owners
  if (profile?.role === 'pet_owner') {
    return <ClientDailyReports />;
  }

  // Show sitter access message for non-sitters
  if (!profile || profile.role !== 'pet_sitter') {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-6">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-xl font-semibold mb-2">Sitter Access Only</h2>
            <p className="text-muted-foreground">
              This section is only available for registered pet sitters.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completionRate = stats.totalReportsRequired > 0 
    ? Math.round((stats.totalReportsSubmitted / stats.totalReportsRequired) * 100) 
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Daily Reports Dashboard</h1>
        <p className="text-muted-foreground">
          Manage daily pet reports for bookings that request them. Stay on top of your reporting to ensure full payment.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{completionRate}%</p>
              </div>
              <TrendingUp className={`h-8 w-8 ${completionRate >= 95 ? 'text-green-500' : completionRate >= 80 ? 'text-yellow-500' : 'text-red-500'}`} />
            </div>
            <Badge 
              variant={completionRate >= 95 ? "default" : completionRate >= 80 ? "secondary" : "destructive"}
              className="mt-2"
            >
              {completionRate >= 95 ? 'Excellent' : completionRate >= 80 ? 'Good' : 'Needs Improvement'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reports Submitted</p>
                <p className="text-2xl font-bold">{stats.totalReportsSubmitted}</p>
                <p className="text-xs text-muted-foreground">of {stats.totalReportsRequired} required</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{stats.reportsThisMonth}</p>
                <p className="text-xs text-muted-foreground">reports submitted</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Impact</p>
                <p className="text-2xl font-bold">{stats.paymentImpact}</p>
                <p className="text-xs text-muted-foreground">bookings with reduced pay</p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${stats.paymentImpact === 0 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Important Notice */}
      <Card className="mb-8 border-l-4 border-l-amber-500 bg-amber-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
            Daily Report Payment Policy (When Requested)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="font-medium">For bookings that request daily reports:</p>
            <p><strong>✅ 100% Payment:</strong> Submit daily reports for ALL required days</p>
            <p><strong>⚠️ 15% Deduction:</strong> Miss even one daily report</p>
            <p><strong>⏰ Deadline:</strong> Reports must be submitted by 9 PM each day</p>
            <p><strong>📸 Requirements:</strong> At least one photo + comprehensive details required</p>
            <p className="text-xs text-muted-foreground mt-2">Note: Pet owners can choose whether to request daily reports when booking.</p>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <ReportsCalendar sitterId={profile.id} />

      {/* Tips Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Tips for Great Daily Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">📸 Photo Tips</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Take clear, well-lit photos</li>
                <li>• Show the pet's face and body</li>
                <li>• Capture them in different activities</li>
                <li>• Include their sleeping spot</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">📝 Writing Tips</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Be specific about activities</li>
                <li>• Mention any unusual behaviors</li>
                <li>• Include cute moments and personality</li>
                <li>• Note any concerns immediately</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}