import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  MapPin, 
  Target,
  ArrowUpRight,
  Flame,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface SuburbDemand {
  suburb: string;
  city: string;
  searchCount: number;
  sitterCount: number;
  gapScore: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface EmailCapture {
  id: string;
  email: string;
  name: string | null;
  search_location: string | null;
  created_at: string;
}

export default function AdminSitterDemandGap() {
  const navigate = useNavigate();
  const [demandData, setDemandData] = useState<SuburbDemand[]>([]);
  const [waitlistEmails, setWaitlistEmails] = useState<EmailCapture[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSearches, setTotalSearches] = useState(0);
  const [totalSitters, setTotalSitters] = useState(0);
  const [criticalGaps, setCriticalGaps] = useState(0);

  useEffect(() => {
    fetchDemandData();
    fetchWaitlistEmails();
  }, []);

  const fetchDemandData = async () => {
    try {
      // Get search counts by suburb
      const { data: searchData, error: searchError } = await supabase
        .from('search_events')
        .select('suburb, city')
        .not('suburb', 'is', null)
        .neq('suburb', '');

      if (searchError) throw searchError;

      // Get sitter counts by suburb
      const { data: sitterData, error: sitterError } = await supabase
        .from('sitter_service_areas')
        .select('suburb, city, sitter_id');

      if (sitterError) throw sitterError;

      // Aggregate search counts
      const searchCounts: Record<string, { count: number; city: string }> = {};
      searchData?.forEach((search) => {
        const suburb = search.suburb?.trim().toLowerCase();
        if (suburb && suburb.length > 2) {
          const key = suburb;
          if (!searchCounts[key]) {
            searchCounts[key] = { count: 0, city: search.city || 'Auckland' };
          }
          searchCounts[key].count++;
        }
      });

      // Aggregate sitter counts
      const sitterCounts: Record<string, Set<string>> = {};
      sitterData?.forEach((area) => {
        const suburb = area.suburb?.trim().toLowerCase();
        if (suburb) {
          if (!sitterCounts[suburb]) {
            sitterCounts[suburb] = new Set();
          }
          sitterCounts[suburb].add(area.sitter_id);
        }
      });

      // Combine and calculate gap scores
      const allSuburbs = new Set([
        ...Object.keys(searchCounts),
        ...Object.keys(sitterCounts)
      ]);

      const demandList: SuburbDemand[] = [];
      
      allSuburbs.forEach((suburb) => {
        const searchCount = searchCounts[suburb]?.count || 0;
        const sitterCount = sitterCounts[suburb]?.size || 0;
        const city = searchCounts[suburb]?.city || 'Auckland';

        // Only include suburbs with at least 3 searches
        if (searchCount >= 3) {
          // Gap score: high searches + no sitters = high priority
          const gapScore = sitterCount === 0 
            ? searchCount * 10 
            : searchCount / sitterCount;

          let priority: 'critical' | 'high' | 'medium' | 'low' = 'low';
          if (sitterCount === 0 && searchCount >= 10) priority = 'critical';
          else if (sitterCount === 0 && searchCount >= 5) priority = 'high';
          else if (sitterCount === 0) priority = 'medium';
          else if (searchCount / sitterCount > 10) priority = 'high';
          else if (searchCount / sitterCount > 5) priority = 'medium';

          demandList.push({
            suburb: suburb.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            city,
            searchCount,
            sitterCount,
            gapScore,
            priority
          });
        }
      });

      // Sort by gap score (highest first)
      demandList.sort((a, b) => b.gapScore - a.gapScore);

      setDemandData(demandList);
      setTotalSearches(searchData?.length || 0);
      setTotalSitters(new Set(sitterData?.map(s => s.sitter_id)).size);
      setCriticalGaps(demandList.filter(d => d.priority === 'critical').length);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching demand data:', error);
      setLoading(false);
    }
  };

  const fetchWaitlistEmails = async () => {
    const { data, error } = await supabase
      .from('email_captures')
      .select('*')
      .not('search_location', 'is', null)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setWaitlistEmails(data);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <Flame className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Sitter Demand Gap Analysis</h1>
        <p className="text-muted-foreground">
          Identify high-demand suburbs with no sitters to prioritize recruitment
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Searches</p>
                <p className="text-3xl font-bold">{totalSearches}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Sitters</p>
                <p className="text-3xl font-bold">{totalSitters}</p>
              </div>
              <Users className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Critical Gaps</p>
                <p className="text-3xl font-bold text-red-600">{criticalGaps}</p>
              </div>
              <Flame className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Waitlist Signups</p>
                <p className="text-3xl font-bold">{waitlistEmails.length}</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

        <Tabs defaultValue="gaps" className="space-y-4">
          <TabsList>
            <TabsTrigger value="gaps">Suburb Gaps</TabsTrigger>
            <TabsTrigger value="waitlist">Waitlist Emails</TabsTrigger>
          </TabsList>

          <TabsContent value="gaps" className="space-y-4">
            {/* Critical Priority Section */}
            {demandData.filter(d => d.priority === 'critical').length > 0 && (
              <Card className="border-red-300 bg-red-50/50">
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center gap-2">
                    <Flame className="w-5 h-5" />
                    Critical Priority - Immediate Recruitment Needed
                  </CardTitle>
                  <CardDescription>
                    High search volume with ZERO sitters. These suburbs are losing potential customers.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {demandData
                      .filter(d => d.priority === 'critical')
                      .map((suburb) => (
                        <div 
                          key={suburb.suburb} 
                          className="bg-white p-4 rounded-lg border border-red-200 shadow-sm"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-lg">{suburb.suburb}</h4>
                              <p className="text-sm text-muted-foreground">{suburb.city}</p>
                            </div>
                            <Badge className={getPriorityColor(suburb.priority)}>
                              {getPriorityIcon(suburb.priority)}
                              <span className="ml-1">Critical</span>
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 mt-3">
                            <div className="flex justify-between text-sm">
                              <span>Searches</span>
                              <span className="font-semibold text-red-600">{suburb.searchCount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Sitters</span>
                              <span className="font-semibold flex items-center gap-1">
                                <XCircle className="w-4 h-4 text-red-500" />
                                0
                              </span>
                            </div>
                            <Progress value={100} className="h-2 bg-red-100" />
                          </div>

                          <Button 
                            size="sm" 
                            className="w-full mt-3"
                            onClick={() => navigate(`/become-sitter/${suburb.suburb.toLowerCase().replace(/\s+/g, '-')}`)}
                          >
                            Create Recruitment Link
                            <ArrowUpRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Suburbs Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Suburb Demand</CardTitle>
                <CardDescription>
                  Sorted by gap score (highest opportunity first)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Suburb</th>
                        <th className="text-left py-3 px-2">City</th>
                        <th className="text-center py-3 px-2">Searches</th>
                        <th className="text-center py-3 px-2">Sitters</th>
                        <th className="text-center py-3 px-2">Gap Score</th>
                        <th className="text-center py-3 px-2">Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demandData.map((suburb) => (
                        <tr key={suburb.suburb} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2 font-medium">{suburb.suburb}</td>
                          <td className="py-3 px-2 text-muted-foreground">{suburb.city}</td>
                          <td className="py-3 px-2 text-center">
                            <span className="font-semibold">{suburb.searchCount}</span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            {suburb.sitterCount === 0 ? (
                              <span className="text-red-500 font-semibold">0</span>
                            ) : (
                              <span className="text-green-600 font-semibold flex items-center justify-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                {suburb.sitterCount}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className="font-mono">{suburb.gapScore.toFixed(1)}</span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <Badge className={getPriorityColor(suburb.priority)}>
                              {suburb.priority}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="waitlist" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Waitlist Signups by Location</CardTitle>
                <CardDescription>
                  People who searched but couldn't find sitters and left their email
                </CardDescription>
              </CardHeader>
              <CardContent>
                {waitlistEmails.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No waitlist signups yet
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2">Email</th>
                          <th className="text-left py-3 px-2">Name</th>
                          <th className="text-left py-3 px-2">Location Searched</th>
                          <th className="text-left py-3 px-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {waitlistEmails.map((email) => (
                          <tr key={email.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">{email.email}</td>
                            <td className="py-3 px-2">{email.name || '-'}</td>
                            <td className="py-3 px-2">
                              <Badge variant="outline">
                                <MapPin className="w-3 h-3 mr-1" />
                                {email.search_location || 'Unknown'}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-muted-foreground">
                              {new Date(email.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recruitment Tips */}
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle>Recruitment Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-background rounded-lg">
                <h4 className="font-semibold mb-2">🎯 Facebook Groups to Target</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {demandData
                    .filter(d => d.priority === 'critical' || d.priority === 'high')
                    .slice(0, 5)
                    .map(d => (
                      <li key={d.suburb}>• {d.suburb} Community / {d.suburb} Locals</li>
                    ))}
                </ul>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <h4 className="font-semibold mb-2">📊 Key Stats for Ads</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {totalSearches} pet owners searching for sitters</li>
                  <li>• {criticalGaps} suburbs with zero coverage</li>
                  <li>• Earn $45-75/day pet sitting</li>
                  <li>• Flexible hours, work from home</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
