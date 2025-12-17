import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Trash2, StickyNote, Search, Eye, CreditCard, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

type UserProfile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  suburb: string | null;
  city: string | null;
  role: 'pet_owner' | 'pet_sitter' | 'admin';
  avatar_url: string | null;
  is_verified: boolean | null;
  verification_status: 'pending' | 'verified' | 'rejected' | null;
  id_document_url?: string | null;
  id_document_urls?: string[] | null;
  created_at: string;
  admin_notes?: string | null;
}

export default function AdminUsers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [sitterServices, setSitterServices] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [sendingStripeReminders, setSendingStripeReminders] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [usersRes, servicesRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, first_name, last_name, email, phone, suburb, city, role, avatar_url, is_verified, verification_status, id_document_url, id_document_urls, created_at, admin_notes')
          .order('created_at', { ascending: false }),
        supabase
          .from('sitter_services')
          .select('sitter_id')
          .eq('is_offered', true)
      ]);

      if (usersRes.error) throw usersRes.error;
      setUsers(usersRes.data || []);

      const servicesMap: Record<string, boolean> = {};
      (servicesRes.data || []).forEach(s => {
        servicesMap[s.sitter_id] = true;
      });
      setSitterServices(servicesMap);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUserIds(newSelected);
  };

  const handleSaveAdminNotes = async () => {
    if (!selectedUser) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ admin_notes: adminNotes.trim() || null })
        .eq('id', selectedUser.id);

      if (error) throw error;
      toast({ title: "Success", description: "Admin notes saved" });
      setNotesDialogOpen(false);
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save notes", variant: "destructive" });
    }
  };

  const handleDeleteUsers = async () => {
    if (selectedUserIds.size === 0) return;
    setIsDeleting(true);
    try {
      const { data: usersToDelete } = await supabase
        .from('profiles')
        .select('user_id')
        .in('id', Array.from(selectedUserIds));

      if (!usersToDelete?.length) throw new Error('No users found');

      const { data, error } = await supabase.functions.invoke('delete-users', {
        body: { userIds: usersToDelete.map(u => u.user_id) }
      });

      if (error) throw error;
      toast({ title: "Success", description: `Deleted ${data.successCount} user(s)` });
      setSelectedUserIds(new Set());
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete users", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const sendStripeReminders = async () => {
    setSendingStripeReminders(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-stripe-setup-reminders');
      if (error) throw error;
      toast({ 
        title: "Stripe Reminders Sent", 
        description: `Sent ${data.emails_sent} reminder emails to sitters without Stripe setup` 
      });
    } catch (error) {
      console.error('Error sending reminders:', error);
      toast({ title: "Error", description: "Failed to send reminders", variant: "destructive" });
    } finally {
      setSendingStripeReminders(false);
    }
  };


  const filteredUsers = users.filter(u => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
      if (!fullName.includes(query) && !u.email?.toLowerCase().includes(query)) return false;
    }
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter !== 'all') {
      if (u.role !== 'pet_sitter') return false;
      if (statusFilter === 'verified' && !u.is_verified) return false;
      if (statusFilter === 'pending' && u.is_verified) return false;
    }
    return true;
  });

  if (loading) return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">All Users</h1>
        <p className="text-muted-foreground">Manage all platform users</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[250px]">
              <Label className="text-sm font-medium mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="min-w-[150px]">
              <Label className="text-sm font-medium mb-2 block">Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="pet_owner">Pet Owner</SelectItem>
                  <SelectItem value="pet_sitter">Pet Sitter</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="min-w-[150px]">
              <Label className="text-sm font-medium mb-2 block">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedUserIds.size > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isDeleting}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete ({selectedUserIds.size})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete users?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete {selectedUserIds.size} user(s).
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteUsers} className="bg-destructive">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={sendStripeReminders}
              disabled={sendingStripeReminders}
            >
              {sendingStripeReminders ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4 mr-2" />
              )}
              Send Stripe Reminders
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox 
                    checked={selectedUserIds.size === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={() => {
                      if (selectedUserIds.size === filteredUsers.length) {
                        setSelectedUserIds(new Set());
                      } else {
                        setSelectedUserIds(new Set(filteredUsers.map(u => u.id)));
                      }
                    }}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>In Search?</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedUserIds.has(u.id)}
                        onCheckedChange={() => toggleUserSelection(u.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.avatar_url || ''} />
                          <AvatarFallback>{u.first_name?.[0]}{u.last_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{u.first_name} {u.last_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === 'admin' ? 'default' : u.role === 'pet_sitter' ? 'secondary' : 'outline'}>
                        {u.role === 'pet_owner' ? 'Owner' : u.role === 'pet_sitter' ? 'Sitter' : 'Admin'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {u.suburb && u.city ? `${u.suburb}, ${u.city}` : u.city || '-'}
                    </TableCell>
                    <TableCell>
                      {u.role === 'pet_sitter' ? (
                        sitterServices[u.id] ? (
                          <Badge className="bg-green-600 text-xs">✓ Visible</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">✗ No Services</Badge>
                        )
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {u.role === 'pet_sitter' ? (
                        u.is_verified ? (
                          <Badge className="bg-green-600 text-xs">✓ Verified</Badge>
                        ) : u.verification_status === 'rejected' ? (
                          <Badge variant="destructive" className="text-xs">Rejected</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">Awaiting Docs</Badge>
                        )
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/admin/user/${u.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(u);
                            setAdminNotes(u.admin_notes || '');
                            setNotesDialogOpen(true);
                          }}
                        >
                          <StickyNote className={`h-4 w-4 ${u.admin_notes ? 'text-amber-500' : ''}`} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Notes - {selectedUser?.first_name} {selectedUser?.last_name}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add internal notes about this user..."
            rows={5}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAdminNotes}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
