import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
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
import { Calendar, Star, MapPin, Phone, Mail, Edit3, Save, X, Camera, DollarSign, Users, Briefcase, Shield, CameraIcon, Upload, Plus, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import AvailabilityCalendar from '@/components/calendar/AvailabilityCalendar';

export default function Profile() {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [recentBookings, setRecentBookings] = useState([]);
  const [sitterServices, setSitterServices] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [portfolioPhotos, setPortfolioPhotos] = useState([]);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [serviceEditData, setServiceEditData] = useState<any>({});

  useEffect(() => {
    if (profile) {
      fetchBookings();
      fetchSitterServices();
      fetchPortfolioPhotos();
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
    reviews: profile.total_reviews || 0,
    responseRate: profile.response_rate || 100,
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
                  <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
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
                </div>
                
                <div className="flex items-center text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  {userProfile.location}
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-medium">{userProfile.rating}</span>
                    <span className="text-muted-foreground ml-1">({userProfile.reviews} reviews)</span>
                  </div>
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services & Pricing</TabsTrigger>
            <TabsTrigger value="calendar">My Calendar</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
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
                      <p className="text-muted-foreground mb-4">{userProfile.bio}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {userProfile.services.map((service) => (
                        <Badge key={service} variant="secondary">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="first_name">First Name</Label>
                            <Input
                              id="first_name"
                              value={editData.first_name}
                              onChange={(e) => setEditData({...editData, first_name: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input
                              id="last_name"
                              value={editData.last_name}
                              onChange={(e) => setEditData({...editData, last_name: e.target.value})}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            value={editData.email}
                            onChange={(e) => setEditData({...editData, email: e.target.value})}
                            placeholder="Your email address"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={editData.phone}
                            onChange={(e) => setEditData({...editData, phone: e.target.value})}
                            placeholder="Your phone number"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="suburb">Suburb</Label>
                            <Input
                              id="suburb"
                              value={editData.suburb}
                              onChange={(e) => setEditData({...editData, suburb: e.target.value})}
                              placeholder="Your suburb"
                            />
                          </div>
                          <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={editData.city}
                              onChange={(e) => setEditData({...editData, city: e.target.value})}
                              placeholder="Your city"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-3 text-muted-foreground" />
                          <span>{userProfile.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-3 text-muted-foreground" />
                          <span>{userProfile.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-3 text-muted-foreground" />
                          <span>{userProfile.location}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Portfolio Photos */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Portfolio Photos</CardTitle>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="portfolio-upload"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('portfolio-upload')?.click()}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Photo
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {portfolioPhotos.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {portfolioPhotos.map((photo, index) => (
                          <div key={index} className="aspect-square rounded-lg overflow-hidden">
                            <img
                              src={photo}
                              alt={`Portfolio ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <CameraIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No portfolio photos yet</p>
                        <p className="text-sm">Add photos to showcase your services</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Stats */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Response Rate</span>
                      <span className="font-medium">{userProfile.responseRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Bookings</span>
                      <span className="font-medium">{recentBookings.length}</span>
                    </div>
                    {userProfile.reviews > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Average Rating</span>
                        <span className="font-medium">{userProfile.rating}/5 ⭐</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Services & Pricing Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sitterServices.map((service) => (
                <Card key={service.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>
                        {service.service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                              value={serviceEditData.daily_rate || ''}
                              onChange={(e) => setServiceEditData(prev => ({
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
                              value={serviceEditData.overnight_rate || ''}
                              onChange={(e) => setServiceEditData(prev => ({
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
                            onChange={(e) => setServiceEditData(prev => ({
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
                            onCheckedChange={(checked) => setServiceEditData(prev => ({
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
              ))}
            </div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            {profile.role === 'pet_sitter' || profile.role === 'both' ? (
              <Card>
                <CardHeader>
                  <CardTitle>My Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <AvailabilityCalendar sitterId={profile.id} />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Calendar Access</h3>
                  <p className="text-muted-foreground">
                    Calendar features are available for pet sitters only.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            {recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg mb-2">
                            {booking.service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </h3>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>From: {format(new Date(booking.start_date), 'MMM dd, yyyy')}</p>
                            <p>To: {format(new Date(booking.end_date), 'MMM dd, yyyy')}</p>
                            <p>Amount: ${booking.total_amount}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Message Client
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
                  <p className="text-muted-foreground">
                    Your booking history will appear here once you start getting bookings.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sitter Verification</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload your ID and Blue Card for verification to increase trust with pet owners.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* ID Document Upload */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">ID Document</h4>
                      <p className="text-sm text-muted-foreground">Valid government-issued photo ID</p>
                    </div>
                    {profile.id_document_url ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  {profile.id_document_url ? (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      ID document uploaded - pending review
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
                        Upload ID Document
                      </Button>
                    </div>
                  )}
                </div>

                {/* Blue Card Upload */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Blue Card</h4>
                      <p className="text-sm text-muted-foreground">Working with Children Check (Blue Card)</p>
                    </div>
                    {profile.blue_card_document_url ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  {profile.blue_card_document_url ? (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      Blue Card uploaded - pending review
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
                              ? 'Your documents are under review'
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
        </Tabs>
      </div>
    </div>
  );
}