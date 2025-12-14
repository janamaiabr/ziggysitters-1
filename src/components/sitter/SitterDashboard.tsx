import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Eye, Search, MessageSquare, Calendar, TrendingUp, MapPin, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface SitterDashboardProps {
  profileId: string;
  suburb?: string;
  city?: string;
  onboardingCompleted: boolean;
}

export default function SitterDashboard({ profileId, suburb, city, onboardingCompleted }: SitterDashboardProps) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    searchesInArea: 0,
    messagesReceived: 0,
    pendingBookings: 0,
    completedBookings: 0,
  });
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [profileId, suburb, city]);

  const fetchStats = async () => {
    try {
      // Fetch searches in sitter's area (last 7 days)
      const { data: searchData } = await supabase
        .from('search_events')
        .select('id, suburb, city, service_type, search_timestamp')
        .or(`suburb.ilike.%${suburb || ''}%,city.ilike.%${city || 'Auckland'}%`)
        .gte('search_timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('search_timestamp', { ascending: false })
        .limit(50);

      // Fetch unread messages
      const { count: messageCount } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', profileId)
        .eq('is_read', false);

      // Fetch booking stats
      const { data: bookings } = await supabase
        .from('bookings')
        .select('status')
        .eq('sitter_id', profileId);

      const pending = bookings?.filter(b => b.status === 'pending').length || 0;
      const completed = bookings?.filter(b => b.status === 'completed').length || 0;

      setStats({
        searchesInArea: searchData?.length || 0,
        messagesReceived: messageCount || 0,
        pendingBookings: pending,
        completedBookings: completed,
      });

      // Get recent unique search locations
      const uniqueSearches = searchData?.reduce((acc: any[], search) => {
        const key = `${search.suburb}-${search.service_type}`;
        if (!acc.find(s => `${s.suburb}-${s.service_type}` === key)) {
          acc.push(search);
        }
        return acc;
      }, []).slice(0, 5);

      setRecentSearches(uniqueSearches || []);
    } catch (error) {
      console.error('Error fetching sitter stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatServiceType = (type: string) => {
    const map: Record<string, string> = {
      'pet_sitting_owners_home': 'Pet Sitting (Home)',
      'pet_sitting_sitters_home': 'Pet Sitting (Sitter)',
      'drop_in_visits': 'Drop-in Visits',
    };
    return map[type] || type || 'Any service';
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-24 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Search className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.searchesInArea}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">Searches nearby</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.messagesReceived}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Unread messages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 rounded-lg">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.pendingBookings}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">Pending requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.completedBookings}</p>
                <p className="text-xs text-green-600 dark:text-green-400">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Searches in Area */}
      {recentSearches.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Pet Owners Searching Near You
              <Badge variant="secondary" className="ml-auto">Last 7 days</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSearches.map((search, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{search.suburb || search.city || 'Auckland'}</p>
                      <p className="text-xs text-muted-foreground">{formatServiceType(search.service_type)}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {new Date(search.search_timestamp).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
            </div>
            
            {!onboardingCompleted && (
              <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                  🚀 Complete your profile to appear in these searches!
                </p>
                <Button 
                  size="sm" 
                  className="mt-2"
                  onClick={() => navigate('/onboarding')}
                >
                  Complete Setup
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {stats.messagesReceived > 0 && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <p className="font-medium">You have {stats.messagesReceived} unread message{stats.messagesReceived > 1 ? 's' : ''}</p>
            </div>
            <Button size="sm" onClick={() => navigate('/messages')}>
              View Messages
            </Button>
          </CardContent>
        </Card>
      )}

      {stats.pendingBookings > 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-amber-500" />
              <p className="font-medium">You have {stats.pendingBookings} pending booking request{stats.pendingBookings > 1 ? 's' : ''}</p>
            </div>
            <Button size="sm" onClick={() => navigate('/bookings')}>
              View Bookings
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
