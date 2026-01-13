import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertTriangle, 
  TrendingDown, 
  Users, 
  Search, 
  MousePointerClick,
  Calendar,
  XCircle,
  CheckCircle,
  RefreshCw,
  Mail
} from 'lucide-react';
import { format, subDays } from 'date-fns';

interface FunnelData {
  visitors: number;
  searches: number;
  profileViews: number;
  formOpens: number;
  dateSelections: number;
  serviceSelections: number;
  enquiriesSent: number;
}

interface DropoffUser {
  id: string;
  name: string;
  email: string;
  stage: string;
  lastActivity: string;
  searchedFor?: string;
  viewedSitter?: string;
}

interface SupplyGap {
  suburb: string;
  searches: number;
  sitterCount: number;
  zeroResults: number;
  priority: 'critical' | 'high' | 'medium';
}

export default function AdminBookingInsights() {
  const [loading, setLoading] = useState(true);
  const [funnel, setFunnel] = useState<FunnelData>({
    visitors: 0,
    searches: 0,
    profileViews: 0,
    formOpens: 0,
    dateSelections: 0,
    serviceSelections: 0,
    enquiriesSent: 0,
  });
  const [dropoffs, setDropoffs] = useState<DropoffUser[]>([]);
  const [supplyGaps, setSupplyGaps] = useState<SupplyGap[]>([]);
  const [recentSignups, setRecentSignups] = useState<any[]>([]);
  const [period, setPeriod] = useState('7');

  useEffect(() => {
    fetchAllData();
  }, [period]);

  const fetchAllData = async () => {
    setLoading(true);
    const days = parseInt(period);
    const since = subDays(new Date(), days).toISOString();

    // Fetch funnel data
    const { data: events } = await supabase
      .from('user_events')
      .select('event_type, event_name, session_id, user_id, created_at, event_data')
      .gte('created_at', since);

    if (events) {
      const uniqueSessions = new Set(events.map(e => e.session_id)).size;
      const formViews = events.filter(e => e.event_name === 'booking_form_viewed').length;
      const dateSelects = events.filter(e => e.event_name === 'booking_date_selected').length;
      const serviceSelects = events.filter(e => e.event_name === 'booking_service_selected').length;
      const profileViews = events.filter(e => e.event_name === 'sitter_profile_view').length;
      
      const bookingSubmits = events.filter(e => {
        if (e.event_name !== 'form_submitted') return false;
        const data = e.event_data as Record<string, unknown> | null;
        return data?.form_type === 'booking';
      }).length;
      
      setFunnel({
        visitors: uniqueSessions,
        searches: events.filter(e => e.event_name === 'search_with_results').length,
        profileViews,
        formOpens: formViews,
        dateSelections: dateSelects,
        serviceSelections: serviceSelects,
        enquiriesSent: bookingSubmits,
      });
    }

    // Fetch search data for supply gaps
    const { data: searches } = await supabase
      .from('search_events')
      .select('suburb, results_count, service_type')
      .gte('created_at', since);

    const { data: sitters } = await supabase
      .from('profiles')
      .select('suburb')
      .eq('role', 'pet_sitter')
      .eq('onboarding_completed', true);

    if (searches && sitters) {
      const suburbData: Record<string, { searches: number; zeroResults: number; sitters: number }> = {};
      
      searches.forEach(s => {
        if (!s.suburb || s.suburb === 'browse_all') return;
        if (!suburbData[s.suburb]) {
          suburbData[s.suburb] = { searches: 0, zeroResults: 0, sitters: 0 };
        }
        suburbData[s.suburb].searches++;
        if (s.results_count === 0) suburbData[s.suburb].zeroResults++;
      });

      sitters.forEach(s => {
        if (s.suburb && suburbData[s.suburb]) {
          suburbData[s.suburb].sitters++;
        }
      });

      const gaps = Object.entries(suburbData)
        .filter(([_, data]) => data.searches >= 2)
        .map(([suburb, data]) => {
          const zeroRate = data.zeroResults / data.searches;
          const priority: 'critical' | 'high' | 'medium' = zeroRate > 0.5 ? 'critical' : zeroRate > 0.2 ? 'high' : 'medium';
          return {
            suburb,
            searches: data.searches,
            sitterCount: data.sitters,
            zeroResults: data.zeroResults,
            priority,
          };
        })
        .sort((a, b) => b.zeroResults - a.zeroResults)
        .slice(0, 10);

      setSupplyGaps(gaps);
    }

    // Fetch recent signups with search context
    const { data: signups } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, role, suburb, onboarding_completed, created_at')
      .eq('role', 'pet_owner')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(20);

    if (signups) {
      // Get booking counts for each signup
      const signupsWithContext = await Promise.all(signups.map(async (signup) => {
        const { count: bookingCount } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', signup.id);

        const { data: userSearches } = await supabase
          .from('search_events')
          .select('suburb, service_type, results_count')
          .eq('user_id', signup.id)
          .limit(1);

        return {
          ...signup,
          bookings: bookingCount || 0,
          lastSearch: userSearches?.[0] || null,
        };
      }));

      setRecentSignups(signupsWithContext);

      // Identify dropoffs
      const dropoffUsers = signupsWithContext
        .filter(s => s.bookings === 0)
        .map(s => {
          let stage = 'Signed up';
          if (s.onboarding_completed) stage = 'Completed onboarding';
          if (s.lastSearch) stage = 'Searched';

          return {
            id: s.id,
            name: `${s.first_name} ${s.last_name}`,
            email: s.email,
            stage,
            lastActivity: s.created_at,
            searchedFor: s.lastSearch?.suburb,
          };
        });

      setDropoffs(dropoffUsers);
    }

    setLoading(false);
  };

  const getConversionRate = (current: number, previous: number) => {
    if (previous === 0) return '0%';
    return `${Math.round((current / previous) * 100)}%`;
  };

  const getDropoffColor = (rate: number) => {
    if (rate < 30) return 'text-destructive';
    if (rate < 50) return 'text-orange-500';
    return 'text-green-500';
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const formToEnquiryRate = funnel.formOpens > 0 ? (funnel.enquiriesSent / funnel.formOpens) * 100 : 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🎯 Booking Conversion Insights</h1>
          <p className="text-muted-foreground">Actionable data to get more bookings</p>
        </div>
        <div className="flex gap-2">
          {['7', '14', '30'].map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p}d
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={fetchAllData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Critical Alert */}
      {formToEnquiryRate < 5 && funnel.formOpens > 5 && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="flex items-center gap-4 p-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
            <div>
              <p className="font-bold text-destructive">🚨 CRITICAL: Form to Enquiry Rate is {formToEnquiryRate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">
                {funnel.formOpens} people opened the booking form but only {funnel.enquiriesSent} sent enquiries. 
                Check if form is too complex or commitment anxiety is too high.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Conversion Funnel (Last {period} days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: 'Visitors', value: funnel.visitors, icon: Users },
              { label: 'Searches', value: funnel.searches, icon: Search },
              { label: 'Profile Views', value: funnel.profileViews, icon: MousePointerClick },
              { label: 'Form Opens', value: funnel.formOpens, icon: Calendar },
              { label: 'Date Selected', value: funnel.dateSelections, icon: Calendar },
              { label: 'Service Selected', value: funnel.serviceSelections, icon: CheckCircle },
              { label: 'Enquiries Sent', value: funnel.enquiriesSent, icon: Mail },
            ].map((step, i, arr) => {
              const prevValue = i === 0 ? step.value : arr[i - 1].value;
              const dropoffRate = prevValue > 0 ? Math.round((1 - step.value / prevValue) * 100) : 0;
              const Icon = step.icon;

              return (
                <div key={step.label} className="flex items-center gap-4">
                  <div className="w-40 flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{step.label}</span>
                  </div>
                  <div className="flex-1 bg-muted rounded-full h-8 relative overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(step.value / funnel.visitors) * 100}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                      {step.value}
                    </span>
                  </div>
                  {i > 0 && dropoffRate > 0 && (
                    <div className={`w-20 text-right text-sm ${getDropoffColor(100 - dropoffRate)}`}>
                      {dropoffRate > 50 && <XCircle className="w-4 h-4 inline mr-1" />}
                      -{dropoffRate}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Key Insights */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-2">
            <p className="font-semibold">💡 Key Insights:</p>
            {funnel.searches === 0 && funnel.visitors > 0 && (
              <p className="text-sm">• Visitors aren't searching - homepage may not be driving action</p>
            )}
            {funnel.profileViews < funnel.searches * 0.3 && funnel.searches > 0 && (
              <p className="text-sm">• Low profile clicks - search results may not be compelling</p>
            )}
            {funnel.formOpens < funnel.profileViews * 0.3 && funnel.profileViews > 0 && (
              <p className="text-sm">• Low form opens - sitter profiles may not have clear CTA</p>
            )}
            {funnel.enquiriesSent < funnel.formOpens * 0.1 && funnel.formOpens > 0 && (
              <p className="text-sm text-destructive">• 🚨 Massive form abandonment - form is too complex or scary</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Supply Gaps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Supply Gaps (Recruit Sitters Here)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {supplyGaps.length === 0 ? (
              <p className="text-muted-foreground">No significant gaps detected</p>
            ) : (
              <div className="space-y-3">
                {supplyGaps.map((gap) => (
                  <div key={gap.suburb} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{gap.suburb}</p>
                      <p className="text-sm text-muted-foreground">
                        {gap.searches} searches, {gap.sitterCount} sitters
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {gap.zeroResults > 0 && (
                        <Badge variant="outline" className="text-destructive border-destructive">
                          {gap.zeroResults} zero results
                        </Badge>
                      )}
                      <Badge className={getPriorityBadge(gap.priority)}>
                        {gap.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pet Owners Without Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Pet Owners Without Bookings ({dropoffs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-y-auto">
            {dropoffs.length === 0 ? (
              <p className="text-muted-foreground">All recent pet owners have booked!</p>
            ) : (
              <div className="space-y-3">
                {dropoffs.slice(0, 10).map((user) => (
                  <div key={user.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{user.name}</p>
                      <Badge variant="outline">{user.stage}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    {user.searchedFor && (
                      <p className="text-sm text-blue-600">Searched: {user.searchedFor}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(user.lastActivity), 'MMM d, h:mm a')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <Mail className="w-5 h-5 mb-2" />
              <span className="font-semibold">Send Stripe Reminders</span>
              <span className="text-xs text-muted-foreground">Remind sitters to complete payment setup</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <Users className="w-5 h-5 mb-2" />
              <span className="font-semibold">Follow Up Pet Owners</span>
              <span className="text-xs text-muted-foreground">Email owners who searched but didn't book</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <Search className="w-5 h-5 mb-2" />
              <span className="font-semibold">Recruit in Gap Areas</span>
              <span className="text-xs text-muted-foreground">Target Facebook ads to high-demand suburbs</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
