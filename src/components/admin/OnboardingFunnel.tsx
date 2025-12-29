import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Users, PawPrint, Search, MousePointerClick, CalendarCheck, CheckCircle, Eye, FormInput } from 'lucide-react';

interface FunnelStats {
  totalSignups: number;
  addedPet: number;
  searched: number;
  clickedSitter: number;
  viewedProfile: number;
  openedForm: number;
  madeBooking: number;
  completedBooking: number;
}

type Period = '7d' | '30d' | '90d' | 'all';

export function OnboardingFunnel() {
  const [stats, setStats] = useState<FunnelStats>({
    totalSignups: 0,
    addedPet: 0,
    searched: 0,
    clickedSitter: 0,
    viewedProfile: 0,
    openedForm: 0,
    madeBooking: 0,
    completedBooking: 0,
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('30d');

  useEffect(() => {
    fetchFunnelStats();
  }, [period]);

  const getDateFilter = () => {
    if (period === 'all') return null;
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
  };

  const fetchFunnelStats = async () => {
    setLoading(true);
    try {
      const dateFilter = getDateFilter();
      
      // Use the onboarding_funnel view which has pre-computed data
      let query = supabase
        .from('onboarding_funnel')
        .select('*')
        .eq('role', 'pet_owner');
      
      if (dateFilter) {
        query = query.gte('registered_at', dateFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching funnel stats:', error);
        return;
      }

      // Get click data from search_events - count unique users/sessions that clicked
      let clickQuery = supabase
        .from('search_events')
        .select('user_id, session_id, clicked_sitter_ids, created_at')
        .not('clicked_sitter_ids', 'is', null);
      
      if (dateFilter) {
        clickQuery = clickQuery.gte('created_at', dateFilter);
      }

      const { data: clickData, error: clickError } = await clickQuery;

      let clickedCount = 0;
      if (!clickError && clickData) {
        // Count searches where at least one sitter was clicked
        clickedCount = clickData.filter(e => 
          e.clicked_sitter_ids && e.clicked_sitter_ids.length > 0
        ).length;
      }

      // Get intermediate funnel events from user_events
      let eventsQuery = supabase
        .from('user_events')
        .select('event_name')
        .in('event_name', ['sitter_profile_view', 'booking_form_opened', 'booking_accordion_opened']);
      
      if (dateFilter) {
        eventsQuery = eventsQuery.gte('created_at', dateFilter);
      }

      const { data: eventsData, error: eventsError } = await eventsQuery;

      let viewedProfileCount = 0;
      let openedFormCount = 0;
      if (!eventsError && eventsData) {
        viewedProfileCount = eventsData.filter(e => e.event_name === 'sitter_profile_view').length;
        openedFormCount = eventsData.filter(e => 
          e.event_name === 'booking_form_opened' || e.event_name === 'booking_accordion_opened'
        ).length;
      }

      if (data) {
        setStats({
          totalSignups: data.length,
          addedPet: data.filter(d => d.added_pet).length,
          searched: data.filter(d => d.searched).length,
          clickedSitter: clickedCount,
          viewedProfile: viewedProfileCount,
          openedForm: openedFormCount,
          madeBooking: data.filter(d => d.made_booking).length,
          completedBooking: data.filter(d => d.completed_booking).length,
        });
      }
    } catch (error) {
      console.error('Error fetching funnel stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConversionRate = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Math.round((current / previous) * 100);
  };

  const funnelSteps = [
    { label: 'Signed Up', value: stats.totalSignups, icon: Users, color: 'bg-blue-500' },
    { label: 'Added Pet', value: stats.addedPet, icon: PawPrint, color: 'bg-purple-500' },
    { label: 'Searched', value: stats.searched, icon: Search, color: 'bg-pink-500' },
    { label: 'Clicked Sitter', value: stats.clickedSitter, icon: MousePointerClick, color: 'bg-orange-500' },
    { label: 'Viewed Profile', value: stats.viewedProfile, icon: Eye, color: 'bg-rose-500' },
    { label: 'Opened Form', value: stats.openedForm, icon: FormInput, color: 'bg-amber-500' },
    { label: 'Made Booking', value: stats.madeBooking, icon: CalendarCheck, color: 'bg-lime-500' },
    { label: 'Completed', value: stats.completedBooking, icon: CheckCircle, color: 'bg-green-500' },
  ];

  const maxValue = stats.totalSignups || 1;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Pet Owner Onboarding Funnel
          </CardTitle>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <TabsList className="h-8">
              <TabsTrigger value="7d" className="text-xs px-2">7d</TabsTrigger>
              <TabsTrigger value="30d" className="text-xs px-2">30d</TabsTrigger>
              <TabsTrigger value="90d" className="text-xs px-2">90d</TabsTrigger>
              <TabsTrigger value="all" className="text-xs px-2">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <p className="text-sm text-muted-foreground">Conversion through each stage</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-3">
            {funnelSteps.map((step, index) => {
              const prevValue = index === 0 ? step.value : funnelSteps[index - 1].value;
              const conversionRate = getConversionRate(step.value, prevValue);
              const widthPercent = (step.value / maxValue) * 100;

              return (
                <div key={step.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <step.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{step.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{step.value}</span>
                      {index > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          conversionRate >= 50 ? 'bg-green-100 text-green-700' :
                          conversionRate >= 25 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {conversionRate}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-6 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${step.color} transition-all duration-500 rounded-full flex items-center justify-end pr-2`}
                      style={{ width: `${Math.max(widthPercent, 5)}%` }}
                    >
                      {widthPercent > 15 && (
                        <span className="text-xs text-white font-medium">
                          {Math.round(widthPercent)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
