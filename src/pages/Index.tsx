import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Star, Heart, Shield, Clock, Award, Search, DollarSign, CheckCircle } from 'lucide-react';
import SuburbAutocomplete from '@/components/search/SuburbAutocomplete';
import heroImage from '@/assets/hero-image.jpg';
import petServices from '@/assets/pet-services.jpg';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [serviceType, setServiceType] = useState('');

  const popularServices = [
    { name: 'Dog Walking', icon: '🐕', description: 'Daily walks for your furry friend' },
    { name: 'Pet Sitting', icon: '🏠', description: 'In-home pet care while you\'re away' },
    { name: 'Overnight Care', icon: '🌙', description: '24/7 overnight pet care' },
    { name: 'Drop-in Visits', icon: '⏰', description: 'Quick check-ins and feeding' },
  ];

  const featuredSitters = [
    {
      id: 1,
    name: 'Sarah Johnson',
    rating: 4.9,
    reviews: 127,
    location: 'Ponsonby, Auckland',
    services: ['Dog Walking', 'Pet Sitting'],
    verified: true,
    baseRate: 28,
    responseRate: 98,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b9c5?w=150&h=150&fit=crop&crop=face',
    bio: 'Experienced dog lover with 5+ years of pet care. I treat every pet like my own!'
  },
  {
    id: 2,
    name: 'Mike Chen',
    rating: 4.8,
    reviews: 89,
    location: 'Newmarket, Auckland',
    services: ['Pet Boarding', 'Grooming'],
    verified: true,
    baseRate: 32,
    responseRate: 95,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: 'Professional groomer and pet care specialist. Your pets will love their stay!'
  },
  {
    id: 3,
    name: 'Emma Williams',
    rating: 5.0,
    reviews: 156,
    location: 'Mount Eden, Auckland',
    services: ['Pet Sitting', 'Training'],
    verified: true,
    baseRate: 35,
    responseRate: 100,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    bio: 'Certified pet trainer with a passion for animal welfare and behavior.'
  },
  ];

  const trustFeatures = [
    {
      icon: Shield,
      title: 'Background Checked',
      description: 'All sitters are verified and background checked'
    },
    {
      icon: Star,
      title: 'Highly Rated',
      description: 'Only top-rated sitters with excellent reviews'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer support when you need it'
    }
  ];

  return (
    <div className="bg-gradient-to-b from-background to-accent/20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 to-gray-100 py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgPGcgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjAzIj4KICAgICAgPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPgogICAgPC9nPgogIDwvZz4KPC9zdmc+Cg==')] opacity-30"></div>
        </div>
        <div className="relative container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center text-gray-800">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Find Trusted Pet Sitters in Auckland
            </h1>
            <p className="text-xl mb-8 text-gray-600 max-w-3xl mx-auto">
              Connect with verified, loving pet sitters who will care for your furry friends like their own. 
              Book with confidence knowing your pets are in safe hands.
            </p>
            
      {/* Enhanced Search Bar */}
            <div className="bg-white rounded-2xl p-6 max-w-4xl mx-auto border border-gray-200 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <SuburbAutocomplete
                  value={location}
                  onChange={setLocation}
                  placeholder="Enter suburb"
                />
                <Input 
                  placeholder="Check-in date"
                  type="date"
                  className="h-12 border-gray-300 text-gray-800 focus:border-primary"
                />
                <Input 
                  placeholder="Check-out date"
                  type="date"
                  className="h-12 border-gray-300 text-gray-800 focus:border-primary"
                />
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger className="h-12 border-gray-300 text-gray-800 focus:border-primary">
                    <SelectValue placeholder="Service type" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white">
                    <SelectItem value="dog-walking">Dog Walking</SelectItem>
                    <SelectItem value="pet-sitting">Pet Sitting</SelectItem>
                    <SelectItem value="overnight">Overnight Care</SelectItem>
                    <SelectItem value="drop-in">Drop-in Visits</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 w-full md:w-auto font-semibold"
                onClick={() => navigate('/find-sitters')}
              >
                <Search className="mr-2 h-5 w-5" />
                Find Perfect Sitters
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              {trustFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 text-gray-700">
                  <feature.icon className="w-6 h-6 text-primary" />
                  <span className="font-medium">{feature.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-20 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Popular Pet Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From dog walking to overnight care, find the perfect service for your pet's needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularServices.map((service, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-8">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{service.name}</h3>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Sitters */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Top-rated Sitters in Auckland</h2>
            <p className="text-lg text-muted-foreground">
              Meet some of our verified, experienced pet care professionals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredSitters.map((sitter) => (
              <Card key={sitter.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={sitter.avatar} alt={sitter.name} />
                        <AvatarFallback>{sitter.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl">{sitter.name}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3 mr-1" />
                          {sitter.location}
                        </div>
                        <div className="flex items-center mt-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="font-medium">{sitter.rating}</span>
                          <span className="text-sm text-muted-foreground ml-1">({sitter.reviews})</span>
                          {sitter.verified && (
                            <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{sitter.bio}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {sitter.services.map((service) => (
                      <Badge key={service} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {sitter.responseRate}% response rate
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={() => navigate(`/sitter/${sitter.id}?booking=true`)}
                  >
                    View Profile & Book
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" onClick={() => navigate('/find-sitters')}>
              View All Sitters
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How ZiggySitters Works</h2>
            <p className="text-lg text-muted-foreground">
              Getting started is simple and secure
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: 1,
                title: 'Search & Browse',
                description: 'Find verified pet sitters in your area',
                icon: Search
              },
              {
                step: 2,
                title: 'Meet & Greet',
                description: 'Connect with sitters and arrange a meet',
                icon: Heart
              },
              {
                step: 3,
                title: 'Book & Relax',
                description: 'Book securely and enjoy peace of mind',
                icon: Shield
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full mb-6 font-bold text-xl">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" onClick={() => navigate('/how-it-works')}>
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Ready to Find Your Perfect Pet Sitter?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of happy pet owners who trust ZiggySitters with their furry family members
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8" onClick={() => navigate('/find-sitters')}>
                Find a Sitter Now
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-white text-white hover:bg-white hover:text-primary transition-colors px-8" 
                onClick={() => navigate('/become-sitter')}
              >
                Become a Sitter
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;