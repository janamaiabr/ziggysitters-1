import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Star, Heart, Shield, DollarSign, Calendar, MessageCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function Profile() {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const [activeTab, setActiveTab] = useState('overview');
  const [recentBookings, setRecentBookings] = useState([]);
  const [sitterServices, setSitterServices] = useState([]);

  useEffect(() => {
    if (profile) {
      fetchBookings();
      fetchSitterServices();
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
    if (!profile || profile.role === 'pet_owner') return;
    
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
                    <CheckCircle className="w-6 h-6 text-green-500" />
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
                <Button>Edit Profile</Button>
                <Button variant="outline">Settings</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'bookings', label: 'My Bookings' },
            { id: 'earnings', label: 'Earnings' },
            { id: 'settings', label: 'Settings' }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <Card>
                <CardHeader>
                  <CardTitle>About Me</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{userProfile.bio}</p>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.services.map((service) => (
                      <Badge key={service} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Services */}
              {userProfile.services.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Services Offered</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.services.map((service) => (
                        <Badge key={service} variant="secondary">
                          {service}
                        </Badge>
                      ))}
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

              {/* Upcoming Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No upcoming bookings</p>
                    <Button className="mt-3" onClick={() => window.location.href = '/find-sitters'}>
                      Find Sitters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
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
        )}

        {activeTab === 'earnings' && (
          <Card>
            <CardHeader>
              <CardTitle>Earnings Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <Button>View Detailed Report</Button>
            </CardContent>
          </Card>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input value={userProfile.email} disabled />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input placeholder="Add phone number" />
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input value={userProfile.location} />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Booking requests</span>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span>New reviews</span>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span>Payment confirmations</span>
                  <input type="checkbox" defaultChecked />
                </div>
                <Button>Update Preferences</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}