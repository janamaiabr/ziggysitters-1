import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, subHours } from 'date-fns';
import { Play, Pause, FastForward, SkipBack, MousePointer, Eye, Clock, User } from 'lucide-react';

interface SessionEvent {
  id: string;
  created_at: string;
  event_type: string;
  event_name: string;
  event_data: any;
  page_path: string;
  user_id?: string | null;
}

interface Session {
  session_id: string;
  user_id: string | null;
  first_name: string | null;
  email: string | null;
  events: SessionEvent[];
  start_time: string;
  end_time: string;
  duration_seconds: number;
  pages_visited: string[];
}

export default function SessionReplayViewer() {
  const [period, setPeriod] = useState<'24h' | '7d'>('24h');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      const startDate = period === '24h' 
        ? subHours(new Date(), 24) 
        : subDays(new Date(), 7);

      const { data: events, error } = await supabase
        .from('user_events')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching sessions:', error);
        setLoading(false);
        return;
      }

      // Group by session
      const sessionMap = new Map<string, SessionEvent[]>();
      (events || []).forEach(e => {
        const sessionId = e.session_id || 'unknown';
        if (!sessionMap.has(sessionId)) {
          sessionMap.set(sessionId, []);
        }
        sessionMap.get(sessionId)!.push(e);
      });

      // Get user info
      const userIds = [...new Set((events || []).map(e => e.user_id).filter(Boolean))];
      const profileMap = new Map<string, any>();
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, email')
          .in('id', userIds);
        
        (profiles || []).forEach(p => profileMap.set(p.id, p));
      }

      // Build session objects
      const sessionList: Session[] = [];
      sessionMap.forEach((events, sessionId) => {
        if (events.length < 3) return; // Skip very short sessions

        const userId = events.find(e => e.user_id)?.user_id;
        const profile = userId ? profileMap.get(userId) : null;
        const startTime = events[0].created_at;
        const endTime = events[events.length - 1].created_at;
        const duration = Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000);
        const pages = [...new Set(events.map(e => e.page_path).filter(Boolean))];

        sessionList.push({
          session_id: sessionId,
          user_id: userId,
          first_name: profile?.first_name || null,
          email: profile?.email || null,
          events,
          start_time: startTime,
          end_time: endTime,
          duration_seconds: duration,
          pages_visited: pages,
        });
      });

      // Sort by most recent
      sessionList.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
      setSessions(sessionList.slice(0, 50)); // Limit to 50 sessions
      setLoading(false);
    };

    fetchSessions();
  }, [period]);

  // Playback effect
  useEffect(() => {
    if (!isPlaying || !selectedSession) return;

    const interval = setInterval(() => {
      setCurrentEventIndex(prev => {
        if (prev >= selectedSession.events.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, selectedSession]);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'interaction': return <MousePointer className="h-3 w-3" />;
      case 'page_view': return <Eye className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const currentEvent = selectedSession?.events[currentEventIndex];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sessions List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Sessions</CardTitle>
            <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24h</SelectItem>
                <SelectItem value="7d">7 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-3 bg-muted rounded animate-pulse h-16" />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No sessions found</p>
            ) : (
              <div className="space-y-2">
                {sessions.map(session => (
                  <button
                    key={session.session_id}
                    onClick={() => {
                      setSelectedSession(session);
                      setCurrentEventIndex(0);
                      setIsPlaying(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedSession?.session_id === session.session_id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {session.first_name || 'Anonymous'}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {session.events.length} events
                      </Badge>
                    </div>
                    <div className="text-xs opacity-75">
                      {format(new Date(session.start_time), 'MMM d, HH:mm')} • {formatDuration(session.duration_seconds)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Session Replay */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Play className="h-5 w-5" />
            Session Replay
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedSession ? (
            <div className="h-96 flex items-center justify-center text-muted-foreground">
              Select a session to view the replay
            </div>
          ) : (
            <div className="space-y-4">
              {/* Session Info */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <span className="font-medium">{selectedSession.first_name || 'Anonymous'}</span>
                  {selectedSession.email && (
                    <span className="text-sm text-muted-foreground ml-2">{selectedSession.email}</span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedSession.pages_visited.length} pages • {formatDuration(selectedSession.duration_seconds)}
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentEventIndex(0)}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentEventIndex(Math.min(currentEventIndex + 5, selectedSession.events.length - 1))}
                >
                  <FastForward className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground ml-4">
                  {currentEventIndex + 1} / {selectedSession.events.length}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${((currentEventIndex + 1) / selectedSession.events.length) * 100}%` }}
                />
              </div>

              {/* Current Event */}
              {currentEvent && (
                <div className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {getEventIcon(currentEvent.event_type)}
                    <Badge variant="outline">{currentEvent.event_type}</Badge>
                    <span className="font-medium">{currentEvent.event_name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Page: {currentEvent.page_path}
                  </div>
                  {currentEvent.event_data && (
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                      {JSON.stringify(currentEvent.event_data, null, 2)}
                    </pre>
                  )}
                </div>
              )}

              {/* Event Timeline */}
              <ScrollArea className="h-40">
                <div className="space-y-1">
                  {selectedSession.events.map((event, i) => (
                    <button
                      key={event.id}
                      onClick={() => setCurrentEventIndex(i)}
                      className={`w-full text-left px-2 py-1 text-xs rounded transition-colors ${
                        i === currentEventIndex 
                          ? 'bg-primary text-primary-foreground' 
                          : i < currentEventIndex 
                            ? 'bg-muted/50 text-muted-foreground'
                            : 'hover:bg-muted/30'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {getEventIcon(event.event_type)}
                        {event.event_name}
                      </span>
                      <span className="float-right">{format(new Date(event.created_at), 'HH:mm:ss')}</span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
