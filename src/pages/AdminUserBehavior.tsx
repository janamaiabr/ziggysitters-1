import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Users, MousePointer, LogOut, Clock, TrendingDown, Eye, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, subHours } from 'date-fns';

interface UserJourney {
  user_id: string | null;
  session_id: string;
  first_name: string | null;
  email: string | null;
  role: string | null;
  events: any[];
  first_event: string;
  last_event: string;
  pages_visited: string[];
  total_time_seconds: number;
  dropped_off_at: string | null;
  completed_onboarding: boolean;
  searched: boolean;
  added_pet: boolean;
}

interface DropoffPoint {
  page: string;
  count: number;
  avg_time_on_page: number;
}

export default function AdminUserBehavior() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('7d');
  const [loading, setLoading] = useState(true);
  const [journeys, setJourneys] = useState<UserJourney[]>([]);
  const [dropoffs, setDropoffs] = useState<DropoffPoint[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    registeredUsers: 0,
    searchedAfterRegistration: 0,
    addedPetAfterRegistration: 0,
    completedOnboarding: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const startDate = period === '24h' 
        ? subHours(new Date(), 24) 
        : period === '7d' 
          ? subDays(new Date(), 7) 
          : subDays(new Date(), 30);

      // Fetch all events in the period
      const { data: events, error } = await supabase
        .from('user_events')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group events by session
      const sessionMap = new Map<string, any[]>();
      (events || []).forEach(event => {
        const sessionId = event.session_id || 'unknown';
        if (!sessionMap.has(sessionId)) {
          sessionMap.set(sessionId, []);
        }
        sessionMap.get(sessionId)!.push(event);
      });

      // Fetch profile data for users
      const userIds = [...new Set((events || []).map(e => e.user_id).filter(Boolean))];
      let profileMap = new Map<string, any>();
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, email, role, onboarding_completed')
          .in('id', userIds);
        
        (profiles || []).forEach(p => {
          profileMap.set(p.id, p);
        });
      }

      // Build journey data
      const journeyData: UserJourney[] = [];
      const dropoffMap = new Map<string, { count: number, totalTime: number }>();

      sessionMap.forEach((sessionEvents, sessionId) => {
        const firstEvent = sessionEvents[0];
        const lastEvent = sessionEvents[sessionEvents.length - 1];
        const userId = sessionEvents.find(e => e.user_id)?.user_id;
        const profile = userId ? profileMap.get(userId) : null;

        const pages = [...new Set(sessionEvents.map(e => e.page_path).filter(Boolean))];
        const eventNames = sessionEvents.map(e => e.event_name);
        
        // Determine what actions were taken
        const searched = eventNames.some(n => n?.includes('search'));
        const addedPet = eventNames.some(n => n?.includes('pet') && (n?.includes('added') || n?.includes('created')));
        const completedOnboarding = profile?.onboarding_completed || eventNames.some(n => n?.includes('onboarding_completed'));

        // Calculate time
        const firstTime = new Date(firstEvent.created_at).getTime();
        const lastTime = new Date(lastEvent.created_at).getTime();
        const totalTime = Math.round((lastTime - firstTime) / 1000);

        // Determine dropoff point
        let droppedOffAt: string | null = null;
        if (!searched && !addedPet && userId) {
          // User registered but didn't engage
          const lastPage = lastEvent.page_path || 'unknown';
          droppedOffAt = lastPage;
          
          // Track dropoff points
          const existing = dropoffMap.get(lastPage) || { count: 0, totalTime: 0 };
          dropoffMap.set(lastPage, {
            count: existing.count + 1,
            totalTime: existing.totalTime + totalTime,
          });
        }

        journeyData.push({
          user_id: userId,
          session_id: sessionId,
          first_name: profile?.first_name || null,
          email: profile?.email || null,
          role: profile?.role || null,
          events: sessionEvents,
          first_event: firstEvent.created_at,
          last_event: lastEvent.created_at,
          pages_visited: pages,
          total_time_seconds: totalTime,
          dropped_off_at: droppedOffAt,
          completed_onboarding: completedOnboarding,
          searched,
          added_pet: addedPet,
        });
      });

      // Sort journeys by most recent first
      journeyData.sort((a, b) => new Date(b.last_event).getTime() - new Date(a.last_event).getTime());

      // Build dropoff data
      const dropoffData: DropoffPoint[] = [];
      dropoffMap.forEach((data, page) => {
        dropoffData.push({
          page,
          count: data.count,
          avg_time_on_page: Math.round(data.totalTime / data.count),
        });
      });
      dropoffData.sort((a, b) => b.count - a.count);

      // Calculate stats
      const registeredJourneys = journeyData.filter(j => j.user_id);
      const searchedJourneys = registeredJourneys.filter(j => j.searched);
      const addedPetJourneys = registeredJourneys.filter(j => j.added_pet);
      const completedJourneys = registeredJourneys.filter(j => j.completed_onboarding);
      const bounceJourneys = journeyData.filter(j => j.pages_visited.length <= 1);

      setStats({
        totalSessions: journeyData.length,
        registeredUsers: registeredJourneys.length,
        searchedAfterRegistration: searchedJourneys.length,
        addedPetAfterRegistration: addedPetJourneys.length,
        completedOnboarding: completedJourneys.length,
        avgSessionDuration: journeyData.length > 0 
          ? Math.round(journeyData.reduce((sum, j) => sum + j.total_time_seconds, 0) / journeyData.length)
          : 0,
        bounceRate: journeyData.length > 0 
          ? Math.round((bounceJourneys.length / journeyData.length) * 100)
          : 0,
      });

      setJourneys(journeyData);
      setDropoffs(dropoffData);
    } catch (error) {
      console.error('Error fetching behavior data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getConversionRate = (numerator: number, denominator: number) => {
    if (denominator === 0) return '0%';
    return `${Math.round((numerator / denominator) * 100)}%`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin-dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">User Behavior Analytics</h1>
              <p className="text-muted-foreground">Understand why users register but don't engage</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Sessions</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalSessions}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Registered</span>
              </div>
              <p className="text-2xl font-bold">{stats.registeredUsers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MousePointer className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Searched</span>
              </div>
              <p className="text-2xl font-bold">{stats.searchedAfterRegistration}</p>
              <p className="text-xs text-muted-foreground">
                {getConversionRate(stats.searchedAfterRegistration, stats.registeredUsers)} of registered
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🐾</span>
                <span className="text-sm text-muted-foreground">Added Pet</span>
              </div>
              <p className="text-2xl font-bold">{stats.addedPetAfterRegistration}</p>
              <p className="text-xs text-muted-foreground">
                {getConversionRate(stats.addedPetAfterRegistration, stats.registeredUsers)} of registered
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-muted-foreground">Onboarded</span>
              </div>
              <p className="text-2xl font-bold">{stats.completedOnboarding}</p>
              <p className="text-xs text-muted-foreground">
                {getConversionRate(stats.completedOnboarding, stats.registeredUsers)} of registered
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-muted-foreground">Avg Session</span>
              </div>
              <p className="text-2xl font-bold">{formatDuration(stats.avgSessionDuration)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <LogOut className="h-4 w-4 text-red-500" />
                <span className="text-sm text-muted-foreground">Bounce Rate</span>
              </div>
              <p className="text-2xl font-bold">{stats.bounceRate}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dropoffs">
          <TabsList className="mb-4">
            <TabsTrigger value="dropoffs">Dropoff Points</TabsTrigger>
            <TabsTrigger value="journeys">User Journeys</TabsTrigger>
            <TabsTrigger value="inactive">Inactive After Registration</TabsTrigger>
          </TabsList>

          {/* Dropoff Points Tab */}
          <TabsContent value="dropoffs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  Where Users Drop Off (Registered but didn't search/add pet)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dropoffs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No dropoff data found for this period. This could mean users are engaging well!
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Page</TableHead>
                        <TableHead className="text-right">Users Dropped</TableHead>
                        <TableHead className="text-right">Avg Time on Page</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dropoffs.map((dropoff, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono">{dropoff.page}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="destructive">{dropoff.count}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{formatDuration(dropoff.avg_time_on_page)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Journeys Tab */}
          <TabsContent value="journeys">
            <Card>
              <CardHeader>
                <CardTitle>Recent User Journeys</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {journeys.slice(0, 50).map((journey, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {journey.first_name ? (
                            <span className="font-medium">{journey.first_name}</span>
                          ) : (
                            <span className="text-muted-foreground">Anonymous</span>
                          )}
                          {journey.role && (
                            <Badge variant="outline">{journey.role}</Badge>
                          )}
                          {journey.searched && (
                            <Badge className="bg-green-500">Searched</Badge>
                          )}
                          {journey.added_pet && (
                            <Badge className="bg-purple-500">Added Pet</Badge>
                          )}
                          {journey.completed_onboarding && (
                            <Badge className="bg-blue-500">Onboarded</Badge>
                          )}
                          {journey.dropped_off_at && (
                            <Badge variant="destructive">Dropped: {journey.dropped_off_at}</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(journey.first_event), 'MMM d, HH:mm')} - {formatDuration(journey.total_time_seconds)}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {journey.pages_visited.map((page, i) => (
                          <Badge key={i} variant="secondary" className="text-xs font-mono">
                            {page}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {journey.events.length} events tracked
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inactive After Registration Tab */}
          <TabsContent value="inactive">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Users Who Registered But Didn't Search or Add Pets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Session Time</TableHead>
                      <TableHead>Pages Visited</TableHead>
                      <TableHead>Last Page</TableHead>
                      <TableHead>When</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {journeys
                      .filter(j => j.user_id && !j.searched && !j.added_pet)
                      .slice(0, 50)
                      .map((journey, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{journey.first_name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">{journey.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{journey.role || 'Not set'}</Badge>
                          </TableCell>
                          <TableCell>{formatDuration(journey.total_time_seconds)}</TableCell>
                          <TableCell>{journey.pages_visited.length}</TableCell>
                          <TableCell className="font-mono text-sm">{journey.dropped_off_at || journey.pages_visited[journey.pages_visited.length - 1]}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(journey.first_event), 'MMM d, HH:mm')}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                {journeys.filter(j => j.user_id && !j.searched && !j.added_pet).length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    No inactive users found. All registered users are engaging!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
