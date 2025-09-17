import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, UserCheck, MessageCircle, CreditCard, Shield, Heart, Star, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/hero-image.jpg';
import petServices from '@/assets/pet-services.jpg';

const forOwners = [
  {
    step: 1,
    icon: Search,
    title: 'Search & Browse',
    description: 'Find verified pet sitters in your area using our advanced search filters'
  },
  {
    step: 2,
    icon: UserCheck,
    title: 'Review Profiles',
    description: 'Read reviews, check credentials, and view photos of potential sitters'
  },
  {
    step: 3,
    icon: MessageCircle,
    title: 'Meet & Greet',
    description: 'Message sitters directly and arrange a meet & greet with your pet'
  },
  {
    step: 4,
    icon: CreditCard,
    title: 'Book & Pay',
    description: 'Book your preferred sitter and pay securely through our platform'
  }
];

const forSitters = [
  {
    step: 1,
    icon: UserCheck,
    title: 'Create Profile',
    description: 'Sign up, complete verification, and showcase your pet care experience'
  },
  {
    step: 2,
    icon: Heart,
    title: 'Set Services',
    description: 'Choose what services to offer and set your own competitive rates'
  },
  {
    step: 3,
    icon: MessageCircle,
    title: 'Get Requests',
    description: 'Receive booking requests from pet owners in your area'
  },
  {
    step: 4,
    icon: CreditCard,
    title: 'Earn Money',
    description: 'Provide amazing care and get paid directly through the platform'
  }
];

const safetyFeatures = [
  {
    icon: Shield,
    title: 'Profile Verification',
    description: 'All sitters complete identity verification and profile validation'
  },
  {
    icon: UserCheck,
    title: 'Identity Verification',
    description: 'Government ID verification for all platform members'
  },
  {
    icon: Star,
    title: 'Reviews & Ratings',
    description: 'Transparent review system from real pet owners'
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'Protected payment processing with money-back guarantee'
  }
];

export default function HowItWorks() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary to-secondary text-primary-foreground py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30"
          style={{ backgroundImage: `url(${heroImage})` }}
        ></div>
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">How ZiggySitters Works</h1>
            <p className="text-xl mb-8 opacity-90">
              Connecting pet owners with trusted, verified pet sitters in your local community
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="solid-white" className="px-8" onClick={() => navigate('/find-sitters')}>
                Find a Sitter
              </Button>
              <Button variant="outline-white" size="lg" className="px-8" onClick={() => navigate('/become-sitter')}>
                Become a Sitter
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* For Pet Owners */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">For Pet Owners</Badge>
            <h2 className="text-3xl font-bold mb-4">Find the Perfect Sitter</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform makes it easy to find, book, and manage pet care services with trusted local sitters
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {forOwners.map((step, index) => (
              <Card key={index} className="text-center border-0 shadow-lg relative">
                <CardContent className="p-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                    {step.step}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="relative rounded-2xl overflow-hidden">
            <img 
              src={petServices} 
              alt="Pet care services" 
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center text-white">
                <h3 className="text-2xl font-bold mb-2">Peace of Mind Guaranteed</h3>
                <p className="text-lg opacity-90">Your pets are in safe, loving hands</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* For Pet Sitters */}
      <div className="py-20 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">For Pet Sitters</Badge>
            <h2 className="text-3xl font-bold mb-4">Start Earning with Pets</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Turn your love for animals into a flexible income stream with our trusted platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {forSitters.map((step, index) => (
              <Card key={index} className="text-center border-0 shadow-lg relative">
                <CardContent className="p-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary/10 rounded-full mb-6">
                    <step.icon className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                    {step.step}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Safety & Trust */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Safety & Trust First</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We prioritize the safety and security of both pets and their owners through comprehensive verification
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {safetyFeatures.map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                    <feature.icon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Service Types */}
      <div className="py-20 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Services</h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive pet care services to meet all your needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: 'Dog Walking',
                description: 'Daily walks to keep your dog healthy and happy',
                price: 'From $25/walk',
                icon: '🐕'
              },
              {
                title: 'Pet Sitting',
                description: 'In-home care while you\'re away',
                price: 'From $30/day',
                icon: '🏠'
              },
              {
                title: 'Overnight Care',
                description: '24/7 care with overnight stays',
                price: 'From $60/night',
                icon: '🌙'
              },
              {
                title: 'Drop-in Visits',
                description: 'Quick check-ins and feeding',
                price: 'From $20/visit',
                icon: '⏰'
              },
              {
                title: 'Pet Boarding',
                description: 'Your pet stays at the sitter\'s home',
                price: 'From $40/night',
                icon: '🏡'
              },
              {
                title: 'Grooming',
                description: 'Professional grooming services',
                price: 'From $50/session',
                icon: '✨'
              }
            ].map((service, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-8">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <Badge variant="secondary">{service.price}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-8">
            {[
              {
                question: 'How are sitters verified?',
                answer: 'All sitters complete identity verification and profile validation before joining our platform. We verify their information and ensure they meet our standards.'
              },
              {
                question: 'What if something goes wrong?',
                answer: 'Contact us immediately through our platform. We take all safety concerns seriously and will help resolve any issues.'
              },
              {
                question: 'How do payments work?',
                answer: 'Payments are processed securely through our platform. You pay when you book, and sitters are paid after service completion.'
              },
              {
                question: 'Can I meet the sitter before booking?',
                answer: 'Absolutely! We encourage meet & greets so you and your pet can get comfortable with your chosen sitter.'
              }
            ].map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of happy pet owners and trusted sitters in our community
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="solid-white" className="px-8" onClick={() => navigate('/find-sitters')}>
              Find a Sitter
            </Button>
            <Button variant="outline-white" size="lg" className="px-8" onClick={() => navigate('/become-sitter')}>
              Become a Sitter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}