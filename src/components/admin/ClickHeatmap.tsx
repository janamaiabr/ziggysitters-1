import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { subDays, subHours } from 'date-fns';
import { MousePointer, Target, Flame } from 'lucide-react';

interface ClickData {
  x_percent: number;
  y_percent: number;
  element: string;
  text: string;
  count: number;
}

interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
  element: string;
  count: number;
}

export default function ClickHeatmap() {
  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('7d');
  const [page, setPage] = useState<string>('/');
  const [pages, setPages] = useState<string[]>([]);
  const [clicks, setClicks] = useState<ClickData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const startDate = period === '24h' 
        ? subHours(new Date(), 24) 
        : period === '7d' 
          ? subDays(new Date(), 7) 
          : subDays(new Date(), 30);

      // Fetch click events
      const { data: events, error } = await supabase
        .from('user_events')
        .select('page_path, event_data')
        .eq('event_name', 'click_heatmap')
        .gte('created_at', startDate.toISOString());

      if (error) {
        console.error('Error fetching heatmap data:', error);
        setLoading(false);
        return;
      }

      // Get unique pages
      const uniquePages = [...new Set((events || []).map(e => e.page_path).filter(Boolean))];
      setPages(uniquePages);

      // Filter by selected page
      const pageEvents = (events || []).filter(e => e.page_path === page);
      
      // Aggregate click data
      const clickMap = new Map<string, ClickData>();
      pageEvents.forEach(e => {
        const data = e.event_data as any;
        if (data?.x_percent !== undefined && data?.y_percent !== undefined) {
          // Round to 5% grid for aggregation
          const key = `${Math.round(data.x_percent / 5) * 5}-${Math.round(data.y_percent / 5) * 5}`;
          const existing = clickMap.get(key) || {
            x_percent: Math.round(data.x_percent / 5) * 5,
            y_percent: Math.round(data.y_percent / 5) * 5,
            element: data.element || '',
            text: data.text || '',
            count: 0
          };
          existing.count++;
          clickMap.set(key, existing);
        }
      });

      setClicks(Array.from(clickMap.values()));
      setLoading(false);
    };

    fetchData();
  }, [period, page]);

  const heatmapPoints: HeatmapPoint[] = useMemo(() => {
    const maxCount = Math.max(...clicks.map(c => c.count), 1);
    return clicks.map(c => ({
      x: c.x_percent,
      y: c.y_percent,
      intensity: c.count / maxCount,
      element: c.element,
      count: c.count
    }));
  }, [clicks]);

  const topElements = useMemo(() => {
    const elementCounts = new Map<string, { element: string, text: string, count: number }>();
    clicks.forEach(c => {
      const key = c.element;
      const existing = elementCounts.get(key) || { element: c.element, text: c.text, count: 0 };
      existing.count += c.count;
      elementCounts.set(key, existing);
    });
    return Array.from(elementCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [clicks]);

  const totalClicks = clicks.reduce((sum, c) => sum + c.count, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Click Heatmap
          </CardTitle>
          <div className="flex gap-2">
            <Select value={page} onValueChange={setPage}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select page" />
              </SelectTrigger>
              <SelectContent>
                {pages.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24h</SelectItem>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Heatmap Visualization */}
            <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg h-96 overflow-hidden">
              <div className="absolute inset-0 p-4">
                <div className="text-xs text-muted-foreground mb-2">
                  Page: {page} • {totalClicks} clicks tracked
                </div>
                <div className="relative w-full h-full bg-white/50 rounded border">
                  {heatmapPoints.map((point, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all cursor-pointer hover:scale-150"
                      style={{
                        left: `${point.x}%`,
                        top: `${point.y}%`,
                        width: `${Math.max(10, point.intensity * 40)}px`,
                        height: `${Math.max(10, point.intensity * 40)}px`,
                        backgroundColor: `rgba(255, ${Math.round(100 - point.intensity * 100)}, 0, ${0.3 + point.intensity * 0.5})`,
                        boxShadow: `0 0 ${point.intensity * 20}px rgba(255, 100, 0, ${point.intensity * 0.5})`,
                      }}
                      title={`${point.element}\n${point.count} clicks`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Top Clicked Elements */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Target className="h-4 w-4" />
                Most Clicked Elements
              </h4>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {topElements.map((el, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                    <div className="flex-1 min-w-0">
                      <code className="text-xs text-muted-foreground block truncate">{el.element}</code>
                      {el.text && (
                        <span className="text-xs truncate block">{el.text}</span>
                      )}
                    </div>
                    <Badge variant="secondary">{el.count}</Badge>
                  </div>
                ))}
                {topElements.length === 0 && (
                  <p className="text-muted-foreground text-sm">No click data for this page</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
