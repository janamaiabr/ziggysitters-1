import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users, MapPin, Calendar, MousePointerClick } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SearchEvent {
  id: string;
  user_id: string | null;
  session_id: string;
  search_timestamp: string;
  suburb: string | null;
  city: string | null;
  service_type: string | null;
  pet_species: string[] | null;
  pet_size: string[] | null;
  results_count: number | null;
  clicked_sitter_ids: string[] | null;
  created_at: string;
}

export default function AdminSearchAnalytics() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchEvents, setSearchEvents] = useState<SearchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSearches: 0,
    uniqueUsers: 0,
    avgResultsPerSearch: 0,
    topSuburbs: [] as { suburb: string; count: number }[],
    conversionRate: 0,
  });

  useEffect(() => {
    checkAdminAccess();
    fetchSearchEvents();
  }, []);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      navigate('/');
    }
  };

  const fetchSearchEvents = async () => {
    try {
      // Fetch last 30 days of search events
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('search_events')
        .select('*')
        .gte('search_timestamp', thirtyDaysAgo.toISOString())
        .order('search_timestamp', { ascending: false })
        .limit(500);

      if (error) throw error;

      setSearchEvents(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching search events:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (events: SearchEvent[]) => {
    const totalSearches = events.length;
    const uniqueUsers = new Set(events.map(e => e.session_id)).size;
    
    const resultsSum = events.reduce((sum, e) => sum + (e.results_count || 0), 0);
    const avgResultsPerSearch = totalSearches > 0 ? Math.round(resultsSum / totalSearches) : 0;

    // Calculate top suburbs
    const suburbCounts = events.reduce((acc, e) => {
      if (e.suburb) {
        acc[e.suburb] = (acc[e.suburb] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topSuburbs = Object.entries(suburbCounts)
      .map(([suburb, count]) => ({ suburb, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate conversion rate (clicked at least one sitter)
    const searchesWithClicks = events.filter(e => e.clicked_sitter_ids && e.clicked_sitter_ids.length > 0).length;
    const conversionRate = totalSearches > 0 ? Math.round((searchesWithClicks / totalSearches) * 100) : 0;

    setStats({
      totalSearches,
      uniqueUsers,
      avgResultsPerSearch,
      topSuburbs,
      conversionRate,
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Search Analytics (Last 30 Days)</h1>
        <Badge variant="outline">For Retargeting</Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSearches}</div>
            <p className="text-xs text-muted-foreground">Search events tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">Based on session IDs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Results</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResultsPerSearch}</div>
            <p className="text-xs text-muted-foreground">Sitters per search</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">Users who clicked sitters</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Suburbs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Top Search Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topSuburbs.map((item, index) => (
              <div key={item.suburb} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{index + 1}</Badge>
                  <span className="font-medium">{item.suburb}</span>
                </div>
                <div className="text-sm text-muted-foreground">{item.count} searches</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Search Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Search Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {searchEvents.slice(0, 20).map((event) => (
              <div key={event.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {event.suburb && (
                      <Badge variant="secondary">{event.suburb}</Badge>
                    )}
                    {event.service_type && (
                      <Badge variant="outline">{event.service_type.replace(/_/g, ' ')}</Badge>
                    )}
                    {event.clicked_sitter_ids && event.clicked_sitter_ids.length > 0 && (
                      <Badge className="bg-green-500">
                        {event.clicked_sitter_ids.length} click{event.clicked_sitter_ids.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {event.results_count || 0} results • {new Date(event.search_timestamp).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Session: {event.session_id.slice(0, 20)}...
                  </p>
                </div>
                {event.user_id && (
                  <Badge>Logged In</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Retargeting Tips */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">💡 Retargeting Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-blue-800 dark:text-blue-200">
          <p>• <strong>High-Intent Users</strong>: Target sessions with clicks but no booking completion</p>
          <p>• <strong>Location-Based</strong>: Create ads for top suburbs with high search volume</p>
          <p>• <strong>Service-Specific</strong>: Segment users by service type they searched for</p>
          <p>• <strong>Abandoned Searches</strong>: Retarget users who searched but found 0 results</p>
          <p>• <strong>Anonymous to Registered</strong>: Encourage account creation for better matches</p>
        </CardContent>
      </Card>
    </div>
  );
}
