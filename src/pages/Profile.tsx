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
import { Calendar, Star, MapPin, Phone, Mail, Edit3, Save, X, Camera, DollarSign, Users, Briefcase, Shield, CameraIcon, Upload, Plus } from 'lucide-react';
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
        address: profile.address || ''
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
        .list(`${profile.id}/portfolio`, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (!error && data) {
        const photoUrls = data.map(file => {
          const { data: { publicUrl } } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(`${profile.id}/portfolio/${file.name}`);
          return publicUrl;
        });
        setPortfolioPhotos(photoUrls);
      }
    } catch (error) {
      console.error('Error fetching portfolio photos:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(editData)
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });

      setIsEditing(false);
      window.location.reload(); // Refresh to show updated data
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${profile.id}/portfolio/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      fetchPortfolioPhotos(); // Refresh photos
      
      toast({
        title: 'Photo uploaded',
        description: 'Your portfolio photo has been added.',
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload photo. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background py-8 flex items-center justify-center">Loading...</div>;
  }

  const userProfile = {
    name: profile ? `${profile.first_name} ${profile.last_name}` : 'User',
    email: profile?.email || user?.email || '',
    location: profile ? `${profile.suburb ? profile.suburb + ', ' : ''}${profile.city || 'Auckland'}` : 'Auckland',
    memberSince: profile ? new Date(profile.created_at).getFullYear().toString() : '2024',
    rating: (profile as any)?.rating || 0,
    reviews: (profile as any)?.total_reviews || 0,
    completedBookings: recentBookings.filter(b => b.status === 'completed').length,
    responseRate: (profile as any)?.response_rate || 100,
    verified: profile?.is_verified || false,
    avatar: profile?.avatar_url || '',
    bio: profile?.bio || 'No bio added yet.',
    services: sitterServices.map(s => s.service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())),
    hourlyRate: sitterServices.length > 0 ? Math.min(...sitterServices.map(s => s.hourly_rate || s.daily_rate || 0)) : 0
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-8">
              <Avatar className="h-24 w-24">
                <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                <AvatarFallback className="text-2xl">
                  {userProfile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
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
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
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

                {/* Contact Information */}
                {isEditing && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                    </CardContent>
                  </Card>
                )}
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
                    {userProfile.hourlyRate > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Starting Rate</span>
                        <span className="font-medium">${userProfile.hourlyRate}/hr</span>
                      </div>
                    )}
                    {userProfile.reviews > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Average Rating</span>
                        <span className="font-medium">{userProfile.rating}/5</span>
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
                    <CardTitle className="flex items-center justify-between">
                      {service.service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      <Badge variant={service.is_offered ? 'default' : 'secondary'}>
                        {service.is_offered ? 'Active' : 'Inactive'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {service.description && (
                      <p className="text-muted-foreground">{service.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      {service.hourly_rate && (
                        <div>
                          <Label className="text-sm font-medium">Hourly Rate</Label>
                          <p className="text-lg font-bold">${service.hourly_rate}/hr</p>
                        </div>
                      )}
                      {service.daily_rate && (
                        <div>
                          <Label className="text-sm font-medium">Daily Rate</Label>
                          <p className="text-lg font-bold">${service.daily_rate}/day</p>
                        </div>
                      )}
                      {service.overnight_rate && (
                        <div>
                          <Label className="text-sm font-medium">Overnight Rate</Label>
                          <p className="text-lg font-bold">${service.overnight_rate}/night</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Max Pets</span>
                        <span>{service.max_pets}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Experience</span>
                        <span>{service.experience_years} years</span>
                      </div>
                      {service.has_fenced_yard && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Fenced Yard</span>
                          <span>✓ Yes</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Senior Pets</span>
                        <span>{service.allows_senior_pets ? '✓ Yes' : '✗ No'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Puppies</span>
                        <span>{service.allows_puppies ? '✓ Yes' : '✗ No'}</span>
                      </div>
                    </div>

                    {service.accepted_pet_species && service.accepted_pet_species.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Accepted Pet Types</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {service.accepted_pet_species.map((species) => (
                            <Badge key={species} variant="outline" className="text-xs">
                              {species.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {service.accepted_pet_sizes && service.accepted_pet_sizes.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Accepted Pet Sizes</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {service.accepted_pet_sizes.map((size) => (
                            <Badge key={size} variant="outline" className="text-xs">
                              {size.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {sitterServices.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No services configured yet</p>
                    <p className="text-sm">Complete your sitter registration to add services</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            {profile?.role === 'pet_owner' ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Calendar is available for pet sitters</p>
                    <p className="text-sm">Switch to pet sitter mode to manage your availability</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <AvailabilityCalendar sitterId={profile?.id || ''} />
            )}
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.length > 0 ? recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                          <span className="text-lg">🐕</span>
                        </div>
                        <div>
                          <h3 className="font-medium">{booking.service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
                          <p className="text-sm text-muted-foreground">{new Date(booking.start_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={booking.status === 'completed' ? 'default' : 'secondary'}
                          className="mb-2"
                        >
                          {booking.status}
                        </Badge>
                        <p className="font-medium">${booking.total_amount}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No bookings yet</p>
                      <Button className="mt-3" onClick={() => window.location.href = '/find-sitters'}>
                        {profile?.role === 'pet_owner' ? 'Find Sitters' : 'Browse Available Services'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle>Earnings Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-accent/50 rounded-lg">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <h3 className="text-2xl font-bold">$0</h3>
                    <p className="text-muted-foreground">This Month</p>
                  </div>
                  <div className="text-center p-6 bg-accent/50 rounded-lg">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <h3 className="text-2xl font-bold">$0</h3>
                    <p className="text-muted-foreground">Total Earned</p>
                  </div>
                  <div className="text-center p-6 bg-accent/50 rounded-lg">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <h3 className="text-2xl font-bold">${userProfile.hourlyRate}</h3>
                    <p className="text-muted-foreground">Your Rate</p>
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