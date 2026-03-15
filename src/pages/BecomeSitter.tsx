import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import iconCheck from '@/assets/icons/icon-check.png';
import EarningsCalculator from '@/components/sitter-recruitment/EarningsCalculator';
import SitterLeadForm from '@/components/sitter-recruitment/SitterLeadForm';
import { ga4 } from '@/lib/ga4';
import heroImage from '@/assets/become-sitter-hero.jpg';
import dailyReportImage from '@/assets/sitter-daily-report.jpg';

// Custom pet illustrations
import iconHeart from '@/assets/icons/icon-heart.png';
import iconCamera from '@/assets/icons/icon-camera.png';
import iconShield from '@/assets/icons/icon-shield.png';
import iconStar from '@/assets/icons/icon-star.png';
import iconPaw from '@/assets/icons/icon-paw.png';
import iconLocation from '@/assets/icons/icon-location.png';

const benefits = [
  {
    icon: iconHeart,
    title: 'Do What You Love',
    description: 'Spend your days with dogs and cats. Get paid for walks, cuddles, and being there for pets who need you.',
  },
  {
    icon: iconPaw,
    title: 'Work on Your Terms',
    description: 'Set your own hours and rates. Accept bookings that fit your schedule — no commitments, no pressure.',
  },
  {
    icon: iconCamera,
    title: 'Build Trust with Updates',
    description: 'Share daily photo updates with pet owners. They see the care you provide, you earn 5-star reviews.',
  },
  {
    icon: iconStar,
    title: 'Earn Extra Cash',
    description: 'Most sitters earn $800-$1,200/month part-time. Build your reputation and grow your bookings over time.',
  }
];

const steps = [
  { step: 1, title: 'Create Your Profile', description: 'Tell us about yourself, your experience with pets, and add some photos', icon: iconPaw },
  { step: 2, title: 'Get Verified', description: "Upload your ID for a verified badge — builds instant trust with pet owners", icon: iconShield },
  { step: 3, title: 'Set Your Services', description: "Choose what you offer and set your own rates — you're in control", icon: iconStar },
  { step: 4, title: 'Start Earning', description: 'Accept bookings, care for pets, send updates, and get paid', icon: iconHeart },
];

const HIGH_DEMAND_SUBURBS = [
  { slug: 'grey-lynn', name: 'Grey Lynn' },
  { slug: 'ponsonby', name: 'Ponsonby' },
  { slug: 'mt-eden', name: 'Mt Eden' },
  { slug: 'remuera', name: 'Remuera' },
  { slug: 'herne-bay', name: 'Herne Bay' },
  { slug: 'takapuna', name: 'Takapuna' },
];

export default function BecomeSitter() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source') || 'direct';
    const utmMedium = params.get('utm_medium') || 'none';
    ga4.ctaClick('become_sitter_page_view', `${utmSource}/${utmMedium}`);
  }, []);

  return (
    <>
      <SEOHead 
        title="Become a Pet Sitter — Love Dogs? Earn Extra Cash | ZiggySitters"
        description="Love pets? Earn extra cash looking after dogs and cats in your neighbourhood. Set your own hours, work on your terms. Free to join. ZiggySitters — NZ & Australia."
        keywords="become pet sitter, pet sitting jobs, earn money pet care, pet sitter auckland, pet sitter sunshine coast, love dogs earn money"
        canonical="/become-sitter"
      />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <img src={heroImage} alt="Pet sitter caring for a golden retriever" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/25" />
          </div>
          
          <div className="relative z-10 container mx-auto px-4 py-20 md:py-28">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-widest mb-4 font-body" style={{ color: 'hsl(152 45% 55%)' }}>
                Now accepting sitters in NZ & Sunshine Coast
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white leading-[1.1] font-display">
                <span className="block">Love Dogs?</span>
                <span className="block">Earn Extra Cash.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl leading-relaxed font-body">
                Get paid to hang out with pets in your neighbourhood. Set your own hours, work on your terms, and do what you actually enjoy.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="px-10 py-6 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg font-body"
                  onClick={() => {
                    ga4.clickSignup('become_sitter_hero');
                    document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Join Now — It's Free
                  <span className="ml-2">→</span>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline-white"
                  className="px-8 py-6 text-lg font-body"
                  onClick={() => {
                    ga4.ctaClick('see_earnings', 'become_sitter');
                    document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  See What You Could Earn
                </Button>
              </div>

              <div className="flex flex-wrap gap-4 mt-8 text-sm text-white/70 font-body">
                <span className="flex items-center gap-2"><img src={iconCheck} alt="" className="h-5 w-5" /> Free to join</span>
                <span className="flex items-center gap-2"><img src={iconCheck} alt="" className="h-5 w-5" /> No commitments</span>
                <span className="flex items-center gap-2"><img src={iconCheck} alt="" className="h-5 w-5" /> Set your own rates</span>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <p className="text-primary font-semibold text-sm mb-3 uppercase tracking-widest font-body">Simple Process</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground font-display">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto mt-3 font-body">
                Getting started is simple — you could be earning within the hour
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {steps.map((step, index) => (
                  <div key={index} className="relative group">
                    <Card className="border border-border shadow-sm hover:shadow-md transition-all duration-300 group-hover:-translate-y-1 h-full bg-card">
                      <CardContent className="p-6 text-center">
                        <div className="flex justify-center mb-4">
                          <img src={step.icon} alt="" className="w-16 h-16" />
                        </div>
                        <div className="text-xs font-bold text-primary tracking-widest mb-2 font-body">STEP {step.step}</div>
                        <h3 className="text-lg font-semibold text-foreground mb-2 font-body">{step.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed font-body">{step.description}</p>
                      </CardContent>
                    </Card>
                    {index < steps.length - 1 && (
                      <span className="hidden lg:block absolute top-1/2 -right-3 text-border -translate-y-1/2 z-10 text-xl">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 md:py-28 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <p className="text-primary font-semibold text-sm mb-3 uppercase tracking-widest font-body">Why Join Us</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground font-display">Why people love being a ZiggySitter</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-3 font-body">
                Flexible work doing something you actually enjoy
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group bg-card">
                  <CardContent className="p-0">
                    <div className="flex items-start gap-5 p-6">
                      <div className="flex-shrink-0 group-hover:scale-110 transition-transform">
                        <img src={benefit.icon} alt="" className="w-16 h-16" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-2 font-body">{benefit.title}</h3>
                        <p className="text-muted-foreground leading-relaxed font-body">{benefit.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Daily Reports Section */}
        <section className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-primary font-semibold text-sm mb-3 uppercase tracking-widest font-body">Stand Out</p>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight font-display">
                  Daily Updates That Build Trust
                </h2>
                <div className="space-y-5">
                  {[
                    { icon: iconCamera, title: "Share What You're Already Doing", desc: "Pet owners choose if they want daily updates. When they do, you simply share photos and notes." },
                    { icon: iconStar, title: "Earn Better Reviews", desc: "Owners who see daily updates leave better reviews. Better reviews mean more bookings." },
                    { icon: iconShield, title: "Easy & Quick", desc: "Most sitters complete reports in under 5 minutes. Quick photos and a few notes — that's it." },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-4">
                      <img src={item.icon} alt="" className="w-12 h-12 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-foreground mb-1 font-body">{item.title}</h3>
                        <p className="text-muted-foreground text-sm font-body">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <img src={dailyReportImage} alt="Pet sitter writing daily report" className="w-full h-80 object-cover rounded-2xl shadow-lg border border-border" />
                <Card className="border border-border bg-card shadow-lg -mt-16 mx-4 relative z-10">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <div className="flex justify-center mb-3">
                        <img src={iconShield} alt="" className="w-16 h-16" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground font-body">Accountability Standard</h3>
                      <p className="text-sm text-muted-foreground mt-1 font-body">When updates are requested</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 bg-muted rounded-xl p-3 border border-border">
                        <img src={iconCheck} alt="" className="w-6 h-6 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm text-foreground font-body">Complete all reports</p>
                          <p className="text-xs text-muted-foreground font-body">Earn 100% payment</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-muted rounded-xl p-3 border border-border">
                        <img src={iconPaw} alt="" className="w-6 h-6 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm text-foreground font-body">Miss a requested report</p>
                          <p className="text-xs text-muted-foreground font-body">15% deduction applies</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Earnings Calculator + Lead Form */}
        <section className="py-20 md:py-28 bg-muted" id="get-started">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <p className="text-primary font-semibold text-sm mb-3 uppercase tracking-widest font-body">Your Potential</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground font-display">See What You Could Earn</h2>
              <p className="text-lg text-muted-foreground mt-3 font-body">
                Calculate your potential earnings and get started in minutes
              </p>
            </div>
            
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
              <EarningsCalculator />
              <SitterLeadForm source={referralCode ? `referral_${referralCode}` : 'become_sitter_page'} />
            </div>
            
            {referralCode && (
              <p className="text-center text-sm text-muted-foreground mt-4 font-body">
                You were referred by a friend! You'll both get $20 credit when you complete your first booking.
              </p>
            )}
          </div>
        </section>

        {/* High Demand Suburbs */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <div className="flex justify-center mb-4">
                <img src={iconLocation} alt="" className="w-14 h-14" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground font-display">Pet Sitters Needed in These Areas</h2>
              <p className="text-muted-foreground mt-2 font-body">
                These areas have high demand and need more sitters
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
              {HIGH_DEMAND_SUBURBS.map((suburb) => (
                <Button
                  key={suburb.slug}
                  variant="outline"
                  className="group border-border hover:border-primary/30 hover:bg-primary/5 transition-all font-body"
                  onClick={() => navigate(`/become-sitter/${suburb.slug}`)}
                >
                  {suburb.name}
                  <Badge variant="secondary" className="ml-2 text-xs bg-primary/10 text-primary border-primary/20">
                    High demand
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 md:py-28 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <p className="text-primary font-semibold text-sm mb-3 uppercase tracking-widest font-body">Common Questions</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground font-display">Frequently Asked Questions</h2>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-4">
              {[
                { q: 'How much can I earn?', a: 'Rates vary by service — most sitters charge $30-60/day for pet sitting and $15-25 per dog walk. You set your own prices.' },
                { q: 'Do I need experience?', a: "If you love pets and have spent time around them, you're off to a great start. We match you with bookings that suit your experience." },
                { q: 'Is there a fee to join?', a: "No — it's completely free to create your profile and start receiving booking requests." },
                { q: 'What areas do you cover?', a: 'We cover NZ cities (Auckland, Wellington, Christchurch, Hamilton & more) plus the Sunshine Coast, QLD.' },
              ].map((faq, i) => (
                <Card key={i} className="border border-border shadow-sm bg-card">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-2 font-body">{faq.q}</h3>
                    <p className="text-muted-foreground text-sm font-body">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-secondary text-secondary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">
              Ready to earn doing what you love?
            </h2>
            <p className="text-lg text-secondary-foreground/60 mb-8 max-w-2xl mx-auto font-body">
              Join sitters across New Zealand and Australia who earn extra cash caring for pets.
            </p>
            <Button 
              size="lg" 
              className="px-12 py-6 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg font-body"
              onClick={() => {
                ga4.clickSignup('become_sitter_bottom_cta');
                document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Apply Now — It's Free
              <span className="ml-2">→</span>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
