import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SEOHead from '@/components/seo/SEOHead';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Shield, Star, Users, CheckCircle, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();
  
  const stats = [
    { number: '10,000+', label: 'Happy Pet Parents' },
    { number: '2,500+', label: 'Verified Sitters' },
    { number: '50,000+', label: 'Successful Bookings' },
    { number: '4.9/5', label: 'Average Rating' }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Love for Animals',
      description: 'Every team member and sitter on our platform shares a genuine love for pets and their wellbeing.'
    },
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: "Three-tier verification system (New, ID Verified, Gold Star) and secure platform ensure your pet's safety."
    },
    {
      icon: Star,
      title: 'Quality Service',
      description: 'We maintain high standards through rigorous vetting and continuous feedback from pet parents.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Building a trusted community where pet lovers can connect and support each other.'
    }
  ];

  const team = [
    {
      name: 'Jana Maia',
      role: 'Co-Founder',
      bio: "Pet parent to a high-needs rescue dog requiring daily medication and specialized care. Understands the challenges of finding reliable pet sitters for special-needs animals.",
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b9c5?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Rachel Nottingham',
      role: 'Co-Founder',
      bio: 'Experienced with anxious and reactive pets. Rachel\'s background in animal behavior helps ensure our platform serves pets with unique emotional and physical needs.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    }
  ];

  return (
    <>
      <SEOHead 
        title="About ZiggySitters - Founded by Pet Parents for Special Needs Animals"
        description="Learn about ZiggySitters' founders Jana Maia and Rachel Nottingham, who created the platform for high-needs pets requiring specialized care and daily updates."
        keywords="about ZiggySitters, pet care founders, special needs pets, Auckland pet care story, Jana Maia, Rachel Nottingham"
        canonical="/about"
      />
      <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <Badge variant="secondary" className="mb-6">
              <Heart className="w-4 h-4 mr-2 inline" />
              Our Story
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
              <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                About ZiggySitters
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              We're on a mission to create a world where every pet receives the love, care, 
              and attention they deserve, even when their parents can't be there.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Our Story</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold mb-4">Born from High-Needs Pet Parents</h3>
                <p className="text-gray-600 mb-4">
                  ZiggySitters was founded in 2022 by Jana Maia and Rachel Nottingham, two pet parents 
                  with high-needs animals who struggled to find reliable, understanding pet care. Jana's 
                  rescue dog required medication and special attention, while Rachel's anxious cat needed 
                  patient, experienced care.
                </p>
                <p className="text-gray-600 mb-4">
                  After countless disappointing experiences with pet sitters who didn't understand their 
                  pets' unique needs, they decided to create a platform that truly prioritizes the 
                  wellbeing of every pet, especially those requiring extra care and attention.
                </p>
                <p className="text-gray-600 mb-4">
                  What started as a personal mission became a thriving community where pet parents with 
                  special-needs animals can find sitters who genuinely understand and care.
                </p>
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Founded 2022
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    NZ Startup Award 2023
                  </Badge>
                </div>
              </div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=400&fit=crop" 
                  alt="Happy pets with their sitter"
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do, from how we vet our sitters 
              to how we support our community.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're a passionate team of pet lovers dedicated to creating the best 
              possible experience for pets and their parents.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage 
                      src={member.image} 
                      alt={member.name} 
                      className="object-cover"
                    />
                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6">
              <Shield className="w-4 h-4 mr-2 inline" />
              Our Mission
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Our Mission
              </span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-12 italic">
              "To ensure no pet parent ever has to worry about their furry family member's 
              care and happiness when they can't be there themselves."
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <Heart className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">For Pet Parents</h3>
                  <p className="text-muted-foreground">Peace of mind knowing your pet is in loving, capable hands</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <Users className="w-8 h-8 text-secondary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">For Pet Sitters</h3>
                  <p className="text-muted-foreground">Meaningful work caring for animals while earning income</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <Star className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">For Pets</h3>
                  <p className="text-muted-foreground">Continued love, attention, and care in a safe environment</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Join Our Community</h2>
            <p className="text-xl text-gray-600 mb-8">
              Whether you're a pet parent looking for reliable care or someone who loves 
              animals and wants to help, we'd love to have you join our growing community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="px-8 py-3" 
                onClick={() => navigate('/auth')}
              >
                Find a Sitter
              </Button>
              <Button 
                variant="outline" 
                className="px-8 py-3" 
                onClick={() => navigate('/auth')}
              >
                Become a Sitter
              </Button>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}