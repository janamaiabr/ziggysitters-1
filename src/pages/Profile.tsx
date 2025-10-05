import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Calendar, MapPin, Phone, Mail, Edit3, Save, X, Camera, DollarSign, Users, Briefcase, Shield, CameraIcon, Upload, Plus, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import AvailabilityCalendar from '@/components/calendar/AvailabilityCalendar';
import PetsManagement from '@/components/PetsManagement';
import SitterDailyReports from '@/components/SitterDailyReports';
import ClientDailyReports from '@/components/ClientDailyReports';

export default function Profile() {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [recentBookings, setRecentBookings] = useState([]);
  const [sitterServices, setSitterServices] = useState([]);
  const [userPets, setUserPets] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [portfolioPhotos, setPortfolioPhotos] = useState([]);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [serviceEditData, setServiceEditData] = useState<any>({});

  useEffect(() => {
    if (profile) {
      fetchBookings();
      if (profile.role === 'pet_sitter') {
        fetchSitterServices();
        fetchPortfolioPhotos();
      }
      if (profile.role === 'pet_owner') {
        fetchUserPets();
      }
      setEditData({
        first_name: profile.first_name,
        last_name: profile.last_name,
        bio: profile.bio || '',
        phone: profile.phone || '',
        suburb: profile.suburb || '',
        city: profile.city || '',
        address: profile.address || '',
        email: profile.email || ''
      });
    }
  }, [profile]);

  const fetchBookings = async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id, service_type, start_date, end_date, total_amount, status,
          pet_ids
        `)
        .or(`owner_id.eq.${profile.id},sitter_id.eq.${profile.id}`)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setRecentBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchSitterServices = async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from('sitter_services')
        .select('*')
        .eq('sitter_id', profile.id);

      if (!error && data) {
        setSitterServices(data);
      }
    } catch (error) {
      console.error('Error fetching sitter services:', error);
    }
  };

  const fetchUserPets = async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', profile.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setUserPets(data);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
    }
  };

  const fetchPortfolioPhotos = async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .list(`${profile.user_id}/portfolio`, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (!error && data) {
        const photos = await Promise.all(
          data.map(async (file) => {
            const { data: { publicUrl } } = supabase.storage
              .from('profile-photos')
              .getPublicUrl(`${profile.user_id}/portfolio/${file.name}`);
            return publicUrl;
          })
        );
        setPortfolioPhotos(photos);
      }
    } catch (error) {
      console.error('Error fetching portfolio photos:', error);
    }
  };

  const uploadVerificationDocument = async (file: File, type: 'id' | 'blue_card') => {
    if (!user || !profile) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_document_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('verification-docs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('verification-docs')
        .getPublicUrl(filePath);

      // Update profile with document URL
      const updateField = type === 'id' ? 'id_document_url' : 'blue_card_document_url';
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          [updateField]: publicUrl,
          verification_documents_uploaded_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Send verification request email when documents are uploaded
      try {
        await supabase.functions.invoke('send-verification-request-email', {
          body: {
            user_name: `${profile.first_name} ${profile.last_name}`,
            user_email: profile.email,
            user_id: profile.id,
            documents_uploaded: true
          }
        });
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        // Don't fail the whole operation if email fails
      }

      toast({
        title: "Document uploaded successfully",
        description: `${type === 'id' ? 'ID' : 'Blue card'} document uploaded for verification.`,
      });

      // Refresh profile data
      window.location.reload();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    // Validate mandatory fields
    const requiredFields = {
      first_name: 'First Name',
      last_name: 'Last Name',
      email: 'Email',
      phone: 'Phone Number',
      address: 'Address'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!editData[field] || !editData[field].trim()) {
        toast({
          title: "Missing required field",
          description: `${label} is required and cannot be empty.`,
          variant: "destructive",
        });
        return;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(editData)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (!error) {
        setIsEditing(false);
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        });
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditService = (service: any) => {
    setEditingService(service.id);
    setServiceEditData({
      daily_rate: service.daily_rate,
      overnight_rate: service.overnight_rate,
      description: service.description,
      max_pets: service.max_pets,
      is_offered: service.is_offered
    });
  };

  const handleSaveService = async () => {
    if (!editingService || !profile) return;

    // Validate that at least one rate is provided and greater than 0
    const { daily_rate, overnight_rate } = serviceEditData;
    if ((!daily_rate || daily_rate <= 0) && (!overnight_rate || overnight_rate <= 0)) {
      toast({
        title: "Invalid rate",
        description: "Please enter a valid rate (greater than $0) for at least one pricing option.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('sitter_services')
        .update(serviceEditData)
        .eq('id', editingService)
        .eq('sitter_id', profile.id);

      if (!error) {
        setSitterServices(prev => 
          prev.map(service => 
            service.id === editingService 
              ? { ...service, ...serviceEditData }
              : service
          )
        );
        setEditingService(null);
        setServiceEditData({});
        toast({
          title: "Service updated",
          description: "Your service has been successfully updated.",
        });
      }
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: "Error",
        description: "Failed to update service. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getRateLabel = (serviceType: string) => {
    switch (serviceType) {
      case 'dog_walking': return 'Per Walk';
      case 'pet_sitting_owners_home': return 'Per Day / Per Night';
      case 'pet_sitting_sitters_home': return 'Per Day / Per Night';
      case 'dog_daycare': return 'Per Day';
      case 'overnight_boarding': return 'Per Night';
      default: return 'Rate';
    }
  };

  const getRateDisplay = (service: any) => {
    const rates = [];
    if (service.daily_rate) {
      rates.push(`$${service.daily_rate}/day`);
    }
    if (service.overnight_rate) {
      rates.push(`$${service.overnight_rate}/night`);
    }
    return rates.join(' • ') || 'Rate not set';
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${profile.user_id}/portfolio/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      toast({
        title: "Photo uploaded",
        description: "Your portfolio photo has been uploaded successfully.",
      });

      fetchPortfolioPhotos();
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProfilePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar.${fileExt}`;
      const filePath = `${profile.user_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user?.id);

      if (updateError) throw updateError;

      toast({
        title: "Profile photo updated",
        description: "Your profile photo has been updated successfully.",
      });

      window.location.reload();
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload profile photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Profile not found</h1>
          <p className="text-muted-foreground">Please complete your onboarding process.</p>
        </div>
      </div>
    );
  }

  const userProfile = {
    name: `${profile.first_name} ${profile.last_name}`,
    email: profile.email,
    phone: profile.phone || 'Not provided',
    bio: profile.bio || 'No bio provided yet.',
    location: `${profile.suburb || ''}, ${profile.city || 'Auckland'}`.replace(/^,\s*/, ''),
    avatar: profile.avatar_url,
    verified: profile.is_verified,
    rating: profile.rating || 0,
    bookings_completed: profile.total_reviews || 0,
    
    memberSince: format(new Date(profile.created_at), 'MMM yyyy'),
    completedBookings: recentBookings.length,
    hourlyRate: 0, // Removed hourly rates
    services: sitterServices.filter(s => s.is_offered).map(s => 
      s.service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    )
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={userProfile.avatar} 
                    alt={userProfile.name} 
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl">
                    {userProfile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoUpload}
                    className="hidden"
                    id="profile-photo-upload"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('profile-photo-upload')?.click()}
                    className="h-8 w-8 rounded-full p-0"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold">{userProfile.name}</h1>
                  {userProfile.verified && (
                    <Shield className="w-6 h-6 text-green-500" />
                  )}
                  {profile.role === 'pet_sitter' && (
                    <Badge 
                      variant={
                        profile.verification_status === 'verified' ? 'default' : 
                        profile.verification_status === 'rejected' ? 'destructive' : 
                        'secondary'
                      }
                      className="ml-2"
                    >
                      {profile.verification_status === 'verified' ? 'Verified Sitter' : 
                       profile.verification_status === 'rejected' ? 'Verification Rejected' : 
                       'Under Review'}
                    </Badge>
                  )}
                </div>
                
                {/* Verification Status Message for Sitters */}
                {profile.role === 'pet_sitter' && profile.verification_status !== 'verified' && (
                  <div className={`p-3 rounded-lg mb-3 ${
                    profile.verification_status === 'rejected' ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
                  }`}>
                    <p className={`text-sm ${
                      profile.verification_status === 'rejected' ? 'text-red-700' : 'text-blue-700'
                    }`}>
                      {profile.verification_status === 'rejected' 
                        ? '⚠️ Your profile verification was not approved. Please update your profile and resubmit for review.'
                        : profile.verification_documents_uploaded_at
                        ? '⏳ Your profile is under review. You will receive an email notification once the review is complete.'
                        : '📋 Complete your profile verification by uploading required documents below.'
                      }
                    </p>
                  </div>
                )}
                
                <div className="flex items-center text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  {userProfile.location}
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="text-muted-foreground">
                    {userProfile.completedBookings} bookings completed
                  </div>
                  <div className="text-muted-foreground">
                    Member since {userProfile.memberSince}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                {isEditing ? (
                  <div className="flex space-x-2">
                    <Button onClick={handleSaveProfile}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${profile.role === 'pet_owner' ? 'grid-cols-4' : 'grid-cols-6'}`}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {profile.role === 'pet_owner' && (
              <>
                <TabsTrigger value="pets">My Pets</TabsTrigger>
                <TabsTrigger value="client-reports">Daily Reports</TabsTrigger>
              </>
            )}
            {profile.role === 'pet_sitter' && (
              <>
                <TabsTrigger value="services">Services & Pricing</TabsTrigger>
                <TabsTrigger value="calendar">My Calendar</TabsTrigger>
                <TabsTrigger value="sitter-reports">Daily Reports</TabsTrigger>
              </>
            )}
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            {profile.role === 'pet_sitter' && (
              <TabsTrigger value="verification">Verification</TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* About */}
                <Card>
                  <CardHeader>
                    <CardTitle>About Me</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Textarea
                        value={editData.bio}
                        onChange={(e) => setEditData({...editData, bio: e.target.value})}
                        placeholder="Tell potential clients about yourself..."
                        rows={4}
                      />
                    ) : (
                      <p className="text-muted-foreground">{userProfile.bio}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>First Name</Label>
                            <Input
                              value={editData.first_name}
                              onChange={(e) => setEditData({...editData, first_name: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>Last Name</Label>
                            <Input
                              value={editData.last_name}
                              onChange={(e) => setEditData({...editData, last_name: e.target.value})}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            value={editData.email}
                            onChange={(e) => setEditData({...editData, email: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <Input
                            value={editData.phone}
                            onChange={(e) => setEditData({...editData, phone: e.target.value})}
                            placeholder="Enter your phone number"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Suburb</Label>
                            <Input
                              value={editData.suburb}
                              onChange={(e) => setEditData({...editData, suburb: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>City</Label>
                            <Input
                              value={editData.city}
                              onChange={(e) => setEditData({...editData, city: e.target.value})}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Address</Label>
                          <Input
                            value={editData.address}
                            onChange={(e) => setEditData({...editData, address: e.target.value})}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span>{userProfile.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span>{userProfile.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span>{userProfile.location}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentBookings.length > 0 ? (
                      <div className="space-y-3">
                        {recentBookings.map((booking: any) => (
                          <div key={booking.id} className="flex justify-between items-center p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{booking.service_type.replace(/_/g, ' ')}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d, yyyy')}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant={
                                booking.status === 'completed' ? 'default' :
                                booking.status === 'confirmed' ? 'secondary' :
                                'outline'
                              }>
                                {booking.status}
                              </Badge>
                              <p className="text-sm text-muted-foreground mt-1">${booking.total_amount}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No recent bookings</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Statistics */}
              <div className="space-y-6">
                {/* Stats Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {userProfile.bookings_completed > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rating:</span>
                        <span className="font-medium">{userProfile.rating}/5 ⭐</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* My Pets Tab - Only for pet owners */}
          {profile.role === 'pet_owner' && (
            <TabsContent value="pets" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>My Pets</CardTitle>
                    <PetsManagement 
                      profileId={profile.id}
                      userId={profile.user_id}
                      onPetAdded={fetchUserPets}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {userPets.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No pets added yet.</p>
                      <p className="text-sm text-muted-foreground">
                        Add your pets to make booking easier for sitters.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userPets.map((pet: any) => (
                        <Card key={pet.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-4">
                              {pet.photo_urls && pet.photo_urls[0] && (
                                <img
                                  src={pet.photo_urls[0]}
                                  alt={pet.name}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                              )}
                              <div className="flex-1">
                                <h3 className="font-semibold">{pet.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {pet.species} • {pet.breed || 'Mixed'} • {pet.age} years
                                </p>
                                {pet.personality_traits && pet.personality_traits.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {pet.personality_traits.slice(0, 3).map((trait: string) => (
                                      <Badge key={trait} variant="outline" className="text-xs">
                                        {trait}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
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
          )}

          {/* Services & Pricing Tab - Only for sitters */}
          {profile.role === 'pet_sitter' && (
            <TabsContent value="services" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {sitterServices.length > 0 ? (
                  sitterServices.map((service: any) => (
                    <Card key={service.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>
                            {service.service_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant={service.is_offered ? 'default' : 'secondary'}>
                              {service.is_offered ? 'Active' : 'Inactive'}
                            </Badge>
                            {editingService === service.id ? (
                              <div className="flex gap-1">
                                <Button size="sm" onClick={handleSaveService}>
                                  <Save className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingService(null)}>
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => handleEditService(service)}>
                                <Edit3 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {editingService === service.id ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Daily Rate ($)</Label>
                                <Input
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={serviceEditData.daily_rate || ''}
                                  onChange={(e) => setServiceEditData((prev: any) => ({
                                    ...prev,
                                    daily_rate: parseFloat(e.target.value) || null
                                  }))}
                                  placeholder="0.00"
                                />
                              </div>
                              <div>
                                <Label>Overnight Rate ($)</Label>
                                <Input
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={serviceEditData.overnight_rate || ''}
                                  onChange={(e) => setServiceEditData((prev: any) => ({
                                    ...prev,
                                    overnight_rate: parseFloat(e.target.value) || null
                                  }))}
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Textarea
                                value={serviceEditData.description || ''}
                                onChange={(e) => setServiceEditData((prev: any) => ({
                                  ...prev,
                                  description: e.target.value
                                }))}
                                placeholder="Describe your service..."
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`offered-${service.id}`}
                                checked={serviceEditData.is_offered}
                                onCheckedChange={(checked) => setServiceEditData((prev: any) => ({
                                  ...prev,
                                  is_offered: checked
                                }))}
                              />
                              <Label htmlFor={`offered-${service.id}`}>Service offered</Label>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="text-2xl font-bold text-primary">
                              {getRateDisplay(service)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {getRateLabel(service.service_type)}
                            </p>
                            {service.description && (
                              <p className="text-sm">{service.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>🐾 Max pets: {service.max_pets || 1}</span>
                              <span>📅 {service.experience_years || 0} years experience</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">No services configured yet.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          )}

          {/* Calendar Tab - Only for sitters */}
          {profile.role === 'pet_sitter' && (
            <TabsContent value="calendar" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <AvailabilityCalendar sitterId={profile.id} />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {recentBookings.length > 0 ? (
                  <div className="space-y-3">
                    {recentBookings.map((booking: any) => (
                      <div key={booking.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{booking.service_type.replace(/_/g, ' ')}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            booking.status === 'completed' ? 'default' :
                            booking.status === 'confirmed' ? 'secondary' :
                            'outline'
                          }>
                            {booking.status}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">${booking.total_amount}</p>
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

          {/* Verification Tab - Only for sitters */}
          {profile.role === 'pet_sitter' && (
            <TabsContent value="verification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Identity Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* ID Document Upload */}
                <div>
                  <h3 className="font-medium mb-2">Government Issued Photo ID</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a clear photo of your driver's license, passport, or government ID card.
                  </p>
                  {profile.id_document_url ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium text-green-700">ID Document Uploaded</p>
                        <p className="text-sm text-green-600">
                          ID document uploaded - pending assessment
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadVerificationDocument(file, 'id');
                        }}
                        className="hidden"
                        id="id-upload"
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('id-upload')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Photo ID
                      </Button>
                    </div>
                  )}
                </div>

                {/* Blue Card Upload */}
                <div>
                  <h3 className="font-medium mb-2">Working with Children Check (Blue Card)</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload your Queensland Blue Card or equivalent working with children check.
                  </p>
                  {profile.blue_card_document_url ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium text-green-700">Blue Card Uploaded</p>
                        <p className="text-sm text-green-600">
                          Blue Card uploaded - pending assessment
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadVerificationDocument(file, 'blue_card');
                        }}
                        className="hidden"
                        id="blue-card-upload"
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('blue-card-upload')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Blue Card
                      </Button>
                    </div>
                  )}
                </div>

                {/* Verification Status */}
                <div className="border-t pt-4">
                  <div className="flex items-center gap-3">
                    {profile.is_verified ? (
                      <>
                        <Shield className="w-5 h-5 text-green-500" />
                        <div>
                          <h4 className="font-medium text-green-700">Verified Sitter</h4>
                          <p className="text-sm text-muted-foreground">Your account has been verified</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                        <div>
                          <h4 className="font-medium text-yellow-700">Verification Pending</h4>
                          <p className="text-sm text-muted-foreground">
                            {profile.verification_documents_uploaded_at 
                              ? 'Your documents are under assessment'
                              : 'Upload your documents to start the verification process'
                            }
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          )}

          {/* Client Daily Reports Tab */}
          {profile.role === 'pet_owner' && (
            <TabsContent value="client-reports">
              <ClientDailyReports />
            </TabsContent>
          )}

          {/* Sitter Daily Reports Tab */}
          {profile.role === 'pet_sitter' && (
            <TabsContent value="sitter-reports">
              <SitterDailyReports />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}