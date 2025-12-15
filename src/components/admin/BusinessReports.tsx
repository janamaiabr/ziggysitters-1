import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, startOfWeek, startOfMonth, endOfDay } from 'date-fns';
import { TrendingUp, Users, CalendarCheck, DollarSign, UserPlus, PawPrint } from 'lucide-react';

interface ReportStats {
  newUsers: number;
  newSitters: number;
  newOwners: number;
  newBookings: number;
  completedBookings: number;
  totalRevenue: number;
  newPets: number;
  searchEvents: number;
}

export function BusinessReports() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [stats, setStats] = useState<ReportStats>({
    newUsers: 0,
    newSitters: 0,
    newOwners: 0,
    newBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    newPets: 0,
    searchEvents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'daily':
        startDate = startOfDay(now);
        break;
      case 'weekly':
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'monthly':
        startDate = startOfMonth(now);
        break;
    }
    
    return {
      start: startDate.toISOString(),
      end: endOfDay(now).toISOString(),
    };
  };

  const fetchReportData = async () => {
    setLoading(true);
    const { start, end } = getDateRange();

    try {
      const [
        usersRes,
        sittersRes,
        ownersRes,
        bookingsRes,
        completedRes,
        revenueRes,
        petsRes,
        searchRes,
      ] = await Promise.all([
        // New users
        supabase.from('profiles').select('id', { count: 'exact', head: true })
          .gte('created_at', start).lte('created_at', end),
        // New sitters
        supabase.from('profiles').select('id', { count: 'exact', head: true })
          .eq('role', 'pet_sitter')
          .gte('created_at', start).lte('created_at', end),
        // New owners
        supabase.from('profiles').select('id', { count: 'exact', head: true })
          .eq('role', 'pet_owner')
          .gte('created_at', start).lte('created_at', end),
        // New bookings
        supabase.from('bookings').select('id', { count: 'exact', head: true })
          .gte('created_at', start).lte('created_at', end),
        // Completed bookings
        supabase.from('bookings').select('id', { count: 'exact', head: true })
          .eq('status', 'completed')
          .gte('updated_at', start).lte('updated_at', end),
        // Revenue from completed bookings
        supabase.from('bookings').select('platform_fee')
          .eq('status', 'completed')
          .eq('payment_status', 'paid')
          .gte('updated_at', start).lte('updated_at', end),
        // New pets added
        supabase.from('pets').select('id', { count: 'exact', head: true })
          .gte('created_at', start).lte('created_at', end),
        // Search events
        supabase.from('search_events').select('id', { count: 'exact', head: true })
          .gte('created_at', start).lte('created_at', end),
      ]);

      const totalRevenue = revenueRes.data?.reduce((sum, b) => sum + (b.platform_fee || 0), 0) || 0;

      setStats({
        newUsers: usersRes.count || 0,
        newSitters: sittersRes.count || 0,
        newOwners: ownersRes.count || 0,
        newBookings: bookingsRes.count || 0,
        completedBookings: completedRes.count || 0,
        totalRevenue,
        newPets: petsRes.count || 0,
        searchEvents: searchRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'daily': return 'Today';
      case 'weekly': return 'This Week';
      case 'monthly': return 'This Month';
    }
  };

  const statCards = [
    { label: 'New Users', value: stats.newUsers, icon: UserPlus, color: 'text-blue-600' },
    { label: 'New Sitters', value: stats.newSitters, icon: Users, color: 'text-green-600' },
    { label: 'New Owners', value: stats.newOwners, icon: Users, color: 'text-purple-600' },
    { label: 'New Bookings', value: stats.newBookings, icon: CalendarCheck, color: 'text-amber-600' },
    { label: 'Completed', value: stats.completedBookings, icon: CalendarCheck, color: 'text-emerald-600' },
    { label: 'Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-pink-600' },
    { label: 'Pets Added', value: stats.newPets, icon: PawPrint, color: 'text-orange-600' },
    { label: 'Searches', value: stats.searchEvents, icon: TrendingUp, color: 'text-indigo-600' },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Business Reports
          </CardTitle>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <TabsList className="h-8">
              <TabsTrigger value="daily" className="text-xs px-3">Daily</TabsTrigger>
              <TabsTrigger value="weekly" className="text-xs px-3">Weekly</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs px-3">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <p className="text-sm text-muted-foreground">{getPeriodLabel()}</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statCards.map((stat) => (
              <div key={stat.label} className="bg-muted/50 rounded-lg p-3 text-center">
                <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
