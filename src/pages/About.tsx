import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, Shield, Star, Users, CheckCircle, Award } from 'lucide-react';

export default function About() {
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
      title: 'Safety First',
      description: "Comprehensive background checks, insurance coverage, and 24/7 support ensure your pet's safety."
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
      name: 'Sarah Williams',
      role: 'Founder & CEO',
      bio: "Animal lover with 10+ years in pet care industry. Started ZiggySitters after struggling to find reliable pet care for her rescue dogs.",
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b9c5?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Michael Chen',
      role: 'Head of Safety',
      bio: 'Former veterinarian turned safety advocate. Ensures all our sitters meet the highest standards of pet care.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Emma Thompson',
      role: 'Community Manager',
      bio: 'Passionate about building connections between pet parents and sitters. Dog mom to three rescue pups.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">About ZiggySitters</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            We're on a mission to create a world where every pet receives the love, care, 
            and attention they deserve, even when their parents can't be there.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
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
                <h3 className="text-2xl font-semibold mb-4">Born from a Pet Parent's Need</h3>
                <p className="text-gray-600 mb-4">
                  ZiggySitters was founded in 2022 when our founder Sarah couldn't find reliable, 
                  trustworthy pet care for her rescue dogs while traveling for work. After one too 
                  many disappointing experiences with unreliable sitters, she decided to create 
                  the platform she wished existed.
                </p>
                <p className="text-gray-600 mb-4">
                  What started as a personal frustration became a mission to connect pet parents 
                  with verified, passionate pet sitters who truly care about animals' wellbeing.
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={member.image} alt={member.name} />
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
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl mb-8 opacity-90">
              "To ensure no pet parent ever has to worry about their furry family member's 
              care and happiness when they can't be there themselves."
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="text-xl font-semibold mb-3">For Pet Parents</h3>
                <p className="opacity-90">Peace of mind knowing your pet is in loving, capable hands</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">For Pet Sitters</h3>
                <p className="opacity-90">Meaningful work caring for animals while earning income</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">For Pets</h3>
                <p className="opacity-90">Continued love, attention, and care in a safe environment</p>
              </div>
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
              <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                Find a Sitter
              </button>
              <button className="border border-primary text-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary/10 transition-colors">
                Become a Sitter
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}