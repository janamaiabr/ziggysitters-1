import { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [serviceType, setServiceType] = useState('');

  const popularServices = [
    { name: 'Pet Sitting in Sitter\'s Home', icon: '🏠', description: 'Your pet stays at the sitter\'s home with 24/7 care' },
    { name: 'Pet Sitting in Owner\'s Home', icon: '🏡', description: 'Sitter comes to your home for personalized care' },
    { name: 'Drop-in Visits', icon: '⏰', description: 'Quick check-ins, feeding, and playtime 🐾' },
    { name: 'Dog Walking', icon: '🚶‍♂️', description: 'Regular walks to keep your dog happy and healthy' },
  ];

  // Replace with real data from database
  const [featuredSitters, setFeaturedSitters] = useState([]);

  useEffect(() => {
    const fetchSitters = async () => {
      const { data } = await supabase
        .from('public_sitter_profiles')
        .select('*')
        .order('rating', { ascending: false })
        .limit(6);
      
      if (data) {
        setFeaturedSitters(data.map(sitter => ({
          id: sitter.id,
          name: sitter.display_name, // Now using privacy-safe display name
          rating: sitter.rating || 4.8,
          reviews: sitter.total_reviews || 0,
          location: `${sitter.suburb}, ${sitter.city}`,
          services: ['Pet Sitting', 'Drop-in Visits'], // Would come from sitter_services table
          verified: sitter.is_verified,
          responseRate: sitter.response_rate || 95,
          avatar: sitter.avatar_url || 'https://images.unsplash.com/photo-1494790108755-2616b612b9c5?w=150&h=150&fit=crop&crop=face',
          bio: sitter.bio || 'Experienced pet care provider'
        })));
      }
    };

    fetchSitters();
  }, []);

  const trustFeatures = [
    {
      icon: Shield,
      title: 'Profile Verified',
      description: 'All sitters complete identity verification and profile validation'
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
                     <SelectItem value="pet_sitting_sitters_home">🏠 Pet Sitting in Sitter's Home</SelectItem>
                     <SelectItem value="pet_sitting_owners_home">🏡 Pet Sitting in Owner's Home</SelectItem>
                     <SelectItem value="drop_in_visits">⏰ Drop-in Visits</SelectItem>
                   </SelectContent>
                </Select>
              </div>
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 w-full md:w-auto font-semibold"
                onClick={() => navigate('/find-sitters')}
              >
                 <Search className="mr-2 h-5 w-5" />
                 🐾 Find Perfect Sitters
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
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
                           <span className="text-sm text-muted-foreground ml-1">⭐ Top rated</span>
                          {sitter.verified && (
                            <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Removed save sitter functionality */}
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
                       📞 {sitter.responseRate}% response rate
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={() => navigate(`/sitter/${sitter.id}?booking=true`)}
                   >
                     🐾 View Profile & Book
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
           <Button variant="outline" size="lg" onClick={() => navigate('/find-sitters')}>
             🔍 View All Sitters
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
              <Button size="lg" variant="solid-white" className="px-8" onClick={() => navigate('/auth')}>
                Find a Sitter Now
              </Button>
              <Button 
                variant="outline-white"
                size="lg" 
                className="px-8" 
                onClick={() => navigate('/auth')}
              >
                Join as a Sitter
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;