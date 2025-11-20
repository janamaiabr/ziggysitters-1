import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Shield, ArrowLeft, MapPin, Phone, Mail, Calendar, FileText, CheckCircle, XCircle, User, Star, CreditCard, Send, StickyNote, Award, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

type UserProfile = {
  id: string;
  user_id: string;
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
  stripe_account_id?: string | null;
  stripe_account_enabled?: boolean;
  stripe_onboarding_completed?: boolean;
  onboarding_completed?: boolean;
  admin_notes?: string | null;
  golden_badge_approved?: boolean | null;
  golden_badge_approved_at?: string | null;
  golden_badge_approved_by?: string | null;
}

export default function AdminUserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pets, setPets] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [idDocUrl, setIdDocUrl] = useState<string | null>(null);
  const [blueCardUrl, setBlueCardUrl] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin && id) {
      fetchUserProfile();
    }
  }, [isAdmin, id]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data?.role !== 'admin') {
        navigate('/');
        return;
      }
      setIsAdmin(true);
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/');
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast({
          title: "User not found",
          description: "The requested user profile could not be found.",
          variant: "destructive"
        });
        navigate('/admin-dashboard');
        return;
      }

      setProfile(data);
      setAdminNotes(data.admin_notes || '');

      // Clear or set signed URLs for documents
      if (data.id_document_url) {
        // Extract filename from the full URL path
        const fileName = data.id_document_url.includes('/verification-docs/')
          ? data.id_document_url.split('/verification-docs/')[1].split('?')[0]
          : data.id_document_url.split('/').pop()?.split('?')[0];
        
        if (fileName) {
          const { data: signedData, error: signError } = await supabase.storage
            .from('verification-docs')
            .createSignedUrl(fileName, 3600);
          if (signedData && !signError) {
            setIdDocUrl(signedData.signedUrl);
          } else {
            console.error('Error creating signed URL for ID doc:', signError);
            setIdDocUrl(null);
          }
        }
      } else {
        // Clear state if no document URL exists
        setIdDocUrl(null);
      }

      if (data.blue_card_document_url) {
        // Extract filename from the full URL path
        const fileName = data.blue_card_document_url.includes('/verification-docs/')
          ? data.blue_card_document_url.split('/verification-docs/')[1].split('?')[0]
          : data.blue_card_document_url.split('/').pop()?.split('?')[0];
        
        if (fileName) {
          const { data: signedData, error: signError } = await supabase.storage
            .from('verification-docs')
            .createSignedUrl(fileName, 3600);
          if (signedData && !signError) {
            setBlueCardUrl(signedData.signedUrl);
          } else {
            console.error('Error creating signed URL for police vet doc:', signError);
            setBlueCardUrl(null);
          }
        }
      } else {
        // Clear state if no document URL exists
        setBlueCardUrl(null);
      }

      // Fetch additional data based on role
      if (data.role === 'pet_owner') {
        fetchPets(data.id);
      } else if (data.role === 'pet_sitter') {
        fetchSitterServices(data.id);
      }
      
      fetchBookings(data.id);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPets = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', profileId);

      if (!error && data) {
        setPets(data);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
    }
  };

  const fetchSitterServices = async (profileId: string) => {
    try {
      console.log('Fetching services for sitter:', profileId);
      const { data, error } = await supabase
        .from('sitter_services')
        .select('*')
        .eq('sitter_id', profileId);

      console.log('Services data:', data, 'Error:', error);
      
      if (!error && data) {
        setServices(data);
      } else if (error) {
        console.error('Supabase error fetching services:', error);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchBookings = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .or(`owner_id.eq.${profileId},sitter_id.eq.${profileId}`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const sendOnboardingReminder = async () => {
    if (!profile) return;

    try {
      const onboardingUrl = `${window.location.origin}/onboarding`;
      
      const { error } = await supabase.functions.invoke('send-onboarding-reminder', {
        body: {
          sitterEmail: profile.email,
          sitterName: profile.first_name,
          onboardingUrl: onboardingUrl
        }
      });

      if (error) throw error;

      toast({
        title: "Reminder Sent!",
        description: `Onboarding reminder email sent to ${profile.email}`,
      });
    } catch (error) {
      console.error('Error sending onboarding reminder:', error);
      toast({
        title: "Error",
        description: "Failed to send onboarding reminder",
        variant: "destructive"
      });
    }
  };

  const sendDocumentReminder = async () => {
    if (!profile) return;

    try {
      const { error } = await supabase.functions.invoke('send-document-upload-reminder', {
        body: {
          sitterEmail: profile.email,
          sitterName: profile.first_name
        }
      });

      if (error) throw error;

      toast({
        title: "Document Reminder Sent!",
        description: `Document upload reminder sent to ${profile.email}`,
      });
    } catch (error) {
      console.error('Error sending document reminder:', error);
      toast({
        title: "Error",
        description: "Failed to send document reminder",
        variant: "destructive"
      });
    }
  };

  const handleSaveAdminNotes = async () => {
    if (!profile) return;

    setIsSavingNotes(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ admin_notes: adminNotes.trim() || null })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin notes saved successfully",
      });

      // Update local profile state
      setProfile({ ...profile, admin_notes: adminNotes.trim() || null });
    } catch (error) {
      console.error('Error saving admin notes:', error);
      toast({
        title: "Error",
        description: "Failed to save admin notes",
        variant: "destructive"
      });
    } finally {
      setIsSavingNotes(false);
    }
  };

  const updateDocumentVerification = async (isVerified: boolean, verificationStatus: 'pending' | 'verified' | 'rejected') => {
    if (!profile) return;

    try {
      // Update document verification status (separate from golden badge)
      const { error } = await supabase.rpc('update_verification_status', {
        profile_id: profile.id,
        is_verified: isVerified,
        verification_status: verificationStatus
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${isVerified ? 'approved' : 'rejected'} successfully`,
      });

      // Refresh profile to show updated status
      fetchUserProfile();

      // Handle background tasks asynchronously (don't block UI)
      if (isVerified && verificationStatus === 'verified') {
        // Delete verification documents in background
        (async () => {
          try {
            const filesToDelete: string[] = [];
            
            if (profile.id_document_url) {
              const fileName = profile.id_document_url.includes('/verification-docs/')
                ? profile.id_document_url.split('/verification-docs/')[1].split('?')[0]
                : profile.id_document_url.split('/').pop()?.split('?')[0];
              if (fileName) filesToDelete.push(fileName);
            }
            
            if (profile.blue_card_document_url) {
              const fileName = profile.blue_card_document_url.includes('/verification-docs/')
                ? profile.blue_card_document_url.split('/verification-docs/')[1].split('?')[0]
                : profile.blue_card_document_url.split('/').pop()?.split('?')[0];
              if (fileName) filesToDelete.push(fileName);
            }

            if (filesToDelete.length > 0) {
              await supabase.storage.from('verification-docs').remove(filesToDelete);
              
              // Clear document URLs from profile BUT KEEP the uploaded_at timestamp
              await supabase
                .from('profiles')
                .update({ 
                  id_document_url: null,
                  blue_card_document_url: null
                  // NOTE: verification_documents_uploaded_at is intentionally NOT cleared
                  // so we have a record of when documents were submitted
                })
                .eq('id', profile.id);
              
              // Refresh again after document deletion completes
              fetchUserProfile();
            }
          } catch (deleteError) {
            console.error('Error deleting verification documents:', deleteError);
          }
        })();
      }

      // Send verification email in background (non-blocking)
      supabase.functions.invoke('send-verification-update', {
        body: {
          user_email: profile.email,
          user_name: `${profile.first_name} ${profile.last_name}`,
          verification_status: verificationStatus,
          rejection_reason: verificationStatus === 'rejected' ? 'Please review your profile and documents for completeness and accuracy.' : undefined
        }
      }).catch(emailError => {
        console.error('Error sending verification email:', emailError);
      });

    } catch (error) {
      console.error('Error updating verification:', error);
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive"
      });
    }
  };

  const handleGoldenBadgeUpdate = async (approve: boolean) => {
    if (!profile) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('profiles')
        .update({
          golden_badge_approved: approve,
          golden_badge_approved_at: approve ? new Date().toISOString() : null,
          golden_badge_approved_by: approve ? user?.id : null
        })
        .eq('id', profile.id);

      if (error) throw error;

      if (approve) {
        // Send congratulations email
        await supabase.functions.invoke('send-golden-badge-congratulations', {
          body: { sitterId: profile.id }
        });
      }

      toast({
        title: "Success",
        description: approve ? 'Golden Badge granted successfully!' : 'Golden Badge revoked',
      });

      fetchUserProfile();
    } catch (error: any) {
      console.error('Error updating golden badge:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to update golden badge status',
        variant: "destructive"
      });
    }
  };

  const handleSendCustomEmail = async () => {
    if (!profile || !emailSubject.trim() || !emailMessage.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both subject and message",
        variant: "destructive"
      });
      return;
    }

    setSendingEmail(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', user?.id)
        .single();

      const { error } = await supabase.functions.invoke('send-admin-custom-email', {
        body: {
          recipient_email: profile.email,
          recipient_name: profile.first_name,
          subject: emailSubject,
          message: emailMessage,
          admin_name: adminProfile ? `${adminProfile.first_name} ${adminProfile.last_name}` : 'Admin'
        }
      });

      if (error) throw error;

      toast({
        title: "Email Sent!",
        description: `Custom email sent to ${profile.email}`,
      });

      setShowEmailDialog(false);
      setEmailSubject('');
      setEmailMessage('');
    } catch (error) {
      console.error('Error sending custom email:', error);
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive"
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const openEmailDialog = (template?: { subject: string; message: string }) => {
    if (template) {
      setEmailSubject(template.subject);
      setEmailMessage(template.message);
    } else {
      setEmailSubject('');
      setEmailMessage('');
    }
    setShowEmailDialog(true);
  };

  if (loading || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">User Not Found</h2>
          <Button onClick={() => navigate('/admin-dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const getServiceTypeName = (type: string) => {
    switch (type) {
      case 'dog_walking': return 'Dog Walking';
      case 'pet_sitting_owners_home': return 'Pet Sitting (Owner\'s Home)';
      case 'pet_sitting_sitters_home': return 'Pet Sitting (Sitter\'s Home)';
      case 'overnight_boarding': return 'Overnight Boarding';
      case 'dog_daycare': return 'Dog Daycare';
      default: return type;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="outline" 
        onClick={() => navigate('/admin-dashboard')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start gap-6">
          <Avatar className="h-24 w-24 flex-shrink-0">
            <AvatarImage src={profile.avatar_url || ''} alt={profile.first_name} />
            <AvatarFallback>{profile.first_name?.[0]}{profile.last_name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{profile.first_name} {profile.last_name}</h1>
              <Badge variant={
                profile.role === 'admin' ? 'default' : 
                profile.role === 'pet_sitter' ? 'secondary' : 
                'outline'
              }>
                {profile.role === 'pet_owner' ? 'Pet Owner' : 
                 profile.role === 'pet_sitter' ? 'Pet Sitter' : 
                 'Admin'}
              </Badge>
              {profile.role === 'pet_sitter' && (
                <Badge variant={
                  profile.is_verified ? 'default' : 
                  profile.verification_status === 'rejected' ? 'destructive' : 
                  'secondary'
                }>
                  {profile.is_verified ? 'Verified' : profile.verification_status || 'Pending'}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-muted-foreground mb-4">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {profile.suburb && profile.city ? `${profile.suburb}, ${profile.city}` : profile.city || 'Location not set'}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Joined {new Date(profile.created_at).toLocaleDateString()}
              </div>
            </div>
            
            {/* Action Buttons for Sitters */}
            {profile.role === 'pet_sitter' && (
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant="outline"
                  onClick={() => openEmailDialog()}
                  className="flex items-center"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                {profile.verification_status !== 'verified' && (
                  <>
                    <Button 
                      onClick={() => updateDocumentVerification(true, 'verified')}
                      className="flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify Documents
                    </Button>
                    {profile.verification_status !== 'rejected' && (
                      <Button 
                        variant="destructive"
                        onClick={() => updateDocumentVerification(false, 'rejected')}
                        className="flex items-center"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Documents
                      </Button>
                    )}
                  </>
                )}
                {!profile.onboarding_completed && (
                  <Button 
                    variant="outline"
                    onClick={sendOnboardingReminder}
                    className="flex items-center"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Onboarding Reminder
                  </Button>
                )}
              </div>
            )}
            {/* Action Buttons for Pet Owners */}
            {profile.role === 'pet_owner' && (
              <Button 
                variant="outline"
                onClick={() => openEmailDialog()}
                className="flex items-center"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {profile.role === 'pet_sitter' && <TabsTrigger value="services">Services</TabsTrigger>}
          {profile.role === 'pet_owner' && <TabsTrigger value="pets">Pets</TabsTrigger>}
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          {profile.role === 'pet_sitter' && <TabsTrigger value="verification">Verification</TabsTrigger>}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="mr-2 h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{profile.email}</p>
                </div>
                {profile.phone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-sm">{profile.phone}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <p className="text-sm">
                    {profile.address ? `${profile.address}, ` : ''}
                    {profile.suburb ? `${profile.suburb}, ` : ''}
                    {profile.city || 'Not provided'}
                    {profile.postal_code ? ` ${profile.postal_code}` : ''}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Profile Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="mr-2 h-5 w-5" />
                  Profile Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.role === 'pet_sitter' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Rating</label>
                      <p className="text-sm">{profile.rating ? `${profile.rating}/5 stars` : 'No ratings yet'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Total Reviews</label>
                      <p className="text-sm">{profile.total_reviews || 0}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Background Check</label>
                      <p className="text-sm">{profile.background_check_verified ? 'Completed' : 'Not completed'}</p>
                    </div>
                  </>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Bookings</label>
                  <p className="text-sm">{bookings.length}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Onboarding Status</label>
                  <p className="text-sm">{profile.onboarding_completed ? 'Completed' : 'Incomplete'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bio */}
          {profile.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{profile.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Stripe Info for Sitters */}
          {profile.role === 'pet_sitter' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Stripe Account</label>
                  <p className="text-sm">{profile.stripe_account_id || 'Not connected'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account Enabled</label>
                  <p className="text-sm">{profile.stripe_account_enabled ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Onboarding Completed</label>
                  <p className="text-sm">{profile.stripe_onboarding_completed ? 'Yes' : 'No'}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Services Tab (Sitters only) */}
        {profile.role === 'pet_sitter' && (
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
              </CardHeader>
              <CardContent>
                {services.length > 0 ? (
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div key={service.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{getServiceTypeName(service.service_type)}</h3>
                          <Badge variant={service.is_offered ? 'default' : 'secondary'}>
                            {service.is_offered ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        {service.description && (
                          <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                        )}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {service.hourly_rate && (
                            <div>
                              <span className="text-muted-foreground">Hourly: </span>
                              <span className="font-medium">${service.hourly_rate}</span>
                            </div>
                          )}
                          {service.daily_rate && (
                            <div>
                              <span className="text-muted-foreground">Daily: </span>
                              <span className="font-medium">${service.daily_rate}</span>
                            </div>
                          )}
                          {service.overnight_rate && (
                            <div>
                              <span className="text-muted-foreground">Overnight: </span>
                              <span className="font-medium">${service.overnight_rate}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-muted-foreground">Max Pets: </span>
                            <span className="font-medium">{service.max_pets}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Experience: </span>
                            <span className="font-medium">{service.experience_years} years</span>
                          </div>
                          {service.accepted_pet_species && service.accepted_pet_species.length > 0 && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Accepts: </span>
                              <span className="font-medium">{service.accepted_pet_species.join(', ')}</span>
                            </div>
                          )}
                          {service.accepted_pet_sizes && service.accepted_pet_sizes.length > 0 && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Pet Sizes: </span>
                              <span className="font-medium">{service.accepted_pet_sizes.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-muted-foreground">No services configured yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Sitter needs to complete onboarding</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Pets Tab (Owners only) */}
        {profile.role === 'pet_owner' && (
          <TabsContent value="pets">
            <Card>
              <CardHeader>
                <CardTitle>Registered Pets</CardTitle>
              </CardHeader>
              <CardContent>
                {pets.length > 0 ? (
                  <div className="grid gap-4">
                    {pets.map((pet) => (
                      <div key={pet.id} className="p-4 border rounded-lg">
                        <div className="flex items-start gap-4">
                          {pet.photo_urls && pet.photo_urls[0] && (
                            <img 
                              src={pet.photo_urls[0]} 
                              alt={pet.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold">{pet.name}</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                              <div>
                                <span className="text-muted-foreground">Species: </span>
                                <span>{pet.species}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Breed: </span>
                                <span>{pet.breed || 'Not specified'}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Age: </span>
                                <span>{pet.age} years</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Size: </span>
                                <span>{pet.size}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No pets registered</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Bookings Tab */}
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Booking History</CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{booking.booking_reference}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={
                          booking.status === 'confirmed' ? 'default' :
                          booking.status === 'completed' ? 'secondary' :
                          booking.status === 'cancelled' ? 'destructive' :
                          'outline'
                        }>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Service: </span>
                        <span>{getServiceTypeName(booking.service_type)}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Total: </span>
                        <span className="font-medium">${booking.total_amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No bookings yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verification Tab (Sitters only) */}
        {profile.role === 'pet_sitter' && (
          <TabsContent value="verification" className="space-y-6">
            {/* ID Verification Card */}
            <Card>
              <CardHeader>
                <CardTitle>ID Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h3 className="font-semibold mb-1">Verification Status</h3>
                    <Badge variant={profile.is_verified ? "default" : "secondary"}>
                      {profile.verification_status || 'Pending'}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => openEmailDialog({
                        subject: 'Document Verification Required',
                        message: `Hi ${profile.first_name},\n\nWe've reviewed your submitted ID document and need some additional information:\n\n[Please specify what's needed - e.g., clearer photo, different angle, matching name, etc.]\n\nOnce you've uploaded the updated document, please let us know and we'll review it promptly.\n\nThank you for your understanding!`
                      })}
                      variant="outline"
                      size="sm"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Request New Document
                    </Button>
                    <Button
                      onClick={() => updateDocumentVerification(true, 'verified')}
                      variant="default"
                      size="sm"
                      disabled={profile.verification_status === 'verified'}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve ID
                    </Button>
                    <Button
                      onClick={() => updateDocumentVerification(false, 'rejected')}
                      variant="destructive"
                      size="sm"
                      disabled={profile.verification_status === 'rejected'}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject ID
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    ID Document <Badge variant="destructive" className="ml-2">Required</Badge>
                  </label>
                    {idDocUrl ? (
                      <div className="space-y-2">
                        <a 
                          href={idDocUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View ID Document
                        </a>
                        <p className="text-xs text-muted-foreground">This link is valid for 1 hour</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not uploaded</p>
                    )}
                  </div>
                  
                  {profile.verification_documents_uploaded_at && (
                    <>
                      <Separator />
                      <p className="text-xs text-muted-foreground">
                        Documents uploaded on: {new Date(profile.verification_documents_uploaded_at).toLocaleString()}
                      </p>
                    </>
                  )}
                  
                  <Separator />
                  
                  {/* Admin Notes Section */}
                  <div className="space-y-3 bg-muted/50 p-4 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <StickyNote className="h-5 w-5 text-primary" />
                      <Label htmlFor="admin-notes" className="text-base font-semibold">
                        Admin Notes (Confidential)
                      </Label>
                    </div>
                    <Textarea
                      id="admin-notes"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="E.g., ID shows maiden name 'Carroll' - married name is 'Akroyd'. License: CC632208, DOB: 28-12-1983. Verified identity matches."
                      className="min-h-[120px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      These notes are only visible to admins and are used for internal verification purposes.
                    </p>
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleSaveAdminNotes}
                        disabled={isSavingNotes}
                        size="sm"
                      >
                      {isSavingNotes ? 'Saving...' : 'Save Notes'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Golden Badge Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Golden Badge Approval</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Grant after verifying NZ Police Vetting Service Check
                    </p>
                  </div>
                  {!blueCardUrl && (
                    <Button 
                      onClick={sendDocumentReminder}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Request Police Vet
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">Badge Status</h3>
                      {profile.golden_badge_approved && (
                        <Badge className="bg-yellow-500 hover:bg-yellow-600">
                          <Star className="h-3 w-3 mr-1 fill-white" />
                          Golden Badge
                        </Badge>
                      )}
                      {!profile.golden_badge_approved && !blueCardUrl && (
                        <Badge variant="outline" className="text-amber-600 border-amber-600">
                          Awaiting Police Vet
                        </Badge>
                      )}
                    </div>
                    {profile.golden_badge_approved && profile.golden_badge_approved_at && (
                      <p className="text-sm text-muted-foreground">
                        Granted on {new Date(profile.golden_badge_approved_at).toLocaleDateString()}
                      </p>
                    )}
                    {!profile.golden_badge_approved && !blueCardUrl && (
                      <p className="text-sm text-amber-600">
                        Police vet document required before approval
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!profile.golden_badge_approved ? (
                      <Button
                        onClick={() => handleGoldenBadgeUpdate(true)}
                        variant="default"
                        size="sm"
                        disabled={!blueCardUrl}
                        className="bg-yellow-500 hover:bg-yellow-600"
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Grant Golden Badge
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleGoldenBadgeUpdate(false)}
                        variant="outline"
                        size="sm"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Revoke Badge
                      </Button>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    NZ Police Vetting Service Check <Badge variant="secondary" className="ml-2 bg-yellow-500">Required for Golden Badge</Badge>
                  </label>
                  {blueCardUrl ? (
                    <div className="space-y-2">
                      <a 
                        href={blueCardUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Police Vet Document
                      </a>
                      <p className="text-xs text-muted-foreground">This link is valid for 1 hour</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not uploaded</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Custom Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Email to {profile.first_name} {profile.last_name}</DialogTitle>
            <DialogDescription>
              Compose a custom email to this user. The email will be sent from the ZiggySitters admin team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="e.g., Document Verification Required"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email-message">Message</Label>
              <Textarea
                id="email-message"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Type your message here..."
                className="mt-1 min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This will be sent to: {profile.email}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendCustomEmail} disabled={sendingEmail}>
              <Send className="h-4 w-4 mr-2" />
              {sendingEmail ? 'Sending...' : 'Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
