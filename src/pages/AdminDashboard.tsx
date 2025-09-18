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

// Use the safe public sitter profiles type that doesn't expose sensitive data
type PublicSitterProfile = {
  id: string | null;
  display_name: string | null;
  role: 'pet_owner' | 'pet_sitter' | 'both' | 'admin' | null;
  suburb: string | null;
  city: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_verified: boolean | null;
  rating: number | null;
  total_reviews: number | null;
  
  background_check_verified: boolean | null;
  verification_status: 'pending' | 'verified' | 'rejected' | null;
  created_at: string | null;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<PublicSitterProfile[]>([]);
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
      // Use the safe public view that doesn't expose sensitive data
      const { data, error } = await supabase
        .from('public_sitter_profiles')
        .select('*')
        .neq('role', 'admin')
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
      // Admin function - this requires special admin privileges to update the profiles table
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
                onApprove={() => profile.id && updateVerificationStatus(profile.id, true, 'approved')}
                onReject={() => profile.id && updateVerificationStatus(profile.id, false, 'rejected')}
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
                onApprove={() => profile.id && updateVerificationStatus(profile.id, true, 'approved')}
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
  profile: PublicSitterProfile;
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
              <AvatarImage src={profile.avatar_url || ''} alt={profile.display_name || 'User'} />
              <AvatarFallback>{profile.display_name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{profile.display_name || 'Unknown User'}</CardTitle>
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