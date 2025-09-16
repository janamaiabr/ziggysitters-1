import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  Star, 
  Heart, 
  MessageCircle, 
  Calendar,
  DollarSign,
  Award,
  Shield,
  Clock,
  ArrowLeft
} from 'lucide-react';
import MessageDialog from '@/components/messaging/MessageDialog';
import BookingDialog from '@/components/booking/BookingDialog';

const mockSitterData = {
  1: {
    id: 1,
    name: 'Emma Wilson',
    location: 'Ponsonby, Auckland',
    rating: 4.9,
    reviews: 127,
    baseRate: 25,
    hourlyRate: 27.50,
    services: ['Dog Walking', 'Pet Sitting', 'Overnight Care'],
    petTypes: ['Dogs', 'Cats'],
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b9c5?w=150&h=150&fit=crop&crop=face',
    verified: true,
    responseRate: 98,
    bio: 'Passionate pet lover with over 5 years of experience caring for furry friends. I treat every pet as if they were my own and provide personalized care tailored to their unique needs.',
    experience: '5+ years',
    availability: ['Weekdays', 'Weekends', 'Evenings'],
    specialties: ['Puppy training', 'Senior pet care', 'Medication administration'],
    gallery: [
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300&h=200&fit=crop'
    ]
  }
};

export default function SitterProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  
  const sitter = mockSitterData[parseInt(id || '1') as keyof typeof mockSitterData];
  
  if (!sitter) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sitter Not Found</h1>
          <Button onClick={() => navigate('/find-sitters')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Find Sitters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-50 to-gray-100 py-8">
        <div className="container mx-auto px-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/find-sitters')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
          
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-24 w-24">
              <AvatarImage src={sitter.avatar} />
              <AvatarFallback>
                {sitter.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{sitter.name}</h1>
                {sitter.verified && (
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center text-muted-foreground mb-4">
                <MapPin className="w-4 h-4 mr-1" />
                {sitter.location}
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-medium">{sitter.rating}</span>
                  <span className="text-sm text-muted-foreground ml-1">
                    ({sitter.reviews} reviews)
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span className="text-sm">{sitter.responseRate}% response rate</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={() => setShowBookingDialog(true)} size="lg">
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Now
                </Button>
                <Button variant="outline" onClick={() => setShowMessageDialog(true)}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message {sitter.name.split(' ')[0]}
                </Button>
                <Button variant="outline">
                  <Heart className="mr-2 h-4 w-4" />
                  Save Sitter
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About {sitter.name.split(' ')[0]}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{sitter.bio}</p>
              </CardContent>
            </Card>

            {/* Services & Rates */}
            <Card>
              <CardHeader>
                <CardTitle>Services & Rates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sitter.services.map((service) => (
                  <div key={service} className="flex justify-between items-center">
                    <span>{service}</span>
                    <div className="text-right">
                      <div className="font-semibold">${sitter.hourlyRate}/hr</div>
                      <div className="text-xs text-muted-foreground">
                        Includes platform fee
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Experience & Specialties */}
            <Card>
              <CardHeader>
                <CardTitle>Experience & Specialties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Experience</h4>
                  <p className="text-muted-foreground">{sitter.experience} of professional pet care</p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {sitter.specialties.map((specialty) => (
                      <Badge key={specialty} variant="outline">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Pet Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {sitter.petTypes.map((type) => (
                      <Badge key={type} variant="secondary">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Photo Gallery */}
            <Card>
              <CardHeader>
                <CardTitle>Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {sitter.gallery.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Gallery photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Book Now
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">${sitter.hourlyRate}/hr</div>
                  <div className="text-sm text-muted-foreground">
                    Total rate (includes fees)
                  </div>
                </div>
                
                <Button className="w-full" size="lg" onClick={() => setShowBookingDialog(true)}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Now
                </Button>
                
                <Button variant="outline" className="w-full" onClick={() => setShowMessageDialog(true)}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sitter.availability.map((time) => (
                    <div key={time} className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm">{time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Identity Verified</span>
                  <Badge variant="secondary">✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Background Check</span>
                  <Badge variant="secondary">✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">References</span>
                  <Badge variant="secondary">✓</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <BookingDialog
        isOpen={showBookingDialog}
        onClose={() => setShowBookingDialog(false)}
        sitter={{
          id: sitter.id,
          name: sitter.name,
          location: sitter.location,
          hourlyRate: sitter.hourlyRate,
          services: sitter.services,
          avatar: sitter.avatar
        }}
      />

      <MessageDialog
        isOpen={showMessageDialog}
        onClose={() => setShowMessageDialog(false)}
        recipientId={sitter.id.toString()}
        recipientName={sitter.name}
        recipientAvatar={sitter.avatar}
      />
    </div>
  );
}