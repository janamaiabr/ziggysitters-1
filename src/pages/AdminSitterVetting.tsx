import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { Shield, ChevronDown, Loader2 } from 'lucide-react';

type VettingStatus = 'pending' | 'in_progress' | 'approved' | 'rejected';

interface SitterVetting {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  referral_source: string | null;
  police_check_status: string | null;
  police_check_date: string | null;
  home_visit_completed: boolean | null;
  home_visit_date: string | null;
  home_visit_notes: string | null;
  references_count: number | null;
  interview_completed: boolean | null;
  interview_notes: string | null;
  interview_date: string | null;
  vetting_status: string | null;
}

function getStatusBadge(status: string | null) {
  const s = status || 'pending';
  const styles: Record<string, string> = {
    pending: 'bg-red-100 text-red-700 border-red-200',
    in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-300',
  };
  return (
    <Badge variant="outline" className={styles[s] || styles.pending}>
      {s.replace('_', ' ')}
    </Badge>
  );
}

function getPoliceCheckBadge(status: string | null) {
  const s = status || 'not_submitted';
  const styles: Record<string, string> = {
    not_submitted: 'bg-gray-100 text-gray-600',
    pending: 'bg-yellow-100 text-yellow-700',
    verified: 'bg-green-100 text-green-700',
    expired: 'bg-red-100 text-red-700',
  };
  return (
    <Badge variant="outline" className={styles[s] || styles.not_submitted}>
      {s.replace('_', ' ')}
    </Badge>
  );
}

export default function AdminSitterVetting() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sitters, setSitters] = useState<SitterVetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<VettingStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSitters();
  }, []);

  const fetchSitters = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, referral_source, police_check_status, police_check_date, home_visit_completed, home_visit_date, home_visit_notes, references_count, interview_completed, interview_notes, interview_date, vetting_status')
      .eq('role', 'sitter')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error fetching sitters', description: error.message, variant: 'destructive' });
    } else {
      setSitters((data as any[]) || []);
    }
    setLoading(false);
  };

  const updateSitter = async (id: string, updates: Partial<SitterVetting>) => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update(updates as any)
      .eq('id', id);

    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Sitter updated' });
      setSitters(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    }
    setSaving(false);
  };

  const filtered = filter === 'all' ? sitters : sitters.filter(s => (s.vetting_status || 'pending') === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Sitter Vetting Pipeline</h1>
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ({sitters.length})</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Referral</TableHead>
                <TableHead>Police Check</TableHead>
                <TableHead>Home Visit</TableHead>
                <TableHead>References</TableHead>
                <TableHead>Interview</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((sitter) => (
                <Collapsible key={sitter.id} open={expandedId === sitter.id} onOpenChange={(open) => setExpandedId(open ? sitter.id : null)} asChild>
                  <>
                    <CollapsibleTrigger asChild>
                      <TableRow className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{sitter.first_name} {sitter.last_name}</TableCell>
                        <TableCell>{sitter.referral_source || '–'}</TableCell>
                        <TableCell>{getPoliceCheckBadge(sitter.police_check_status)}</TableCell>
                        <TableCell>{sitter.home_visit_completed ? '✅' : '❌'}</TableCell>
                        <TableCell>{sitter.references_count || 0}</TableCell>
                        <TableCell>{sitter.interview_completed ? '✅' : '❌'}</TableCell>
                        <TableCell>{getStatusBadge(sitter.vetting_status)}</TableCell>
                        <TableCell><ChevronDown className="h-4 w-4" /></TableCell>
                      </TableRow>
                    </CollapsibleTrigger>
                    <CollapsibleContent asChild>
                      <TableRow>
                        <TableCell colSpan={8} className="bg-muted/30">
                          <div className="p-4 space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <Label>Vetting Status</Label>
                                <Select
                                  value={sitter.vetting_status || 'pending'}
                                  onValueChange={(v) => updateSitter(sitter.id, { vetting_status: v })}
                                >
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Police Check</Label>
                                <Select
                                  value={sitter.police_check_status || 'not_submitted'}
                                  onValueChange={(v) => updateSitter(sitter.id, { police_check_status: v })}
                                >
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="not_submitted">Not Submitted</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="verified">Verified</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>References Count</Label>
                                <Input
                                  type="number"
                                  value={sitter.references_count || 0}
                                  onChange={(e) => updateSitter(sitter.id, { references_count: parseInt(e.target.value) || 0 })}
                                />
                              </div>
                              <div className="flex items-end gap-2">
                                <div>
                                  <Label>Home Visit Done</Label>
                                  <div className="pt-2">
                                    <Switch
                                      checked={!!sitter.home_visit_completed}
                                      onCheckedChange={(checked) => updateSitter(sitter.id, {
                                        home_visit_completed: checked,
                                        home_visit_date: checked ? new Date().toISOString().split('T')[0] : null,
                                      })}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <Label>Interview Notes</Label>
                              <Textarea
                                value={sitter.interview_notes || ''}
                                onChange={(e) => {
                                  setSitters(prev => prev.map(s => s.id === sitter.id ? { ...s, interview_notes: e.target.value } : s));
                                }}
                                onBlur={(e) => updateSitter(sitter.id, {
                                  interview_notes: e.target.value,
                                  interview_completed: true,
                                  interview_date: new Date().toISOString().split('T')[0],
                                })}
                                placeholder="Add interview notes..."
                              />
                            </div>
                            <div>
                              <Label>Home Visit Notes</Label>
                              <Textarea
                                value={sitter.home_visit_notes || ''}
                                onChange={(e) => {
                                  setSitters(prev => prev.map(s => s.id === sitter.id ? { ...s, home_visit_notes: e.target.value } : s));
                                }}
                                onBlur={(e) => updateSitter(sitter.id, { home_visit_notes: e.target.value })}
                                placeholder="Add home visit notes..."
                              />
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No sitters found with this status.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
