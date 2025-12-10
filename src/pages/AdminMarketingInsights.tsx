import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, Search, TrendingUp, MapPin, Mail, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationData {
  suburb: string;
  city: string;
  sitterCount: number;
  searchCount: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export default function AdminMarketingInsights() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [marketToOwners, setMarketToOwners] = useState<LocationData[]>([]);
  const [recruitSitters, setRecruitSitters] = useState<LocationData[]>([]);
  const [stats, setStats] = useState({
    totalSitters: 0,
    totalSearches: 0,
    uniqueSearchLocations: 0,
    coverageGaps: 0
  });

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');

    if (!roles || roles.length === 0) {
      navigate('/');
      return;
    }

    await fetchData();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch sitters by location
      const { data: sitters } = await supabase
        .from('profiles')
        .select('suburb, city')
        .eq('role', 'pet_sitter')
        .eq('is_test_account', false)
        .not('suburb', 'is', null);

      // Fetch sitter services to know who's visible in search
      const { data: services } = await supabase
        .from('sitter_services')
        .select('sitter_id')
        .eq('is_offered', true);

      const sittersWithServices = new Set(services?.map(s => s.sitter_id) || []);

      // Fetch searches (last 90 days)
      const { data: searches } = await supabase
        .from('search_events')
        .select('suburb, city')
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .not('suburb', 'is', null);

      // Normalize and aggregate sitter locations
      const sitterMap = new Map<string, { suburb: string; city: string; count: number }>();
      (sitters || []).forEach(s => {
        const key = `${s.suburb?.trim().toLowerCase()}|${s.city?.trim().toLowerCase()}`;
        if (!sitterMap.has(key)) {
          sitterMap.set(key, { suburb: s.suburb || '', city: s.city || '', count: 0 });
        }
        sitterMap.get(key)!.count++;
      });

      // Normalize and aggregate search locations
      const searchMap = new Map<string, { suburb: string; city: string; count: number }>();
      (searches || []).forEach(s => {
        const key = `${s.suburb?.trim().toLowerCase()}|${s.city?.trim().toLowerCase()}`;
        if (!searchMap.has(key)) {
          searchMap.set(key, { suburb: s.suburb || '', city: s.city || '', count: 0 });
        }
        searchMap.get(key)!.count++;
      });

      // Find areas with sitters but no/low searches (market to pet owners)
      const marketOwners: LocationData[] = [];
      sitterMap.forEach((value, key) => {
        const searchData = searchMap.get(key);
        const searchCount = searchData?.count || 0;
        if (searchCount < 3 && value.count > 0) {
          marketOwners.push({
            suburb: value.suburb,
            city: value.city,
            sitterCount: value.count,
            searchCount,
            priority: searchCount === 0 ? 'critical' : searchCount < 2 ? 'high' : 'medium'
          });
        }
      });

      // Find areas with searches but no/low sitters (recruit sitters)
      const recruitAreas: LocationData[] = [];
      searchMap.forEach((value, key) => {
        const sitterData = sitterMap.get(key);
        const sitterCount = sitterData?.count || 0;
        if (value.count >= 2 && sitterCount < 2) {
          recruitAreas.push({
            suburb: value.suburb,
            city: value.city,
            sitterCount,
            searchCount: value.count,
            priority: sitterCount === 0 ? 'critical' : value.count >= 5 ? 'high' : 'medium'
          });
        }
      });

      // Sort by priority
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      marketOwners.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || b.sitterCount - a.sitterCount);
      recruitAreas.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || b.searchCount - a.searchCount);

      setMarketToOwners(marketOwners);
      setRecruitSitters(recruitAreas);
      setStats({
        totalSitters: sitters?.length || 0,
        totalSearches: searches?.length || 0,
        uniqueSearchLocations: searchMap.size,
        coverageGaps: recruitAreas.filter(r => r.sitterCount === 0).length
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch marketing insights',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    setSendingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-weekly-marketing-report', {
        body: { test: true }
      });

      if (error) throw error;

      toast({
        title: 'Email Sent',
        description: 'Weekly marketing report sent to hello@ziggysitters.com'
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send email',
        variant: 'destructive'
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500 text-black">Medium</Badge>;
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Marketing Insights</h1>
              <p className="text-muted-foreground">Supply & demand analysis for targeted marketing</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={sendTestEmail} disabled={sendingEmail}>
              <Mail className="h-4 w-4 mr-2" />
              {sendingEmail ? 'Sending...' : 'Send Report Now'}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalSitters}</p>
                  <p className="text-xs text-muted-foreground">Total Sitters</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalSearches}</p>
                  <p className="text-xs text-muted-foreground">Searches (90d)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.uniqueSearchLocations}</p>
                  <p className="text-xs text-muted-foreground">Unique Locations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.coverageGaps}</p>
                  <p className="text-xs text-muted-foreground">Coverage Gaps</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="recruit" className="space-y-4">
          <TabsList>
            <TabsTrigger value="recruit" className="gap-2">
              <Users className="h-4 w-4" />
              Recruit Sitters ({recruitSitters.length})
            </TabsTrigger>
            <TabsTrigger value="market" className="gap-2">
              <Search className="h-4 w-4" />
              Market to Owners ({marketToOwners.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recruit">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  🔥 High Demand / Low Supply
                </CardTitle>
                <CardDescription>
                  These areas have search demand but few/no sitters. Priority areas to recruit new sitters.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recruitSitters.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No recruitment opportunities found</p>
                ) : (
                  <div className="grid gap-3">
                    {recruitSitters.map((area, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          {getPriorityBadge(area.priority)}
                          <div>
                            <p className="font-medium">{area.suburb}</p>
                            <p className="text-sm text-muted-foreground">{area.city}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <p className="font-bold text-red-500">{area.sitterCount}</p>
                            <p className="text-xs text-muted-foreground">sitters</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-green-500">{area.searchCount}</p>
                            <p className="text-xs text-muted-foreground">searches</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="market">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  🎯 Sitters Available, Low Search Volume
                </CardTitle>
                <CardDescription>
                  These areas have sitters but few searches. Market to pet owners in these suburbs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {marketToOwners.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No marketing opportunities found</p>
                ) : (
                  <div className="grid gap-3">
                    {marketToOwners.map((area, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          {getPriorityBadge(area.priority)}
                          <div>
                            <p className="font-medium">{area.suburb}</p>
                            <p className="text-sm text-muted-foreground">{area.city}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <p className="font-bold text-green-500">{area.sitterCount}</p>
                            <p className="text-xs text-muted-foreground">sitters</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-red-500">{area.searchCount}</p>
                            <p className="text-xs text-muted-foreground">searches</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📋 Action Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• <strong>Critical recruitment areas:</strong> Run targeted Facebook/Instagram ads for sitter recruitment</p>
            <p>• <strong>Low search areas:</strong> Run Google Ads targeting pet owners in these suburbs</p>
            <p>• <strong>Weekly email:</strong> Sent every Monday to hello@ziggysitters.com with this data</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
