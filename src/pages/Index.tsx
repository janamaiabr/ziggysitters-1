import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Star, Heart, Shield, Clock, Award, Search, DollarSign, CheckCircle, Camera } from 'lucide-react';
import SuburbAutocomplete from '@/components/search/SuburbAutocomplete';
import heroImage from '@/assets/hero-image.jpg';
import petServices from '@/assets/pet-services.jpg';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [serviceType, setServiceType] = useState(searchParams.get('serviceType') || '');
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');

  const popularServices = [
    { name: 'Pet Sitting with Daily Reports', icon: '🏠', description: 'Your pet stays at sitter\'s home with guaranteed daily photo updates' },
    { name: 'In-Home Care with Updates', icon: '🏡', description: 'Sitter comes to your home with mandatory daily reporting' },
    { name: 'Drop-in Visits with Photos', icon: '⏰', description: 'Every visit documented with photos and detailed notes' },
    { name: 'Dog Walking with Updates', icon: '🚶‍♂️', description: 'Every walk tracked with photos and activity reports' },
  ];

  // Real data from database
  const [featuredSitters, setFeaturedSitters] = useState([]);

  useEffect(() => {
    const fetchSitters = async () => {
      // Fetch directly from profiles table instead of view
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['pet_sitter', 'both'])
        .eq('is_verified', true) // Only show verified sitters
        .order('rating', { ascending: false })
        .limit(4);
      
      console.log('Featured sitters data:', data);
      console.log('Featured sitters error:', error);
      
      if (data && data.length > 0) {
        setFeaturedSitters(data.map(sitter => ({
          id: sitter.id,
          name: `${sitter.first_name} ${sitter.last_name.charAt(0)}.`,
          rating: sitter.rating || 4.8,
          feedback_count: sitter.total_reviews || 0,
          location: `${sitter.suburb || 'Auckland'}, ${sitter.city || 'Auckland'}`,
          services: ['Pet Sitting', 'Drop-in Visits'],
          verified: sitter.is_verified,
          
          avatar: sitter.avatar_url || 'https://images.unsplash.com/photo-1494790108755-2616b612b9c5?w=150&h=150&fit=crop&crop=face',
          bio: sitter.bio || 'Experienced pet care provider'
        })));
      }
    };

    fetchSitters();
  }, []);

  const trustFeatures = [
    {
      icon: Camera,
      title: 'Daily Photo Updates',
      description: 'Mandatory daily reports with photos - or sitters get 50% payment'
    },
    {
      icon: Shield,
      title: 'Guaranteed Updates',
      description: 'First platform to enforce daily communication from sitters'
    },
    {
      icon: CheckCircle,
      title: 'Transparent Care',
      description: 'Detailed daily reports on exercise, food, sleep, and mood'
    }
  ];

  return (
    <div className="bg-gradient-to-b from-background to-accent/20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 to-gray-100 py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgPGcgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjAzIj4KICAgICAgPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPgogICAgPC9nPgogIDwvZz4KPC9zdmc+Cg==')] opacity-30"></div>
        </div>
        <div className="relative container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center text-gray-800">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Pet Sitters Who Send Daily Updates
            </h1>
            <p className="text-lg md:text-xl mb-6 md:mb-8 text-gray-600 max-w-3xl mx-auto px-4">
              The only platform where pet sitters MUST send daily photo updates and detailed reports. 
              No updates = reduced payment. Your peace of mind is guaranteed.
            </p>
            
      {/* Enhanced Search Bar */}
            <div className="bg-white rounded-2xl p-4 md:p-6 max-w-4xl mx-auto border border-gray-200 shadow-xl">
              {/* Mobile Optimized: Stack fields properly */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block">Where?</label>
                    <SuburbAutocomplete
                      value={location}
                      onChange={setLocation}
                      placeholder="Enter suburb or city"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block">Service</label>
                    <Select value={serviceType} onValueChange={setServiceType}>
                      <SelectTrigger className="h-12 border-gray-300 text-gray-800 focus:border-primary bg-white">
                        <SelectValue placeholder="What do you need?" />
                      </SelectTrigger>
                       <SelectContent className="z-50 bg-white border shadow-lg">
                         <SelectItem value="pet_sitting_sitters_home">🏠 Pet Sitting (Sitter's Home)</SelectItem>
                         <SelectItem value="pet_sitting_owners_home">🏡 Pet Sitting (Your Home)</SelectItem>
                         <SelectItem value="drop_in_visits">⏰ Drop-in Visits</SelectItem>
                         <SelectItem value="dog_walking">🚶‍♂️ Dog Walking</SelectItem>
                       </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block">Check-in</label>
                    <Input 
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="h-12 border-gray-300 text-gray-800 focus:border-primary bg-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block">Check-out</label>
                    <Input 
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="h-12 border-gray-300 text-gray-800 focus:border-primary bg-white"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Button 
                  size="lg" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 w-full md:w-auto font-semibold text-base"
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (location) params.set('location', location);
                    if (serviceType) params.set('serviceType', serviceType);
                    if (checkIn) params.set('checkIn', checkIn);
                    if (checkOut) params.set('checkOut', checkOut);
                    navigate(`/find-sitters?${params.toString()}`);
                  }}
                >
                   <Search className="mr-2 h-5 w-5" />
                   🐾 Find Perfect Sitters
                </Button>
              </div>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-8 md:mt-12 px-4">
              {trustFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 md:space-x-3 text-gray-700">
                  <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  <span className="font-medium text-sm md:text-base">{feature.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-12 md:py-20 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-16 px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">Guaranteed Daily Updates</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Every service includes mandatory daily photo reports - the transparency you've been waiting for
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto px-4">
            {popularServices.map((service, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-4 md:p-8">
                  <div className="text-3xl md:text-4xl mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                    {service.icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">{service.name}</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-2 md:mb-4">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Sitters */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-16 px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">Top-rated Sitters in Auckland</h2>
            <p className="text-base md:text-lg text-muted-foreground">
              Meet some of our verified, experienced pet care professionals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto px-4">
            {featuredSitters.map((sitter) => (
              <Card key={sitter.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3 md:pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <Avatar className="h-12 w-12 md:h-16 md:w-16">
                        <AvatarImage src={sitter.avatar} alt={sitter.name} />
                        <AvatarFallback>{sitter.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg md:text-xl">{sitter.name}</CardTitle>
                        <div className="flex items-center text-xs md:text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3 mr-1" />
                          {sitter.location}
                        </div>
                         <div className="flex items-center mt-1">
                           <Star className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400 mr-1" />
                           <span className="font-medium text-sm md:text-base">{sitter.rating}</span>
                           <span className="text-xs md:text-sm text-muted-foreground ml-1">⭐ Top rated</span>
                          {sitter.verified && (
                            <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-500 ml-2" />
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Removed save sitter functionality */}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3 md:space-y-4">
                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{sitter.bio}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {sitter.services.map((service) => (
                      <Badge key={service} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                  
                   <div className="flex items-center justify-between">
                      <div className="text-xs md:text-sm text-muted-foreground">
                        
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
          
          <div className="text-center mt-8 md:mt-12 px-4">
           <Button variant="outline" size="lg" onClick={() => navigate('/find-sitters')}>
             🔍 View All Sitters
           </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 md:py-20 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-16 px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">How Daily Updates Work</h2>
            <p className="text-base md:text-lg text-muted-foreground">
              The first pet sitting platform with mandatory transparency
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto px-4">
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
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-primary text-primary-foreground rounded-full mb-4 md:mb-6 font-bold text-lg md:text-xl">
                  {step.step}
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">{step.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">Ready for Guaranteed Peace of Mind?</h2>
            <p className="text-lg md:text-xl mb-6 md:mb-8 opacity-90">
              Join thousands of pet owners who never worry again - because they get daily photo updates
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
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