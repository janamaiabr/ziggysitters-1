import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Shield, CheckCircle, XCircle, Clock, MapPin, FileText, Users, Eye, Rocket, Mail, Trash2, StickyNote, Star, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import PayoutsTab from '@/components/admin/PayoutsTab';
import BookingTracker from '@/components/admin/BookingTracker';

// Use the safe public sitter profiles type that doesn't expose sensitive data
type PublicSitterProfile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  suburb: string | null;
  city: string | null;
  postal_code?: string;
  role: 'pet_owner' | 'pet_sitter' | 'admin';
  bio: string | null;
  avatar_url: string | null;
  is_verified: boolean | null;
  rating: number | null;
  total_reviews: number | null;
  background_check_verified: boolean | null;
  verification_status: 'pending' | 'verified' | 'rejected' | null;
  id_document_url?: string | null;
  blue_card_document_url?: string | null;
  verification_documents_uploaded_at?: string | null;
  created_at: string;
  admin_notes?: string | null;
  golden_badge_approved?: boolean | null;
  golden_badge_approved_at?: string | null;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<PublicSitterProfile[]>([]);
  const [allUsers, setAllUsers] = useState<PublicSitterProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Filters
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [documentFilter, setDocumentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Admin notes dialog
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedUserForNotes, setSelectedUserForNotes] = useState<PublicSitterProfile | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    initializeAdminDashboard();
  }, [user]);

  const initializeAdminDashboard = async () => {
    await checkAdminStatus();
    await Promise.all([fetchPendingSitters(), fetchAllUsers()]);
  };

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      // Use new user_roles table for security
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      const adminStatus = !!data;
      setIsAdmin(adminStatus);
      
      // If not admin, show error and redirect
      if (!adminStatus) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate('/');
    }
  };

  const fetchPendingSitters = async () => {
    if (!user) return;
    
    try {
      // Fetch from profiles table with admin privileges - include documents and admin notes
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone, address, suburb, city, postal_code, role, bio, avatar_url, is_verified, rating, total_reviews, background_check_verified, verification_status, created_at, id_document_url, blue_card_document_url, verification_documents_uploaded_at, admin_notes')
        .eq('role', 'pet_sitter')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching sitters:', error);
      toast({
        title: "Error",
        description: "Failed to load sitter applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone, address, suburb, city, postal_code, role, bio, avatar_url, is_verified, rating, total_reviews, background_check_verified, verification_status, created_at, id_document_url, blue_card_document_url, verification_documents_uploaded_at, admin_notes')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error('Error fetching all users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    }
  };

  const updateDocumentVerification = async (profileId: string, isVerified: boolean, verificationStatus: 'pending' | 'verified' | 'rejected') => {
    try {
      const profileToUpdate = profiles.find(p => p.id === profileId);
      if (!profileToUpdate) throw new Error('Profile not found');

      console.log('Updating document verification:', { profileId, isVerified, verificationStatus });

      // Use the admin RPC function to update document verification status
      const { error } = await supabase.rpc('update_verification_status', {
        profile_id: profileId,
        is_verified: isVerified,
        verification_status: verificationStatus
      });

      if (error) {
        console.error('RPC Error:', error);
        throw error;
      }

      // Send verification update email
      try {
        await supabase.functions.invoke('send-verification-update', {
          body: {
            user_email: profileToUpdate.email,
            user_name: `${profileToUpdate.first_name} ${profileToUpdate.last_name}`,
            verification_status: verificationStatus,
            rejection_reason: verificationStatus === 'rejected' ? 'Please review your profile and documents for completeness and accuracy.' : undefined
          }
        });
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        // Don't fail the whole operation if email fails
      }

      toast({
        title: "Success",
        description: `Document verification ${isVerified ? 'approved' : 'rejected'} successfully`,
      });

      fetchPendingSitters();
    } catch (error) {
      console.error('Error updating verification:', error);
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive"
      });
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

  const toggleSelectAll = () => {
    if (selectedUserIds.size === allUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(allUsers.map(u => u.id)));
    }
  };

  const handleOpenNotesDialog = (user: PublicSitterProfile) => {
    setSelectedUserForNotes(user);
    setAdminNotes(user.admin_notes || '');
    setNotesDialogOpen(true);
  };

  const handleSaveAdminNotes = async () => {
    if (!selectedUserForNotes) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ admin_notes: adminNotes.trim() || null })
        .eq('id', selectedUserForNotes.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin notes saved successfully",
      });

      setNotesDialogOpen(false);
      await Promise.all([fetchPendingSitters(), fetchAllUsers()]);
    } catch (error) {
      console.error('Error saving admin notes:', error);
      toast({
        title: "Error",
        description: "Failed to save admin notes",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUsers = async () => {
    if (selectedUserIds.size === 0) return;

    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      // Get user_ids from profile IDs
      const { data: usersToDelete, error: fetchError } = await supabase
        .from('profiles')
        .select('user_id')
        .in('id', Array.from(selectedUserIds));

      if (fetchError) throw fetchError;
      if (!usersToDelete || usersToDelete.length === 0) {
        throw new Error('No users found to delete');
      }

      const userIds = usersToDelete.map(u => u.user_id);

      const { data, error } = await supabase.functions.invoke('delete-users', {
        body: { userIds }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully deleted ${data.successCount} user(s)`,
      });

      setSelectedUserIds(new Set());
      await Promise.all([fetchPendingSitters(), fetchAllUsers()]);
    } catch (error) {
      console.error('Error deleting users:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete users",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to access the admin dashboard.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const pendingSitters = profiles.filter(p => p.verification_status === 'pending' || (!p.verification_status && !p.is_verified));
  const approvedSitters = profiles.filter(p => p.is_verified && p.verification_status === 'verified');
  const rejectedSitters = profiles.filter(p => p.verification_status === 'rejected');
  
  // Apply filters to all users
  const filteredUsers = allUsers.filter(user => {
    // Search filter - check name, email, phone
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      const email = user.email?.toLowerCase() || '';
      const phone = user.phone?.toLowerCase() || '';
      
      if (!fullName.includes(query) && !email.includes(query) && !phone.includes(query)) {
        return false;
      }
    }
    
    // Role filter
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    
    // Status filter (for sitters only)
    if (statusFilter !== 'all') {
      if (user.role !== 'pet_sitter') return false;
      if (statusFilter === 'pending' && !(user.verification_status === 'pending' || (!user.verification_status && !user.is_verified))) return false;
      if (statusFilter === 'verified' && !user.is_verified) return false;
      if (statusFilter === 'rejected' && user.verification_status !== 'rejected') return false;
    }
    
    // Document filter (for sitters only)
    if (documentFilter !== 'all') {
      if (user.role !== 'pet_sitter') return false;
      if (documentFilter === 'has_id' && !user.id_document_url) return false;
      if (documentFilter === 'no_id' && user.id_document_url) return false;
    }
    
    return true;
  });

  return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage pet sitter applications and verifications</p>
        </div>

      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="all-users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            All Users ({allUsers.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingSitters.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved ({approvedSitters.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rejected ({rejectedSitters.length})
          </TabsTrigger>
          <TabsTrigger value="payouts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Payouts
          </TabsTrigger>
          <TabsTrigger value="marketing" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Marketing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <BookingTracker />
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Document Review Quick Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Review and approve sitter verification documents (ID verification and police vet checks for gold star badges).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Shield className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                      <h3 className="font-semibold mb-2">ID Verification</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {pendingSitters.length} pending
                      </p>
                    <Button onClick={() => navigate('/admin/documents')}>
                      Review Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Mail className="h-12 w-12 mx-auto mb-3 text-purple-600" />
                    <h3 className="font-semibold mb-2">Invite Unverified Sitters</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Send invitations to upload docs
                    </p>
                    <Button onClick={() => navigate('/admin/invite-unverified-sitters')} variant="outline">
                      Send Invitations
                    </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Star className="h-12 w-12 mx-auto mb-3 text-yellow-500" />
                      <h3 className="font-semibold mb-2">Gold Star Badge</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Police vet checks
                      </p>
                      <Button onClick={() => navigate('/admin/documents')}>
                        Review Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
                      <h3 className="font-semibold mb-2">Approved</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {approvedSitters.length} sitters
                      </p>
                      <Button variant="outline" onClick={() => navigate('/admin/documents')}>
                        View All
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all-users">
          <Card>
            <CardHeader>
              <CardTitle>All Platform Users</CardTitle>
              
              {/* Search and Filters */}
              <div className="flex flex-wrap gap-4 mt-4 items-end">
                <div className="flex-1 min-w-[250px]">
                  <Label htmlFor="search-query" className="text-sm font-medium mb-2 block">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search-query"
                      placeholder="Search by name, email, or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="role-filter" className="text-sm font-medium mb-2 block">Role</Label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger id="role-filter">
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="pet_owner">Pet Owner</SelectItem>
                      <SelectItem value="pet_sitter">Pet Sitter</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="status-filter" className="text-sm font-medium mb-2 block">Verification Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status-filter">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="document-filter" className="text-sm font-medium mb-2 block">ID Document</Label>
                  <Select value={documentFilter} onValueChange={setDocumentFilter}>
                    <SelectTrigger id="document-filter">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="has_id">Has ID</SelectItem>
                      <SelectItem value="no_id">No ID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedUserIds.size > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={isDeleting}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Selected ({selectedUserIds.size})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete {selectedUserIds.size} user(s) and all their associated data. 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteUsers} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete Users
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedUserIds.size === filteredUsers.length && filteredUsers.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        No users found matching the selected filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox 
                          checked={selectedUserIds.has(user.id)}
                          onCheckedChange={() => toggleUserSelection(user.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url || ''} alt={user.first_name} />
                            <AvatarFallback>{user.first_name?.[0]}{user.last_name?.[0]}</AvatarFallback>
                          </Avatar>
                          <span>{user.first_name} {user.last_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={
                          user.role === 'admin' ? 'default' : 
                          user.role === 'pet_sitter' ? 'secondary' : 
                          'outline'
                        }>
                          {user.role === 'pet_owner' ? 'Pet Owner' : 
                           user.role === 'pet_sitter' ? 'Pet Sitter' : 
                           'Admin'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.suburb && user.city ? `${user.suburb}, ${user.city}` : user.city || '-'}
                      </TableCell>
                      <TableCell>
                        {user.role === 'pet_sitter' ? (
                          <div className="flex flex-col gap-1">
                            <div>
                              {user.id_document_url ? (
                                <Badge variant="default" className="text-xs">ID ✓</Badge>
                              ) : user.is_verified && user.verification_documents_uploaded_at ? (
                                <Badge variant="secondary" className="text-xs">ID ✓ (Verified)</Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">ID ✗</Badge>
                              )}
                            </div>
                            <div>
                              {user.blue_card_document_url ? (
                                <Badge variant="default" className="text-xs bg-yellow-500">Police Vet ⭐</Badge>
                              ) : user.is_verified && user.verification_documents_uploaded_at ? (
                                <Badge variant="secondary" className="text-xs">Police Vet ✓ (Verified)</Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">No Police Vet</Badge>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.role === 'pet_sitter' ? (
                          <Badge variant={
                            user.is_verified ? 'default' : 
                            user.verification_status === 'rejected' ? 'destructive' : 
                            'secondary'
                          }>
                            {user.is_verified ? 'Verified' : user.verification_status || 'Pending'}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenNotesDialog(user)}
                          className="h-8"
                        >
                          <StickyNote className={`h-4 w-4 ${user.admin_notes ? 'text-primary' : 'text-muted-foreground'}`} />
                        </Button>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/admin/user/${user.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Notes Dialog */}
        <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Admin Notes - {selectedUserForNotes?.first_name} {selectedUserForNotes?.last_name}</DialogTitle>
              <DialogDescription>
                Secure admin-only notes for verification details, ID name discrepancies, etc.
                <div className="mt-2 text-sm">
                  <strong>Email:</strong> {selectedUserForNotes?.email}
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="admin-notes" className="text-sm font-medium">
                  Admin Notes (Confidential)
                </Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="E.g., ID shows maiden name 'Carroll' - married name is 'Akroyd'. License: CC632208, DOB: 28-12-1983"
                  className="mt-2 min-h-[200px]"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  These notes are only visible to admins and are used for internal verification purposes.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveAdminNotes}>
                  Save Notes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <TabsContent value="pending">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingSitters.map((profile) => (
              <SitterCard 
                key={profile.id} 
                profile={profile} 
                onApprove={() => profile.id && updateDocumentVerification(profile.id, true, 'verified')}
                onReject={() => profile.id && updateDocumentVerification(profile.id, false, 'rejected')}
                onViewDetails={() => navigate(`/admin/user/${profile.id}`)}
                showActions={true}
              />
            ))}
          </div>
          {pendingSitters.length === 0 && (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">No pending applications</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedSitters.map((profile) => (
              <SitterCard 
                key={profile.id} 
                profile={profile} 
                onViewDetails={() => navigate(`/admin/user/${profile.id}`)}
                showActions={false}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rejected">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rejectedSitters.map((profile) => (
              <SitterCard 
                key={profile.id} 
                profile={profile} 
                onApprove={() => profile.id && updateDocumentVerification(profile.id, true, 'verified')}
                onViewDetails={() => navigate(`/admin/user/${profile.id}`)}
                showActions={true}
                isRejected={true}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payouts">
          <PayoutsTab />
        </TabsContent>

        <TabsContent value="marketing">
          <Card>
            <CardHeader>
              <CardTitle>Email Campaigns</CardTitle>
              <p className="text-sm text-muted-foreground">Send promotional emails to users with marketing subscriptions</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-lg p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Rocket className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">Black Friday Promotion</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Send Black Friday promotional emails with the <code className="bg-muted px-2 py-1 rounded">BLACKFRIDAY50</code> promo code to all users subscribed to marketing emails.
                    </p>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2 mb-4">
                      <p className="text-sm"><strong>Code:</strong> BLACKFRIDAY50</p>
                      <p className="text-sm"><strong>Discount:</strong> 50% off platform fee</p>
                      <p className="text-sm"><strong>Valid Until:</strong> November 30, 2025</p>
                      <p className="text-sm"><strong>Target:</strong> Pet owners (discount offer) + Sitters (info about promotion)</p>
                    </div>
                    <Button
                      onClick={async () => {
                        try {
                          toast({
                            title: "Sending emails...",
                            description: "This may take a moment for large user bases",
                          });
                          
                          const { data, error } = await supabase.functions.invoke('send-black-friday-promo');
                          
                          if (error) throw error;
                          
                          toast({
                            title: "Campaign sent!",
                            description: `Successfully sent ${data.successful} emails (${data.failed} failed)`,
                          });
                        } catch (error) {
                          console.error('Error sending campaign:', error);
                          toast({
                            title: "Error",
                            description: "Failed to send email campaign",
                            variant: "destructive"
                          });
                        }
                      }}
                      className="gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Send Black Friday Campaign
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface SitterCardProps {
  profile: PublicSitterProfile;
  onApprove?: () => void;
  onReject?: () => void;
  onViewDetails?: () => void;
  showActions: boolean;
  isRejected?: boolean;
}

function SitterCard({ profile, onApprove, onReject, onViewDetails, showActions, isRejected }: SitterCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage 
                src={profile.avatar_url || ''} 
                alt={`${profile.first_name} ${profile.last_name}`}
                className="object-cover"
              />
              <AvatarFallback>{profile.first_name?.[0] || 'U'}{profile.last_name?.[0] || ''}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{`${profile.first_name} ${profile.last_name}`}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-3 h-3 mr-1" />
                {profile.suburb && profile.city ? `${profile.suburb}, ${profile.city}` : profile.city || 'Location not provided'}
              </div>
            </div>
          </div>
          <Badge 
            variant={profile.is_verified ? "default" : profile.verification_status === 'rejected' ? "destructive" : "secondary"}
          >
            {profile.is_verified ? 'Verified' : profile.verification_status || 'Pending'}
          </Badge>
          {profile.golden_badge_approved && (
            <Badge className="bg-yellow-500 hover:bg-yellow-600 ml-2">
              <Star className="mr-1 h-3 w-3" />
              Golden
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {profile.bio && (
          <p className="text-sm text-muted-foreground line-clamp-3">{profile.bio}</p>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Shield className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-gray-600">Rating: {profile.rating ? `${profile.rating}/5` : 'No ratings yet'}</span>
          </div>
          
          {profile.total_reviews !== null && profile.total_reviews > 0 && (
            <div className="flex items-center text-sm">
              <CheckCircle className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-gray-600">{profile.total_reviews} completed</span>
            </div>
          )}
          
          {profile.background_check_verified && (
            <div className="flex items-center text-sm">
              <Shield className="w-4 h-4 mr-2 text-green-500" />
              <span className="text-green-600">Background check verified</span>
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500">
          Applied: {new Date(profile.created_at).toLocaleDateString()}
        </div>
        
        {/* View Details Button - always visible */}
        <div className="pt-2">
          {onViewDetails && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={onViewDetails}
              className="w-full"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Full Details
            </Button>
          )}
        </div>
        
        {showActions && !profile.is_verified && (
          <div className="flex gap-2 pt-2">
            {onApprove && (
              <Button 
                size="sm" 
                onClick={onApprove}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Verify Documents
              </Button>
            )}
            {onReject && !isRejected && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onReject}
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}