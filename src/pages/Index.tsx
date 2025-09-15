import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Star, Shield, Clock, Heart } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';
import petServices from '@/assets/pet-services.jpg';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [location, setLocation] = useState('');

  const popularServices = [
    { name: 'Dog Walking', icon: '🐕' },
    { name: 'Pet Boarding', icon: '🏠' },
    { name: 'Daycare', icon: '☀️' },
    { name: 'Drop-in Visits', icon: '🚪' },
  ];

  const featuredSitters = [
    {
      id: 1,
      name: 'Sarah Johnson',
      rating: 4.9,
      reviews: 127,
      location: 'Ponsonby',
      services: ['Dog Walking', 'Boarding'],
      verified: true,
      image: '/placeholder.svg'
    },
    {
      id: 2,
      name: 'Mike Chen',
      rating: 4.8,
      reviews: 89,
      location: 'Grey Lynn',
      services: ['Daycare', 'Grooming'],
      verified: true,
      image: '/placeholder.svg'
    },
    {
      id: 3,
      name: 'Emma Williams',
      rating: 5.0,
      reviews: 156,
      location: 'Parnell',
      services: ['Boarding', 'Drop-ins'],
      verified: true,
      image: '/placeholder.svg'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-secondary/30">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Find trusted pet care in Auckland
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with verified pet sitters and dog walkers in your neighbourhood. 
              Your furry friends deserve the best care while you're away.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2 p-2 bg-card rounded-full shadow-lg border">
              <div className="flex-1 flex items-center gap-2 px-4">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Enter your suburb (e.g., Ponsonby, Grey Lynn)" 
                  className="border-0 bg-transparent focus-visible:ring-0" 
                />
              </div>
              <Button size="lg" className="rounded-full px-8">
                <Search className="h-5 w-5 mr-2" />
                Find Sitters
              </Button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Background checked sitters</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              <span>Insured & bonded</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">Popular Pet Services</h2>
            <p className="text-muted-foreground">Everything your pet needs, right in your neighbourhood</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularServices.map((service, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="text-4xl">{service.icon}</div>
                  <h3 className="font-medium">{service.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Sitters */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">Top-rated sitters in Auckland</h2>
            <p className="text-muted-foreground">Meet some of our most trusted pet care providers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredSitters.map((sitter) => (
              <Card key={sitter.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl">
                      {sitter.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{sitter.name}</h3>
                        {sitter.verified && <Shield className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{sitter.rating}</span>
                        <span>({sitter.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{sitter.location}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {sitter.services.map((service, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" size="lg" onClick={() => navigate('/find-sitters')}>
              View All Sitters
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Ready to get started?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of pet owners who trust ZiggySitters for their pet care needs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button size="lg" onClick={() => navigate('/find-sitters')}>
                Find Pet Sitters
              </Button>
            ) : (
              <Button size="lg" onClick={() => navigate('/auth')}>
                Get Started Today
              </Button>
            )}
            <Button variant="outline" size="lg" onClick={() => navigate('/become-sitter')}>
              Become a Pet Sitter
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
