import { useNavigate, useSearchParams } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Heart, DollarSign, Calendar, Shield, Star, ArrowRight, MapPin, Users, Sparkles, Camera, Clock } from 'lucide-react';
import EarningsCalculator from '@/components/sitter-recruitment/EarningsCalculator';
import SitterLeadForm from '@/components/sitter-recruitment/SitterLeadForm';
import { ga4 } from '@/lib/ga4';

const benefits = [
  {
    icon: Heart,
    title: 'Matched to Your Specialty',
    description: 'Get paired with pets that fit your experience — anxious rescues, energetic pups, senior cats, and more',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Calendar,
    title: '78% Rebook Rate',
    description: "When you're matched well, owners come back. Build lasting relationships with your favourite pets",
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Shield,
    title: 'Daily Updates Showcase Your Care',
    description: "Morning and evening reports let owners see the bond you're building — earning trust and 5-star reviews",
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: DollarSign,
    title: 'Earn What You\'re Worth',
    description: 'Set your own rates, grow your reputation, and build a career doing what you love',
    color: 'from-emerald-500 to-teal-500',
  }
];

const steps = [
  { step: 1, title: 'Create Your Profile', description: 'Tell us about yourself, your experience, and upload photos', icon: Users },
  { step: 2, title: 'Start Earning Immediately', description: "Set services and rates — you're bookable right away!", icon: Sparkles },
  { step: 3, title: 'Get Verified (Optional)', description: 'Upload ID for verified badge, or police vet for gold star', icon: Shield },
  { step: 4, title: 'Build Your Reputation', description: 'Complete bookings, earn reviews, and gain trust badges', icon: Star },
];

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
        {/* Hero Section — Bold gradient with asymmetric layout */}
        <section className="relative min-h-[80vh] flex items-center overflow-hidden">
          {/* Rich gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary" />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 20% 80%, hsl(330 80% 60%) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(221 83% 53%) 0%, transparent 50%)',
          }} />
          {/* Decorative shapes */}
          <div className="absolute top-10 right-10 w-64 h-64 border border-white/10 rounded-full" />
          <div className="absolute bottom-20 left-20 w-40 h-40 border border-white/10 rounded-full" />
          <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full blur-xl" />

          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="max-w-4xl mx-auto text-center animate-fade-in">
              <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30 text-sm px-4 py-1.5">
                <Heart className="w-4 h-4 mr-2 inline fill-white" />
                For people who truly love animals
              </Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-white">
                <span className="block">Every Pet Deserves</span>
                <span className="block text-white/90">Someone Like You</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-6 max-w-3xl mx-auto leading-relaxed">
                You already love animals. Turn that into something meaningful — join pet owners across New Zealand who trust ZiggySitters to find caring, reliable people like you.
              </p>

              {/* Social proof row */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
                  <Users className="w-4 h-4" />
                  <span>50+ sitters across NZ</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>4.9 average rating</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
                  <Shield className="w-4 h-4" />
                  <span>Verified &amp; trusted</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="px-12 py-6 text-lg font-semibold bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                  onClick={() => {
                    ga4.clickSignup('become_sitter_hero');
                    navigate('/auth');
                  }}
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="px-8 py-6 text-lg border-white/30 text-white hover:bg-white/10"
                  onClick={() => {
                    ga4.ctaClick('see_earnings', 'become_sitter');
                    document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  See What You Could Earn
                </Button>
              </div>

              <p className="mt-6 text-sm text-white/60">
                Free to join • No commitments • Set your own hours &amp; rates
              </p>
            </div>
          </div>
        </section>

        {/* How It Works — Timeline style */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 text-primary border-primary/30">Simple Process</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Getting started is simple — you could be earning within the hour
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {steps.map((step, index) => (
                  <div key={index} className="relative group">
                    <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 h-full bg-card">
                      <CardContent className="p-6 text-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-secondary text-white rounded-2xl mb-4 font-bold text-lg shadow-lg">
                          {step.step}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                      </CardContent>
                    </Card>
                    {index < steps.length - 1 && (
                      <ArrowRight className="hidden lg:block absolute top-1/2 -right-3 w-6 h-6 text-primary/40 -translate-y-1/2 z-10" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section — Colorful gradient cards */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 text-primary border-primary/30">Why Join Us</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Become a ZiggySitter?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join our community of trusted pet sitters and enjoy flexible, rewarding work
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <CardContent className="p-0">
                    <div className="flex items-start gap-5 p-6">
                      <div className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${benefit.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <benefit.icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Daily Reports Section — Split layout */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left — Text */}
              <div>
                <Badge variant="outline" className="mb-4 text-primary border-primary/30">Our Quality Promise</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Daily Reports: Optional, But Guaranteed When Requested
                </h2>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Camera className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Pet Owners Choose, You Deliver</h3>
                      <p className="text-muted-foreground text-sm">Not every booking requires daily reports — owners choose. When they do, you simply share what you're already doing.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Star className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">More Bookings, Better Reviews</h3>
                      <p className="text-muted-foreground text-sm">This flexibility means more bookings for you and happier clients who leave 5-star reviews.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">98% Completion Rate</h3>
                      <p className="text-muted-foreground text-sm">When reports are requested, nearly all our sitters complete them without issue.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right — Visual card */}
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 shadow-xl">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-secondary text-white rounded-3xl mb-4 shadow-lg">
                      <Shield className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold">The 15% Accountability Standard</h3>
                    <p className="text-sm text-muted-foreground mt-1">Only when reports are requested</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 bg-background/80 rounded-xl p-4 border border-border">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Complete all reports</p>
                        <p className="text-xs text-muted-foreground">Earn 100% payment</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-background/80 rounded-xl p-4 border border-border">
                      <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Miss a requested report</p>
                        <p className="text-xs text-muted-foreground">15% deduction applies</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 bg-primary/5 rounded-xl p-4 border border-primary/10">
                    <p className="text-sm text-center text-muted-foreground">
                      ✨ Many bookings don't require reports — perfect for experienced owners or short stays
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Earnings Calculator + Lead Form */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5" id="get-started">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4 text-primary border-primary/30">Your Potential</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">See What You Could Earn</h2>
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
        </section>

        {/* High Demand Suburbs */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">🔥 Pet Sitters Needed in These Areas</h2>
              <p className="text-muted-foreground">
                These Auckland suburbs have high demand and need more sitters
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
              {HIGH_DEMAND_SUBURBS.map((suburb) => (
                <Button
                  key={suburb.slug}
                  variant="outline"
                  className="group hover:border-primary/50 hover:bg-primary/5 transition-all"
                  onClick={() => navigate(`/become-sitter/${suburb.slug}`)}
                >
                  <MapPin className="w-4 h-4 mr-2 text-primary" />
                  {suburb.name}
                  <Badge variant="secondary" className="ml-2 text-xs bg-primary/10 text-primary">
                    {suburb.searches}+/mo
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories — with colored accents */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4 text-primary border-primary/30">Real Stories</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Success Stories</h2>
              <p className="text-lg text-muted-foreground">
                Hear from our amazing pet sitters
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                { name: 'Sarah M.', earnings: '$800/month', quote: "I love spending time with dogs and earning extra income. ZiggySitters has been amazing!", color: 'from-pink-500 to-rose-500' },
                { name: 'Mike T.', earnings: '$1,200/month', quote: 'The flexible schedule works perfectly with my day job. Great platform and support.', color: 'from-violet-500 to-purple-500' },
                { name: 'Emma L.', earnings: '$950/month', quote: "Being a ZiggySitter has been so rewarding. I get to help pet owners while doing what I love.", color: 'from-blue-500 to-cyan-500' },
              ].map((story, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                  <div className={`h-1.5 bg-gradient-to-r ${story.color}`} />
                  <CardContent className="p-8 text-center">
                    <div className="flex justify-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 italic leading-relaxed">"{story.quote}"</p>
                    <div className="space-y-2">
                      <p className="font-semibold">{story.name}</p>
                      <Badge className={`bg-gradient-to-r ${story.color} text-white border-0`}>{story.earnings}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Pet Sitting Journey?</h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Join hundreds of sitters across New Zealand who are earning while doing what they love.
            </p>
            <Button 
              size="lg" 
              className="px-12 py-6 text-lg font-semibold bg-white text-primary hover:bg-white/90 shadow-xl"
              onClick={() => {
                ga4.clickSignup('become_sitter_bottom_cta');
                navigate('/auth');
              }}
            >
              Apply Now — It's Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
