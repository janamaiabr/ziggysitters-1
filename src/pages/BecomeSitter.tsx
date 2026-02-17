import { useNavigate, useSearchParams } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Heart, DollarSign, Calendar, Shield, Star, ArrowRight, MapPin } from 'lucide-react';
import EarningsCalculator from '@/components/sitter-recruitment/EarningsCalculator';
import SitterLeadForm from '@/components/sitter-recruitment/SitterLeadForm';

const benefits = [
  {
    icon: Heart,
    title: 'Matched to Your Specialty',
    description: 'Get paired with pets that fit your experience — anxious rescues, energetic pups, senior cats, and more'
  },
  {
    icon: Calendar,
    title: '78% Rebook Rate',
    description: 'When you\'re matched well, owners come back. Build lasting relationships with your favourite pets'
  },
  {
    icon: Shield,
    title: 'Daily Updates Showcase Your Care',
    description: 'Morning and evening reports let owners see the bond you\'re building — earning trust and 5-star reviews'
  },
  {
    icon: DollarSign,
    title: 'Earn What You\'re Worth',
    description: 'Set your own rates, grow your reputation, and build a career doing what you love'
  }
];

const steps = [
  {
    step: 1,
    title: 'Create Your Profile',
    description: 'Tell us about yourself, your experience, and upload photos'
  },
  {
    step: 2,
    title: 'Start Earning Immediately',
    description: 'Set services and rates - you\'re bookable right away!'
  },
  {
    step: 3,
    title: 'Get Verified (Optional)',
    description: 'Upload ID for verified badge, or police vet for gold star'
  },
  {
    step: 4,
    title: 'Build Your Reputation',
    description: 'Complete bookings, earn reviews, and gain trust badges'
  }
];

// High-demand suburbs for linking
const HIGH_DEMAND_SUBURBS = [
  { slug: 'grey-lynn', name: 'Grey Lynn', searches: 45 },
  { slug: 'ponsonby', name: 'Ponsonby', searches: 52 },
  { slug: 'mt-eden', name: 'Mt Eden', searches: 38 },
  { slug: 'remuera', name: 'Remuera', searches: 48 },
  { slug: 'herne-bay', name: 'Herne Bay', searches: 32 },
  { slug: 'takapuna', name: 'Takapuna', searches: 41 },
];

export default function BecomeSitter() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');

  return (
    <>
      <SEOHead 
        title="Become a Pet Sitter - Earn Money Caring for Pets | ZiggySitters"
        description="Join ZiggySitters as a verified pet sitter. Earn money providing pet care - send daily reports when owners request them. Apply now to start your pet sitting career in Auckland."
        keywords="become pet sitter, pet sitting jobs Auckland, earn money pet care, verified pet sitter application"
        canonical="/become-sitter"
      />
      <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <Badge variant="secondary" className="mb-6">
              <Heart className="w-4 h-4 mr-2 inline" />
              Join Our Community
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
              <span className="block">Work With the Pets</span>
              <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                You{"'"}re Meant For
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Get matched to pets that fit your experience and style — build real bonds, not just bookings
            </p>
            <Button 
              size="lg" 
              className="px-12 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              onClick={() => navigate('/auth')}
            >
              Join Now
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <div className="py-10 bg-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Become a ZiggySitter?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join our community of trusted pet sitters and enjoy the benefits of flexible, rewarding work
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                    <benefit.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Reports Accountability Section */}
      <div className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">Our Commitment to Quality</Badge>
              <h2 className="text-3xl font-bold mb-4">Daily Reports: Optional, But Guaranteed When Requested</h2>
              <p className="text-lg text-muted-foreground">
                Pet owners choose whether to request daily updates - when they do, you deliver. It's that simple.
              </p>
            </div>
            
            <Card className="border-2 border-primary/20">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Pet Owners Choose, You Deliver</h3>
                      <p className="text-muted-foreground">
                        Not every booking requires daily reports - pet owners choose at booking time. When they do request reports, you simply share what you're already doing. It's optional, but accountable.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Why Pet Owners Choose ZiggySitters</h3>
                      <p className="text-muted-foreground">
                        Pet owners love having the <strong>option</strong> to request daily photo updates - and knowing you'll deliver when they do. This flexibility and accountability means more bookings for you and happier clients who leave 5-star reviews.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">The 15% Accountability Standard (When Reports Are Requested)</h3>
                      <p className="text-muted-foreground mb-3">
                        For bookings where owners request daily updates, we have a simple policy: complete all requested daily reports and earn <strong>100% payment</strong>. Miss a requested report, and there's a 15% deduction.
                      </p>
                      <p className="text-muted-foreground">
                        This only applies when reports are requested—giving pet owners control and you accountability. When you consistently deliver requested reports, you build trust, get better reviews, and earn more repeat bookings.
                      </p>
                    </div>
                  </div>

                  <div className="bg-primary/5 rounded-lg p-6 mt-6">
                    <p className="text-center font-semibold text-lg mb-2">
                      ✨ The Reality: It's Your Choice Too
                    </p>
                    <p className="text-center text-muted-foreground">
                      Many bookings don't require daily reports—perfect for experienced owners or short stays. When reports are requested, 98% of our sitters complete them without issue. You get the flexibility, owners get the choice, everyone wins.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Getting started is simple and straightforward
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center relative">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-full mb-6 font-bold text-lg">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                  {index < steps.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute top-6 -right-4 w-6 h-6 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Calculator + Lead Form Section */}
      <div className="py-20 bg-accent/5" id="get-started">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">See What You Could Earn</h2>
            <p className="text-lg text-muted-foreground">
              Calculate your potential earnings and get started in minutes
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            <EarningsCalculator />
            <SitterLeadForm source={referralCode ? `referral_${referralCode}` : 'become_sitter_page'} />
          </div>
          
          {referralCode && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              You were referred by a friend! You'll both get $20 credit when you complete your first booking.
            </p>
          )}
        </div>
      </div>

      {/* High Demand Suburbs */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-3">Pet Sitters Needed in These Areas</h2>
            <p className="text-muted-foreground">
              These Auckland suburbs have high demand and need more sitters
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {HIGH_DEMAND_SUBURBS.map((suburb) => (
              <Button
                key={suburb.slug}
                variant="outline"
                className="group"
                onClick={() => navigate(`/become-sitter/${suburb.slug}`)}
              >
                <MapPin className="w-4 h-4 mr-2 text-primary" />
                {suburb.name}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {suburb.searches}+/mo
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Success Stories */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
            <p className="text-lg text-muted-foreground">
              Hear from our amazing pet sitters
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Sarah M.',
                earnings: '$800/month',
                quote: 'I love spending time with dogs and earning extra income. ZiggySitters has been amazing!',
                rating: 5
              },
              {
                name: 'Mike T.',
                earnings: '$1,200/month',
                quote: 'The flexible schedule works perfectly with my day job. Great platform and support.',
                rating: 5
              },
              {
                name: 'Emma L.',
                earnings: '$950/month',
                quote: 'Being a ZiggySitter has been so rewarding. I get to help pet owners while doing what I love.',
                rating: 5
              }
            ].map((story, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-8">
                  <div className="flex justify-center mb-4">
                    {[...Array(story.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">"{story.quote}"</p>
                  <div className="space-y-2">
                    <p className="font-semibold">{story.name}</p>
                    <Badge variant="secondary">{story.earnings}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}