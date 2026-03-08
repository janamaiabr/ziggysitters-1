import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Stethoscope, Plus, Loader2, AlertTriangle } from 'lucide-react';

interface VetClinic {
  id: string;
  clinic_name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  suburb: string | null;
  first_visit_date: string | null;
  last_contact_date: string | null;
  next_follow_up_date: string | null;
  referral_count: number;
  relationship_status: string;
  notes: string | null;
}

const emptyClinic: Omit<VetClinic, 'id'> = {
  clinic_name: '',
  contact_person: '',
  phone: '',
  email: '',
  address: '',
  suburb: '',
  first_visit_date: null,
  last_contact_date: null,
  next_follow_up_date: null,
  referral_count: 0,
  relationship_status: 'prospect',
  notes: '',
};

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    prospect: 'bg-gray-100 text-gray-700',
    contacted: 'bg-blue-100 text-blue-700',
    met: 'bg-yellow-100 text-yellow-700',
    active_referrer: 'bg-green-100 text-green-700',
    inactive: 'bg-red-100 text-red-700',
  };
  return (
    <Badge variant="outline" className={styles[status] || styles.prospect}>
      {status.replace('_', ' ')}
    </Badge>
  );
}

function isOverdue(date: string | null): boolean {
  if (!date) return false;
  return new Date(date) < new Date();
}

export default function AdminVetClinics() {
  const { toast } = useToast();
  const [clinics, setClinics] = useState<VetClinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Partial<VetClinic> & { clinic_name: string }>(emptyClinic as any);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchClinics(); }, []);

  const fetchClinics = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('vet_clinic_contacts' as any)
      .select('*')
      .order('next_follow_up_date', { ascending: true, nullsFirst: false });
    if (error) {
      toast({ title: 'Error loading clinics', description: error.message, variant: 'destructive' });
    } else {
      setClinics((data as any[]) || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editingClinic.clinic_name.trim()) {
      toast({ title: 'Clinic name is required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    if (isEditing && editingClinic.id) {
      const { id, ...updates } = editingClinic;
      const { error } = await supabase
        .from('vet_clinic_contacts' as any)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) {
        toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Clinic updated' });
      }
    } else {
      const { id, ...newClinic } = editingClinic as any;
      const { error } = await supabase
        .from('vet_clinic_contacts' as any)
        .insert(newClinic);
      if (error) {
        toast({ title: 'Create failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Clinic added' });
      }
    }
    setSaving(false);
    setDialogOpen(false);
    fetchClinics();
  };

  const openAdd = () => {
    setEditingClinic(emptyClinic as any);
    setIsEditing(false);
    setDialogOpen(true);
  };

  const openEdit = (clinic: VetClinic) => {
    setEditingClinic({ ...clinic });
    setIsEditing(true);
    setDialogOpen(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Vet Clinic CRM</h1>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Add Clinic</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clinic</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Suburb</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Referrals</TableHead>
                <TableHead>Next Follow-up</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clinics.map((clinic) => (
                <TableRow
                  key={clinic.id}
                  className={`cursor-pointer hover:bg-muted/50 ${isOverdue(clinic.next_follow_up_date) ? 'bg-red-50' : ''}`}
                  onClick={() => openEdit(clinic)}
                >
                  <TableCell className="font-medium">{clinic.clinic_name}</TableCell>
                  <TableCell>{clinic.contact_person || '–'}</TableCell>
                  <TableCell>{clinic.suburb || '–'}</TableCell>
                  <TableCell>{getStatusBadge(clinic.relationship_status)}</TableCell>
                  <TableCell>{clinic.referral_count}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {clinic.next_follow_up_date || '–'}
                      {isOverdue(clinic.next_follow_up_date) && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {clinics.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No clinics yet. Add your first one!</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Clinic' : 'Add Clinic'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Clinic Name *</Label>
              <Input value={editingClinic.clinic_name} onChange={(e) => setEditingClinic(prev => ({ ...prev, clinic_name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Contact Person</Label><Input value={editingClinic.contact_person || ''} onChange={(e) => setEditingClinic(prev => ({ ...prev, contact_person: e.target.value }))} /></div>
              <div><Label>Phone</Label><Input value={editingClinic.phone || ''} onChange={(e) => setEditingClinic(prev => ({ ...prev, phone: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Email</Label><Input value={editingClinic.email || ''} onChange={(e) => setEditingClinic(prev => ({ ...prev, email: e.target.value }))} /></div>
              <div><Label>Suburb</Label><Input value={editingClinic.suburb || ''} onChange={(e) => setEditingClinic(prev => ({ ...prev, suburb: e.target.value }))} /></div>
            </div>
            <div><Label>Address</Label><Input value={editingClinic.address || ''} onChange={(e) => setEditingClinic(prev => ({ ...prev, address: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Relationship Status</Label>
                <Select value={editingClinic.relationship_status} onValueChange={(v) => setEditingClinic(prev => ({ ...prev, relationship_status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="met">Met</SelectItem>
                    <SelectItem value="active_referrer">Active Referrer</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Referral Count</Label><Input type="number" value={editingClinic.referral_count || 0} onChange={(e) => setEditingClinic(prev => ({ ...prev, referral_count: parseInt(e.target.value) || 0 }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Last Contact</Label><Input type="date" value={editingClinic.last_contact_date || ''} onChange={(e) => setEditingClinic(prev => ({ ...prev, last_contact_date: e.target.value || null }))} /></div>
              <div><Label>Next Follow-up</Label><Input type="date" value={editingClinic.next_follow_up_date || ''} onChange={(e) => setEditingClinic(prev => ({ ...prev, next_follow_up_date: e.target.value || null }))} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={editingClinic.notes || ''} onChange={(e) => setEditingClinic(prev => ({ ...prev, notes: e.target.value }))} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : isEditing ? 'Update' : 'Add Clinic'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
