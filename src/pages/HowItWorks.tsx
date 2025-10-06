import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SEOHead from '@/components/seo/SEOHead';
import { Badge } from '@/components/ui/badge';
import { Search, UserCheck, CreditCard, Shield, Heart, Star, Clock, Camera, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import petServices from '@/assets/pet-services.jpg';

const forOwners = [
  {
    step: 1,
    icon: Search,
    title: 'Search & Browse',
    description: 'Find verified sitters and choose if you want daily reports'
  },
  {
    step: 2,
    icon: Camera,
    title: 'Choose Your Updates',
    description: 'Request daily photo reports when booking - it\'s your choice'
  },
  {
    step: 3,
    icon: Heart,
    title: 'Peace of Mind',
    description: 'Get daily updates if requested - sitters are held accountable'
  },
  {
    step: 4,
    icon: Shield,
    title: 'Payment Protection',
    description: 'When you request reports, sitters must deliver or face 15% deduction'
  }
];

const forSitters = [
  {
    step: 1,
    icon: UserCheck,
    title: 'Create Profile',
    description: 'Sign up and showcase your pet care experience'
  },
  {
    step: 2,
    icon: Camera,
    title: 'Submit Reports When Requested',
    description: 'Send daily reports with photos by 9 PM for bookings that request them'
  },
  {
    step: 3,
    icon: Heart,
    title: 'Build Trust',
    description: 'Reliable reporting builds your reputation - get more bookings'
  },
  {
    step: 4,
    icon: CreditCard,
    title: 'Earn Full Payment',
    description: '100% pay when completing requested reports, 15% deduction if missed'
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
    description: 'ID verification (i.e. passport or drivers licence) for all platform members'
  },
  {
    icon: Star,
    title: 'Feedback & Ratings',
    description: 'Transparent feedback system from real pet owners'
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'Protected payment processing with money-back guarantee'
  }
];

export default function HowItWorks() {
  const navigate = useNavigate();
  
  // Enhanced structured data for SEO and AI discoverability
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Book a Pet Sitter with Daily Photo Updates",
    "description": "Step-by-step guide on how to find and book verified pet sitters who provide mandatory daily photo updates and detailed care reports in New Zealand.",
    "totalTime": "PT10M",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Search for Pet Sitters",
        "text": "Browse verified pet sitters in your area and choose whether you want daily photo updates",
        "url": "https://ziggysitters.co.nz/find-sitters",
        "image": "https://ziggysitters.co.nz/images/search-sitters.jpg"
      },
      {
        "@type": "HowToStep",
        "name": "View Sitter Profiles",
        "text": "Review sitter profiles, ratings, and feedback from other pet owners to find the perfect match",
        "url": "https://ziggysitters.co.nz/find-sitters"
      },
      {
        "@type": "HowToStep",
        "name": "Book Your Sitter",
        "text": "Select dates, service type, and choose if you want daily reports - complete secure payment through our platform",
        "url": "https://ziggysitters.co.nz/bookings"
      },
      {
        "@type": "HowToStep",
        "name": "Receive Daily Updates (Optional)",
        "text": "Get comprehensive daily reports with photos if you requested them - sitters held accountable",
        "url": "https://ziggysitters.co.nz/daily-reports"
      }
    ]
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How are pet sitters verified on ZiggySitters?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "All pet sitters on ZiggySitters complete comprehensive identity verification including passport or driver's license validation, and profile validation before joining our platform. We verify their information and ensure they meet our safety and reliability standards."
        }
      },
      {
        "@type": "Question",
        "name": "What happens if a pet sitter doesn't send daily updates when requested?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "When pet owners request daily reports, sitters are held accountable. If a sitter fails to send requested daily photo updates and care reports, they face a 15% payment deduction. This accountability system ensures transparency when owners choose to receive updates."
        }
      },
      {
        "@type": "Question",
        "name": "How do payments work for pet sitting services?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Payments are processed securely through our platform using Stripe. You pay when you book your pet sitter, and the payment is held securely. Sitters receive payment after successful service completion, with full payment when they complete any requested daily reports."
        }
      },
      {
        "@type": "Question",
        "name": "Can I meet the pet sitter before booking?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely! We strongly encourage meet and greet sessions so you and your pet can get comfortable with your chosen sitter before the booking starts. This helps ensure a good match and peace of mind."
        }
      },
      {
        "@type": "Question",
        "name": "What pet care services does ZiggySitters offer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "ZiggySitters offers comprehensive pet care services including dog walking, pet sitting (in-home and at sitter's home), overnight care, drop-in visits, pet boarding, and grooming services. All services include mandatory daily photo updates and detailed care reports."
        }
      }
    ]
  };
  
  return (
    <>
      <SEOHead 
        title="How It Works: Book Pet Sitters with Optional Daily Updates | ZiggySitters NZ"
        description="Learn how to book verified pet sitters in New Zealand. Choose to receive daily photo updates when booking - when you do, sitters are held accountable with our unique payment protection system."
        keywords="how pet sitting works, book pet sitter online, daily pet photo updates, verified pet care NZ, pet sitter accountability, dog walking Auckland, pet boarding New Zealand, overnight pet care, pet care with updates"
        canonical="/how-it-works"
      />
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(faqStructuredData)}
      </script>
      <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <Badge variant="secondary" className="mb-6">
              <CheckCircle className="w-4 h-4 mr-2 inline" />
              How It Works
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
              <span className="block mb-2">Pet Sitting with</span>
              <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Optional Daily Updates
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              New Zealand's flexible pet sitting platform - choose daily photo updates when you want them, with accountability guaranteed
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="px-8 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                onClick={() => navigate('/auth')}
              >
                Find a Sitter
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 shadow-lg hover:shadow-xl transition-all hover:scale-105" 
                onClick={() => navigate('/auth')}
              >
                Become a Sitter
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* For Pet Owners */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">For Pet Owners</Badge>
            <h2 className="text-3xl font-bold mb-4">How to Book a Pet Sitter in 4 Easy Steps</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find verified pet sitters in Auckland and across New Zealand. Choose to receive daily photo updates when booking - when you do, sitters are held accountable with a 15% payment deduction for missed reports.
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
              alt="Professional pet sitting services in New Zealand with daily photo updates and care reports" 
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
            <h2 className="text-3xl font-bold mb-4">Become a Pet Sitter: Earn Money Caring for Pets</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join New Zealand's leading pet sitting platform. When owners request daily reports, deliver them on time, build trust, earn competitive rates, and receive 100% payment.
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
            <h2 className="text-3xl font-bold mb-4">Pet Safety & Verified Sitter Trust</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We prioritize pet safety and owner peace of mind through comprehensive identity verification, secure payments, and transparent feedback from real pet owners across New Zealand.
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
            <h2 className="text-3xl font-bold mb-4">Pet Care Services in New Zealand</h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive pet sitting, dog walking, overnight care, and boarding services across Auckland and New Zealand—all with mandatory daily photo updates
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
            <h2 className="text-3xl font-bold mb-4">Pet Sitting FAQs: Common Questions About Our Service</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get answers to frequently asked questions about booking pet sitters, verification process, payments, and our daily photo update system
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-8">
            {[
              {
                question: 'How are pet sitters verified on ZiggySitters?',
                answer: 'All pet sitters on ZiggySitters complete comprehensive identity verification including passport or driver\'s license validation, and profile validation before joining our platform. We verify their information and ensure they meet our safety and reliability standards.'
              },
              {
                question: 'What happens if a pet sitter doesn\'t send daily updates when requested?',
                answer: 'When pet owners request daily reports during booking, sitters must deliver them. If a sitter fails to send requested daily photo updates and care reports, they face a 15% payment deduction. This accountability system ensures transparency when owners choose to receive updates.'
              },
              {
                question: 'How do payments work for pet sitting services?',
                answer: 'Payments are processed securely through our platform using Stripe. You pay when you book your pet sitter, and the payment is held securely. Sitters receive payment after successful service completion, with full payment when they complete any requested daily reports.'
              },
              {
                question: 'Can I meet the pet sitter before booking?',
                answer: 'Absolutely! We strongly encourage meet and greet sessions so you and your pet can get comfortable with your chosen sitter before the booking starts. This helps ensure a good match and peace of mind.'
              },
              {
                question: 'What pet care services does ZiggySitters offer?',
                answer: 'ZiggySitters offers comprehensive pet care services including dog walking, pet sitting (in-home and at sitter\'s home), overnight care, drop-in visits, pet boarding, and grooming services. All services include mandatory daily photo updates and detailed care reports.'
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
            <Button size="lg" variant="solid-white" className="px-8" onClick={() => navigate('/auth')}>
              Find a Sitter
            </Button>
            <Button variant="outline-white" size="lg" className="px-8" onClick={() => navigate('/auth')}>
              Become a Sitter
            </Button>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}