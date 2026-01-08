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
import { Shield, CheckCircle, XCircle, FileText, Star, ExternalLink, ArrowLeft } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import SitterVerificationBadge from '@/components/sitter/SitterVerificationBadge';

type SitterProfile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  suburb: string | null;
  city: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_verified: boolean | null;
  verification_status: 'pending' | 'verified' | 'rejected' | null;
  id_document_url?: string | null;
  blue_card_document_url?: string | null;
  verification_documents_uploaded_at?: string | null;
  golden_badge_approved?: boolean | null;
  golden_badge_approved_at?: string | null;
  created_at: string;
}

export default function AdminDocumentReview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sitters, setSitters] = useState<SitterProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    initializePage();
  }, [user]);

  const initializePage = async () => {
    await checkAdminStatus();
    await fetchSitters();
  };

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      const adminStatus = !!data;
      setIsAdmin(adminStatus);
      
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
      navigate('/');
    }
  };

  const fetchSitters = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'pet_sitter')
        .order('verification_documents_uploaded_at', { ascending: false, nullsFirst: false });

      if (error) throw error;
      setSitters(data || []);
    } catch (error) {
      console.error('Error fetching sitters:', error);
      toast({
        title: "Error",
        description: "Failed to load sitters",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveID = async (sitter: SitterProfile) => {
    try {
      const { error } = await supabase.rpc('update_verification_status', {
        profile_id: sitter.id,
        is_verified: true,
        verification_status: 'verified'
      });

      if (error) throw error;

      // Send email notification
      await supabase.functions.invoke('send-verification-update', {
        body: {
          user_email: sitter.email,
          user_name: `${sitter.first_name} ${sitter.last_name}`,
          verification_status: 'verified',
          // Pass sitter info for new sitter notification
          sitter_id: sitter.id,
          suburb: sitter.suburb,
          city: sitter.city
        }
      });

      toast({
        title: "ID Approved",
        description: `${sitter.first_name} is now ID verified`,
      });

      fetchSitters();
    } catch (error) {
      console.error('Error approving ID:', error);
      toast({
        title: "Error",
        description: "Failed to approve ID",
        variant: "destructive"
      });
    }
  };

  const handleApproveGoldBadge = async (sitter: SitterProfile) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          golden_badge_approved: true,
          golden_badge_approved_at: new Date().toISOString(),
          golden_badge_approved_by: user?.id
        })
        .eq('id', sitter.id);

      if (error) throw error;

      // Send congratulations email
      await supabase.functions.invoke('send-golden-badge-congratulations', {
        body: { sitterId: sitter.id }
      });

      toast({
        title: "Gold Star Badge Awarded! ⭐",
        description: `${sitter.first_name} now has the gold star badge and has been notified by email`,
      });

      fetchSitters();
    } catch (error) {
      console.error('Error approving gold badge:', error);
      toast({
        title: "Error",
        description: "Failed to award gold star badge",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (sitter: SitterProfile, documentType: 'id' | 'vet') => {
    try {
      const updateData: any = {};
      
      if (documentType === 'id') {
        updateData.is_verified = false;
        updateData.verification_status = 'rejected';
        // Clear the document URL so they don't keep appearing in the review queue
        updateData.id_document_url = null;
        updateData.id_document_urls = [];
      } else {
        updateData.golden_badge_approved = false;
        updateData.blue_card_document_url = null;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', sitter.id);

      if (error) throw error;

      if (documentType === 'id') {
        await supabase.functions.invoke('send-verification-update', {
          body: {
            user_email: sitter.email,
            user_name: `${sitter.first_name} ${sitter.last_name}`,
            verification_status: 'rejected',
            rejection_reason: 'Document verification failed. Please resubmit valid documents.'
          }
        });
      }

      toast({
        title: documentType === 'id' ? "ID Rejected" : "Vet Check Rejected",
        description: `Documents rejected for ${sitter.first_name}`,
      });

      fetchSitters();
    } catch (error) {
      console.error('Error rejecting documents:', error);
      toast({
        title: "Error",
        description: "Failed to reject documents",
        variant: "destructive"
      });
    }
  };

  if (!isAdmin || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // Only show sitters with pending status who have uploaded documents (exclude manual verifications)
  const pendingIDApprovals = sitters.filter(s => 
    s.id_document_url && 
    s.id_document_url !== '' &&
    s.id_document_url !== 'MANUALLY_VERIFIED_BY_ADMIN' &&
    !s.is_verified && 
    s.verification_status !== 'rejected'
  );
  const pendingGoldBadge = sitters.filter(s => s.blue_card_document_url && s.is_verified && !s.golden_badge_approved);
  const approved = sitters.filter(s => s.is_verified);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/admin')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold mb-2">Document Review Center</h1>
          <p className="text-gray-600">Review and approve sitter verification documents</p>
        </div>
      </div>

      <Tabs defaultValue="pending-id" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending-id" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            ID Review ({pendingIDApprovals.length})
          </TabsTrigger>
          <TabsTrigger value="pending-gold" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Gold Badge Review ({pendingGoldBadge.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved ({approved.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending-id">
          <Card>
            <CardHeader>
              <CardTitle>ID Verification Pending</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingIDApprovals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pending ID verifications</p>
              ) : (
                <div className="space-y-4">
                  {pendingIDApprovals.map((sitter) => (
                    <Card key={sitter.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={sitter.avatar_url || ''} alt={sitter.first_name} />
                            <AvatarFallback>{sitter.first_name?.[0]}{sitter.last_name?.[0]}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-semibold">{sitter.first_name} {sitter.last_name}</h3>
                                <p className="text-sm text-muted-foreground">{sitter.email}</p>
                                <p className="text-sm text-muted-foreground">{sitter.suburb}, {sitter.city}</p>
                              </div>
                              <SitterVerificationBadge isVerified={false} hasGoldenBadge={false} />
                            </div>
                            
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                ID Documents Submitted
                              </h4>
                              {sitter.id_document_url && (
                                <a 
                                  href={sitter.id_document_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline text-sm flex items-center gap-2"
                                >
                                  View ID Document <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                              <p className="text-xs text-muted-foreground mt-2">
                                Submitted: {sitter.verification_documents_uploaded_at ? new Date(sitter.verification_documents_uploaded_at).toLocaleString() : 'Unknown'}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="default">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve ID
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Approve ID Verification?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will mark {sitter.first_name} {sitter.last_name} as ID verified and send them a confirmation email.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleApproveID(sitter)}>
                                      Approve
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Reject ID Documents?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will reject the ID documents and notify {sitter.first_name} to resubmit.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleReject(sitter, 'id')} className="bg-destructive">
                                      Reject
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              <Button size="sm" variant="outline" onClick={() => navigate(`/admin/user/${sitter.id}`)}>
                                View Full Profile
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending-gold">
          <Card>
            <CardHeader>
              <CardTitle>Gold Star Badge Review</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingGoldBadge.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pending gold badge reviews</p>
              ) : (
                <div className="space-y-4">
                  {pendingGoldBadge.map((sitter) => (
                    <Card key={sitter.id} className="overflow-hidden border-2 border-yellow-200">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={sitter.avatar_url || ''} alt={sitter.first_name} />
                            <AvatarFallback>{sitter.first_name?.[0]}{sitter.last_name?.[0]}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                  {sitter.first_name} {sitter.last_name}
                                  <Star className="h-5 w-5 text-yellow-500" />
                                </h3>
                                <p className="text-sm text-muted-foreground">{sitter.email}</p>
                                <p className="text-sm text-muted-foreground">{sitter.suburb}, {sitter.city}</p>
                              </div>
                              <SitterVerificationBadge isVerified={sitter.is_verified || false} hasGoldenBadge={false} />
                            </div>
                            
                            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-4">
                              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-600" />
                                Police Vet Check Submitted
                              </h4>
                              {sitter.blue_card_document_url && (
                                <a 
                                  href={sitter.blue_card_document_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline text-sm flex items-center gap-2"
                                >
                                  View Police Vet Document <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600">
                                    <Star className="h-4 w-4 mr-2 fill-current" />
                                    Award Gold Star
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Award Gold Star Badge? ⭐</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will award {sitter.first_name} {sitter.last_name} the prestigious Gold Star badge for completing police vet check verification.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleApproveGoldBadge(sitter)}>
                                      Award Badge
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Reject Police Vet Check?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will reject the police vet check document.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleReject(sitter, 'vet')} className="bg-destructive">
                                      Reject
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              <Button size="sm" variant="outline" onClick={() => navigate(`/admin/user/${sitter.id}`)}>
                                View Full Profile
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved Sitters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {approved.map((sitter) => (
                  <div key={sitter.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={sitter.avatar_url || ''} alt={sitter.first_name} />
                        <AvatarFallback>{sitter.first_name?.[0]}{sitter.last_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{sitter.first_name} {sitter.last_name}</p>
                        <p className="text-sm text-muted-foreground">{sitter.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <SitterVerificationBadge 
                        isVerified={sitter.is_verified || false}
                        hasGoldenBadge={sitter.golden_badge_approved || false}
                      />
                      <Button size="sm" variant="outline" onClick={() => navigate(`/admin/user/${sitter.id}`)}>
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
