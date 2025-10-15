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
import { Shield, CheckCircle, XCircle, Clock, MapPin, FileText, Users, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PayoutsTab from '@/components/admin/PayoutsTab';

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
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<PublicSitterProfile[]>([]);
  const [allUsers, setAllUsers] = useState<PublicSitterProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    fetchPendingSitters();
    fetchAllUsers();
  }, [user]);

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
      
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const fetchPendingSitters = async () => {
    if (!user) return;
    
    try {
      // Fetch from profiles table with admin privileges - include documents
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone, address, suburb, city, postal_code, role, bio, avatar_url, is_verified, rating, total_reviews, background_check_verified, verification_status, created_at, id_document_url, blue_card_document_url, verification_documents_uploaded_at')
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
        .select('id, first_name, last_name, email, phone, address, suburb, city, postal_code, role, bio, avatar_url, is_verified, rating, total_reviews, background_check_verified, verification_status, created_at, id_document_url, blue_card_document_url, verification_documents_uploaded_at')
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

  const updateVerificationStatus = async (profileId: string, isVerified: boolean, verificationStatus: 'pending' | 'verified' | 'rejected') => {
    try {
      const profileToUpdate = profiles.find(p => p.id === profileId);
      if (!profileToUpdate) throw new Error('Profile not found');

      console.log('Updating verification status:', { profileId, isVerified, verificationStatus });

      // Use the new admin RPC function to update verification status
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
        description: `Sitter ${isVerified ? 'approved' : 'rejected'} successfully`,
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage pet sitter applications and verifications</p>
      </div>

      <Tabs defaultValue="all-users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
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
        </TabsList>

        <TabsContent value="all-users">
          <Card>
            <CardHeader>
              <CardTitle>All Platform Users</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map((user) => (
                    <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50">
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
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingSitters.map((profile) => (
              <SitterCard 
                key={profile.id} 
                profile={profile} 
                onApprove={() => profile.id && updateVerificationStatus(profile.id, true, 'verified')}
                onReject={() => profile.id && updateVerificationStatus(profile.id, false, 'rejected')}
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
                onApprove={() => profile.id && updateVerificationStatus(profile.id, true, 'verified')}
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
                {isRejected ? 'Reapprove' : 'Approve'}
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