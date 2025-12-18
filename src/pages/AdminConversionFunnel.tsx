import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, TrendingDown, Users, Search, 
  CalendarCheck, CheckCircle, AlertTriangle,
  ArrowRight, Lightbulb, RefreshCw, Clock, Target
} from 'lucide-react';

interface FunnelStep {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface FunnelData {
  totalVisitors: number;
  searchSessions: number;
  sitterClicks: number;
  bookingRequests: number;
  paymentsCompleted: number;
  completedBookings: number;
}

interface DropoffInsight {
  stage: string;
  dropoffRate: number;
  severity: 'critical' | 'warning' | 'ok';
  issue: string;
  solution: string;
}

export default function AdminConversionFunnel() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null);
  const [petOwnerFunnel, setPetOwnerFunnel] = useState<{
    totalSignups: number;
    addedPet: number;
    searched: number;
    madeBooking: number;
    completedBooking: number;
  } | null>(null);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const [bookingsByStatus, setBookingsByStatus] = useState<{ status: string; count: number }[]>([]);
  const [stuckBookings, setStuckBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchAllData();
  }, [period]);

  const getPeriodMs = () => {
    switch (period) {
      case '7d': return 7 * 24 * 60 * 60 * 1000;
      case '30d': return 30 * 24 * 60 * 60 * 1000;
      case '90d': return 90 * 24 * 60 * 60 * 1000;
      default: return 365 * 24 * 60 * 60 * 1000;
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchFunnelData(),
        fetchPetOwnerFunnel(),
        fetchRecentSearches(),
        fetchBookingsByStatus(),
        fetchStuckBookings(),
      ]);
    } catch (error) {
      console.error('Error fetching funnel data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFunnelData = async () => {
    const { data: searchData } = await supabase
      .from('search_events')
      .select('id, session_id, clicked_sitter_ids, user_id, results_count')
      .gte('created_at', new Date(Date.now() - getPeriodMs()).toISOString());

    const uniqueSessions = new Set(searchData?.map(s => s.session_id)).size;
    const searchesWithClicks = searchData?.filter(s => 
      s.clicked_sitter_ids && s.clicked_sitter_ids.length > 0
    ).length || 0;

    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, status, payment_status')
      .gte('created_at', new Date(Date.now() - getPeriodMs()).toISOString());

    const totalBookings = bookings?.length || 0;
    const paidBookings = bookings?.filter(b => b.payment_status === 'paid').length || 0;
    const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;

    const { count: pageViews } = await supabase
      .from('user_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'page_view')
      .gte('created_at', new Date(Date.now() - getPeriodMs()).toISOString());

    setFunnelData({
      totalVisitors: pageViews || 0,
      searchSessions: uniqueSessions,
      sitterClicks: searchesWithClicks,
      bookingRequests: totalBookings,
      paymentsCompleted: paidBookings,
      completedBookings: completedBookings,
    });
  };

  const fetchPetOwnerFunnel = async () => {
    const { data } = await supabase
      .from('onboarding_funnel')
      .select('*')
      .eq('role', 'pet_owner');

    if (data) {
      setPetOwnerFunnel({
        totalSignups: data.length,
        addedPet: data.filter(d => d.added_pet).length,
        searched: data.filter(d => d.searched).length,
        madeBooking: data.filter(d => d.made_booking).length,
        completedBooking: data.filter(d => d.completed_booking).length,
      });
    }
  };

  const fetchRecentSearches = async () => {
    const { data } = await supabase
      .from('search_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    setRecentSearches(data || []);
  };

  const fetchBookingsByStatus = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('status, payment_status')
      .gte('created_at', new Date(Date.now() - getPeriodMs()).toISOString());

    const statusCounts: Record<string, number> = {};
    data?.forEach(b => {
      const key = `${b.status} (${b.payment_status})`;
      statusCounts[key] = (statusCounts[key] || 0) + 1;
    });

    setBookingsByStatus(Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    })));
  };

  const fetchStuckBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select(`
        id, status, payment_status, created_at, total_amount,
        sitter:profiles!bookings_sitter_id_fkey(first_name, last_name, stripe_account_enabled),
        owner:profiles!bookings_owner_id_fkey(first_name, last_name, email)
      `)
      .in('status', ['pending', 'awaiting_payment'])
      .lt('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    setStuckBookings(data || []);
  };

  const getConversionRate = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Math.round((current / previous) * 100);
  };

  const getDropoffInsights = (): DropoffInsight[] => {
    if (!petOwnerFunnel) return [];

    const insights: DropoffInsight[] = [];
    
    const petDropoff = 100 - getConversionRate(petOwnerFunnel.addedPet, petOwnerFunnel.totalSignups);
    if (petDropoff > 50) {
      insights.push({
        stage: 'Add Pet',
        dropoffRate: petDropoff,
        severity: petDropoff > 70 ? 'critical' : 'warning',
        issue: `${petDropoff}% of users never add a pet after signing up`,
        solution: 'Simplify pet form, add progress indicator, send reminder email after 24h',
      });
    }

    const searchDropoff = 100 - getConversionRate(petOwnerFunnel.searched, petOwnerFunnel.addedPet);
    if (searchDropoff > 30) {
      insights.push({
        stage: 'Search',
        dropoffRate: searchDropoff,
        severity: searchDropoff > 60 ? 'critical' : 'warning',
        issue: `${searchDropoff}% of users with pets never search for sitters`,
        solution: 'Auto-redirect to search after pet added, highlight search CTA',
      });
    }

    const bookingDropoff = 100 - getConversionRate(petOwnerFunnel.madeBooking, petOwnerFunnel.searched);
    if (bookingDropoff > 70) {
      insights.push({
        stage: 'Booking Request',
        dropoffRate: bookingDropoff,
        severity: bookingDropoff > 90 ? 'critical' : 'warning',
        issue: `${bookingDropoff}% of searchers never request a booking`,
        solution: 'Check search results quality, sitter availability, pricing display',
      });
    }

    if (funnelData && funnelData.sitterClicks === 0 && funnelData.searchSessions > 10) {
      insights.push({
        stage: 'Click Tracking',
        dropoffRate: 100,
        severity: 'critical',
        issue: 'Sitter click tracking is not working - 0 clicks recorded',
        solution: 'Debug useSearchTracking hook - trackSitterClick may have RLS issues',
      });
    }

    return insights;
  };

  const funnelSteps: FunnelStep[] = petOwnerFunnel ? [
    { label: 'Signed Up', value: petOwnerFunnel.totalSignups, icon: Users, color: 'bg-blue-500' },
    { label: 'Added Pet', value: petOwnerFunnel.addedPet, icon: Target, color: 'bg-purple-500' },
    { label: 'Searched', value: petOwnerFunnel.searched, icon: Search, color: 'bg-pink-500' },
    { label: 'Requested Booking', value: petOwnerFunnel.madeBooking, icon: CalendarCheck, color: 'bg-amber-500' },
    { label: 'Completed Booking', value: petOwnerFunnel.completedBooking, icon: CheckCircle, color: 'bg-green-500' },
  ] : [];

  const insights = getDropoffInsights();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Conversion Funnel</h1>
          <p className="text-muted-foreground">Understand where users drop off and why</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={period} onValueChange={(v) => setPeriod(v as '7d' | '30d' | '90d' | 'all')}>
            <TabsList>
              <TabsTrigger value="7d">7 days</TabsTrigger>
              <TabsTrigger value="30d">30 days</TabsTrigger>
              <TabsTrigger value="90d">90 days</TabsTrigger>
              <TabsTrigger value="all">All time</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" onClick={fetchAllData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {insights.filter(i => i.severity === 'critical').length > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Critical Issues Found
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.filter(i => i.severity === 'critical').map((insight, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-background rounded-lg">
                <Badge variant="destructive">{insight.stage}</Badge>
                <div className="flex-1">
                  <p className="font-medium">{insight.issue}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Lightbulb className="h-3 w-3" />
                    {insight.solution}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Pet Owner Journey Funnel
          </CardTitle>
          <CardDescription>From signup to completed booking (all time)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <div className="space-y-4">
              {funnelSteps.map((step, index) => {
                const prevValue = index === 0 ? step.value : funnelSteps[index - 1].value;
                const conversionRate = getConversionRate(step.value, prevValue);
                const dropoffRate = index === 0 ? 0 : 100 - conversionRate;
                const widthPercent = (step.value / (funnelSteps[0]?.value || 1)) * 100;
                const StepIcon = step.icon;

                return (
                  <div key={step.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StepIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{step.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">{step.value}</span>
                        {index > 0 && (
                          <div className="flex items-center gap-1">
                            <Badge 
                              variant={conversionRate >= 50 ? 'default' : conversionRate >= 25 ? 'secondary' : 'destructive'}
                              className="text-xs"
                            >
                              {conversionRate}% converted
                            </Badge>
                            {dropoffRate > 50 && (
                              <Badge variant="outline" className="text-xs text-destructive border-destructive">
                                <TrendingDown className="h-3 w-3 mr-1" />
                                {dropoffRate}% dropped
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="h-10 bg-muted rounded-lg overflow-hidden relative">
                      <div
                        className={`h-full ${step.color} transition-all duration-700 rounded-lg flex items-center justify-end pr-3`}
                        style={{ width: `${Math.max(widthPercent, 5)}%` }}
                      >
                        {widthPercent > 20 && (
                          <span className="text-sm text-white font-medium">
                            {Math.round(widthPercent)}%
                          </span>
                        )}
                      </div>
                    </div>
                    {index < funnelSteps.length - 1 && dropoffRate > 0 && (
                      <div className="flex items-center justify-center text-xs text-muted-foreground">
                        <ArrowRight className="h-3 w-3 mx-1" />
                        {step.value - funnelSteps[index + 1].value} users dropped off here
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Search Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Search Activity ({period})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {funnelData && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <div className="text-3xl font-bold">{funnelData.searchSessions}</div>
                    <div className="text-sm text-muted-foreground">Search Sessions</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <div className="text-3xl font-bold">{funnelData.sitterClicks}</div>
                    <div className="text-sm text-muted-foreground">Sitter Clicks</div>
                    {funnelData.sitterClicks === 0 && funnelData.searchSessions > 0 && (
                      <Badge variant="destructive" className="mt-2 text-xs">
                        Tracking broken!
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Click-through rate: {getConversionRate(funnelData.sitterClicks, funnelData.searchSessions)}%
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              Booking Status ({period})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookingsByStatus.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No bookings in this period</div>
            ) : (
              <div className="space-y-2">
                {bookingsByStatus.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <span className="text-sm">{item.status}</span>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stuck Bookings */}
      {stuckBookings.length > 0 && (
        <Card className="border-amber-500/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-amber-600">
              <Clock className="h-5 w-5" />
              Stuck Bookings ({stuckBookings.length})
            </CardTitle>
            <CardDescription>Bookings pending for 48+ hours that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stuckBookings.map((booking) => (
                <div key={booking.id} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">
                        {(booking.owner as any)?.first_name} {(booking.owner as any)?.last_name}
                        <ArrowRight className="h-3 w-3 inline mx-2" />
                        {(booking.sitter as any)?.first_name} {(booking.sitter as any)?.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ${booking.total_amount} • {new Date(booking.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={booking.status === 'pending' ? 'secondary' : 'outline'}>
                        {booking.status}
                      </Badge>
                      {!(booking.sitter as any)?.stripe_account_enabled && (
                        <div className="text-xs text-destructive mt-1">
                          Sitter has no Stripe!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actionable Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              All Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight, idx) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant={insight.severity === 'critical' ? 'destructive' : insight.severity === 'warning' ? 'secondary' : 'outline'}
                    >
                      {insight.stage}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {insight.dropoffRate}% drop-off
                    </span>
                  </div>
                  <p className="font-medium">{insight.issue}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <Lightbulb className="h-3 w-3 inline mr-1" />
                    {insight.solution}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Search Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Search Activity</CardTitle>
          <CardDescription>Last 20 searches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {recentSearches.map((search) => (
              <div key={search.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{search.suburb || 'Any location'}</Badge>
                  <span className="text-muted-foreground">{search.service_type || 'Any service'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{search.results_count || 0} results</span>
                  {search.clicked_sitter_ids?.length > 0 ? (
                    <Badge variant="default" className="text-xs">
                      {search.clicked_sitter_ids.length} clicks
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">No clicks</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(search.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
