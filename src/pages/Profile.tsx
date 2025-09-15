import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Star, Heart, Shield, DollarSign, Calendar, MessageCircle, CheckCircle } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const userProfile = {
    name: user?.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}` : 'John Doe',
    email: user?.email || 'john@example.com',
    location: 'Ponsonby, Auckland',
    memberSince: '2023',
    rating: 4.9,
    reviews: 127,
    completedBookings: 89,
    responseRate: 98,
    verified: true,
    avatar: user?.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: 'Pet lover with 5+ years of experience. I treat every pet like my own family member.',
    services: ['Dog Walking', 'Pet Sitting', 'Overnight Care'],
    hourlyRate: 28
  };

  const recentBookings = [
    {
      id: 1,
      petName: 'Max',
      petType: 'Golden Retriever',
      service: 'Dog Walking',
      date: '2024-01-15',
      status: 'completed',
      amount: 25
    },
    {
      id: 2,
      petName: 'Luna',
      petType: 'Persian Cat',
      service: 'Pet Sitting',
      date: '2024-01-10',
      status: 'completed',
      amount: 60
    }
  ];

  const reviews = [
    {
      id: 1,
      reviewer: 'Sarah M.',
      rating: 5,
      comment: 'Amazing sitter! Max loved his walks and Sarah was so professional.',
      date: '2024-01-16'
    },
    {
      id: 2,
      reviewer: 'Mike T.',
      rating: 5,
      comment: 'Highly recommend! Great communication and care for our cat.',
      date: '2024-01-12'
    }
  ];

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

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'bookings', label: 'My Bookings' },
            { id: 'reviews', label: 'Reviews' },
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

              {/* Recent Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{review.reviewer}</span>
                          <div className="flex">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    View All Reviews
                  </Button>
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
                    <span className="font-medium">{userProfile.completedBookings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hourly Rate</span>
                    <span className="font-medium">${userProfile.hourlyRate}/hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Rating</span>
                    <span className="font-medium">{userProfile.rating}/5</span>
                  </div>
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
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                        <span className="text-lg">🐕</span>
                      </div>
                      <div>
                        <h3 className="font-medium">{booking.petName} - {booking.service}</h3>
                        <p className="text-sm text-muted-foreground">{booking.petType}</p>
                        <p className="text-sm text-muted-foreground">{booking.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={booking.status === 'completed' ? 'default' : 'secondary'}
                        className="mb-2"
                      >
                        {booking.status}
                      </Badge>
                      <p className="font-medium">${booking.amount}</p>
                    </div>
                  </div>
                ))}
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
                  <h3 className="text-2xl font-bold">$1,240</h3>
                  <p className="text-muted-foreground">This Month</p>
                </div>
                <div className="text-center p-6 bg-accent/50 rounded-lg">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h3 className="text-2xl font-bold">$4,890</h3>
                  <p className="text-muted-foreground">Total Earned</p>
                </div>
                <div className="text-center p-6 bg-accent/50 rounded-lg">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h3 className="text-2xl font-bold">$28</h3>
                  <p className="text-muted-foreground">Avg. per Hour</p>
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