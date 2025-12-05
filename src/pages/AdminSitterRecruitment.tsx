import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Users, TrendingUp, AlertTriangle, Target, Mail, Search } from 'lucide-react';

interface DemandArea {
  suburb: string;
  city: string;
  searchCount: number;
  zeroResults: number;
  avgResults: number;
  demandScore: number;
  serviceTypes: Record<string, number>;
}

export default function AdminSitterRecruitment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [demandAreas, setDemandAreas] = useState<DemandArea[]>([]);
  const [emailCaptures, setEmailCaptures] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSearches: 0,
    zeroResultSearches: 0,
    uniqueLocations: 0,
    potentialLeads: 0,
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

    const { data: isAdmin } = await supabase.rpc('is_admin');
    if (!isAdmin) {
      navigate('/');
      return;
    }

    await Promise.all([fetchSearchData(), fetchEmailCaptures()]);
    setLoading(false);
  };

  const fetchSearchData = async () => {
    const { data, error } = await supabase
      .from('search_events')
      .select('*')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('Error fetching search data:', error);
      return;
    }

    // Aggregate by location
    const locationMap = new Map<string, DemandArea>();
    
    (data || []).forEach(event => {
      const key = `${event.suburb || 'Unknown'}-${event.city || 'Auckland'}`;
      const existing = locationMap.get(key) || {
        suburb: event.suburb || 'Unknown',
        city: event.city || 'Auckland',
        searchCount: 0,
        zeroResults: 0,
        avgResults: 0,
        demandScore: 0,
        serviceTypes: {},
      };
      
      existing.searchCount++;
      if (event.results_count === 0) existing.zeroResults++;
      existing.avgResults = (existing.avgResults * (existing.searchCount - 1) + (event.results_count || 0)) / existing.searchCount;
      
      if (event.service_type) {
        existing.serviceTypes[event.service_type] = (existing.serviceTypes[event.service_type] || 0) + 1;
      }
      
      // Demand score = searches * (zero result rate) * recency factor
      existing.demandScore = existing.searchCount * (existing.zeroResults / existing.searchCount);
      
      locationMap.set(key, existing);
    });

    // Sort by demand score (highest unmet demand first)
    const sorted = Array.from(locationMap.values())
      .filter(a => a.suburb !== 'Unknown')
      .sort((a, b) => b.demandScore - a.demandScore);

    setDemandAreas(sorted);
    
    // Calculate stats
    const totalZero = (data || []).filter(d => d.results_count === 0).length;
    setStats({
      totalSearches: data?.length || 0,
      zeroResultSearches: totalZero,
      uniqueLocations: locationMap.size,
      potentialLeads: totalZero,
    });
  };

  const fetchEmailCaptures = async () => {
    const { data, error } = await supabase
      .from('email_captures')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching email captures:', error);
      return;
    }

    setEmailCaptures(data || []);
  };

  const getZeroResultRate = (area: DemandArea) => {
    return area.searchCount > 0 ? Math.round((area.zeroResults / area.searchCount) * 100) : 0;
  };

  const getPriorityLevel = (area: DemandArea) => {
    const rate = getZeroResultRate(area);
    if (rate >= 80 && area.searchCount >= 3) return { label: 'Critical', color: 'bg-red-500' };
    if (rate >= 50 && area.searchCount >= 2) return { label: 'High', color: 'bg-orange-500' };
    if (rate >= 30) return { label: 'Medium', color: 'bg-yellow-500' };
    return { label: 'Low', color: 'bg-green-500' };
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Sitter Recruitment Dashboard</h1>
        <p className="text-muted-foreground">
          Identify high-demand areas to focus recruitment efforts
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalSearches}</p>
                <p className="text-sm text-muted-foreground">Total Searches (30d)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.zeroResultSearches}</p>
                <p className="text-sm text-muted-foreground">Zero Results ({Math.round((stats.zeroResultSearches / stats.totalSearches) * 100)}%)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.uniqueLocations}</p>
                <p className="text-sm text-muted-foreground">Unique Locations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{emailCaptures.length}</p>
                <p className="text-sm text-muted-foreground">Email Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* High Priority Areas */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <CardTitle>Priority Recruitment Areas</CardTitle>
              </div>
              <CardDescription>
                Areas with high search demand but no sitter coverage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demandAreas.slice(0, 15).map((area, index) => {
                  const priority = getPriorityLevel(area);
                  const zeroRate = getZeroResultRate(area);
                  
                  return (
                    <div 
                      key={`${area.suburb}-${area.city}`}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-medium">{index + 1}.</span>
                          <div>
                            <h4 className="font-semibold text-foreground">{area.suburb}</h4>
                            <p className="text-sm text-muted-foreground">{area.city}</p>
                          </div>
                        </div>
                        <Badge className={`${priority.color} text-white`}>
                          {priority.label}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Searches</p>
                          <p className="font-semibold">{area.searchCount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Zero Results</p>
                          <p className="font-semibold text-red-600">{area.zeroResults}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Failure Rate</p>
                          <p className="font-semibold">{zeroRate}%</p>
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Zero result rate</span>
                          <span>{zeroRate}%</span>
                        </div>
                        <Progress value={zeroRate} className="h-2" />
                      </div>
                      
                      {/* Service type breakdown */}
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(area.serviceTypes).map(([service, count]) => (
                          <Badge key={service} variant="outline" className="text-xs">
                            {service.replace(/_/g, ' ')}: {count}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email Leads */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <CardTitle>Recent Email Leads</CardTitle>
              </div>
              <CardDescription>
                Users waiting for sitters in their area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {emailCaptures.map((capture) => (
                  <div 
                    key={capture.id}
                    className="p-3 border rounded-lg text-sm"
                  >
                    <p className="font-medium truncate">{capture.email}</p>
                    {capture.name && (
                      <p className="text-muted-foreground">{capture.name}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {capture.search_location && (
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="w-3 h-3 mr-1" />
                          {capture.search_location}
                        </Badge>
                      )}
                      {capture.search_service_type && (
                        <Badge variant="secondary" className="text-xs">
                          {capture.search_service_type.replace(/_/g, ' ')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(capture.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                
                {emailCaptures.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No email leads yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Recruitment Tips */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Recruitment Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>📍 <strong>Focus on red zones:</strong> Areas with 80%+ failure rate</p>
              <p>📢 <strong>Local Facebook groups:</strong> Post in suburb community groups</p>
              <p>🎯 <strong>Target universities:</strong> Students in high-demand areas</p>
              <p>💌 <strong>Email waitlist:</strong> Notify leads when sitter joins their area</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
