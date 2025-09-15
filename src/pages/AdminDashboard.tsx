import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Shield, CheckCircle, XCircle, Clock, MapPin, Phone, Mail } from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  city: string | null;
  address: string | null;
  role: string;
  is_verified: boolean;
  verification_status: 'pending' | 'verified' | 'rejected' | null;
  background_check_verified: boolean;
  created_at: string;
  avatar_url: string | null;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    fetchPendingSitters();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      setIsAdmin(data?.role === 'admin');
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const fetchPendingSitters = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
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

  const updateVerificationStatus = async (profileId: string, isVerified: boolean, verificationStatus: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_verified: isVerified, 
          verification_status: verificationStatus as 'pending' | 'verified' | 'rejected' 
        })
        .eq('id', profileId);

      if (error) throw error;

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

  const pendingSitters = profiles.filter(p => p.verification_status === 'pending');
  const approvedSitters = profiles.filter(p => p.is_verified);
  const rejectedSitters = profiles.filter(p => p.verification_status === 'rejected');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage pet sitter applications and verifications</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
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
        </TabsList>

        <TabsContent value="pending">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingSitters.map((profile) => (
              <SitterCard 
                key={profile.id} 
                profile={profile} 
                onApprove={() => updateVerificationStatus(profile.id, true, 'approved')}
                onReject={() => updateVerificationStatus(profile.id, false, 'rejected')}
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
                onApprove={() => updateVerificationStatus(profile.id, true, 'approved')}
                showActions={true}
                isRejected={true}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface SitterCardProps {
  profile: Profile;
  onApprove?: () => void;
  onReject?: () => void;
  showActions: boolean;
  isRejected?: boolean;
}

function SitterCard({ profile, onApprove, onReject, showActions, isRejected }: SitterCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile.avatar_url || ''} alt={profile.first_name} />
              <AvatarFallback>{profile.first_name[0]}{profile.last_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{profile.first_name} {profile.last_name}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-3 h-3 mr-1" />
                {profile.city || 'Location not provided'}
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
            <Mail className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-gray-600">{profile.email}</span>
          </div>
          
          {profile.phone && (
            <div className="flex items-center text-sm">
              <Phone className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-gray-600">{profile.phone}</span>
            </div>
          )}
          
          {profile.address && (
            <div className="flex items-center text-sm">
              <MapPin className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-gray-600 line-clamp-2">{profile.address}</span>
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500">
          Applied: {new Date(profile.created_at).toLocaleDateString()}
        </div>
        
        {showActions && (
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