import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Heart, DollarSign, Calendar, Shield, Star, ArrowRight, MapPin, Users, Camera, Clock } from 'lucide-react';
import EarningsCalculator from '@/components/sitter-recruitment/EarningsCalculator';
import SitterLeadForm from '@/components/sitter-recruitment/SitterLeadForm';
import { ga4 } from '@/lib/ga4';
import heroImage from '@/assets/become-sitter-hero.jpg';
import dailyReportImage from '@/assets/sitter-daily-report.jpg';

const benefits = [
  {
    icon: Heart,
    title: 'Do What You Love',
    description: 'Spend your days with dogs and cats. Get paid for walks, cuddles, and being there for pets who need you.',
  },
  {
    icon: Calendar,
    title: 'Work on Your Terms',
    description: 'Set your own hours and rates. Accept bookings that fit your schedule — no commitments, no pressure.',
  },
  {
    icon: Camera,
    title: 'Build Trust with Updates',
    description: 'Share daily photo updates with pet owners. They see the care you provide, you earn 5-star reviews.',
  },
  {
    icon: DollarSign,
    title: 'Earn Extra Cash',
    description: 'Most sitters earn $800–$1,200/month part-time. Build your reputation and grow your bookings over time.',
  }
];

const steps = [
  { step: 1, title: 'Create Your Profile', description: 'Tell us about yourself, your experience with pets, and add some photos', icon: Users },
  { step: 2, title: 'Get Verified', description: 'Upload your ID for a verified badge — builds instant trust with pet owners', icon: Shield },
  { step: 3, title: 'Set Your Services', description: 'Choose what you offer and set your own rates — you\'re in control', icon: Star },
  { step: 4, title: 'Start Earning', description: 'Accept bookings, care for pets, send updates, and get paid', icon: DollarSign },
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
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-[#f8faf8] border-b border-gray-100">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left — Copy */}
              <div className="animate-fade-in text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                  <Heart className="w-4 h-4 fill-emerald-600" />
                  Now accepting sitters in NZ & Sunshine Coast
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-gray-900 leading-[1.1]">
                  <span className="block">Love Dogs?</span>
                  <span className="block text-emerald-600">Earn Extra Cash.</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-6 max-w-xl leading-relaxed mx-auto lg:mx-0">
                  Get paid to hang out with pets in your neighbourhood. Set your own hours, work on your terms, and do what you actually enjoy.
                </p>

                <div className="flex flex-wrap items-center gap-3 mb-8 justify-center lg:justify-start">
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Set your own hours</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>NZ & QLD areas</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button 
                    size="lg" 
                    className="px-10 py-6 text-lg font-semibold bg-gray-900 text-white hover:bg-gray-800 shadow-lg"
                    onClick={() => {
                      ga4.clickSignup('become_sitter_hero');
                      document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Join Now — It's Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="px-8 py-6 text-lg border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      ga4.ctaClick('see_earnings', 'become_sitter');
                      document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    See What You Could Earn
                  </Button>
                </div>

                <p className="mt-6 text-sm text-gray-500">
                  Free to join • No commitments • Set your own hours & rates
                </p>
              </div>

              {/* Right — Photos grid */}
              <div className="relative hidden lg:block">
                <div className="grid grid-cols-2 gap-4">
                  <img 
                    src={heroImage} 
                    alt="Pet sitter caring for a golden retriever" 
                    className="w-full h-72 object-cover rounded-2xl shadow-lg border border-gray-200" 
                  />
                  <img 
                    src={dailyReportImage} 
                    alt="Sitter writing daily report with pets" 
                    className="w-full h-72 object-cover rounded-2xl shadow-lg border border-gray-200 mt-8" 
                  />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-xl shadow-lg px-6 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-gray-900">$800–$1,200</p>
                    <p className="text-xs text-gray-500">avg. monthly earnings</p>
                  </div>
                </div>
              </div>

              {/* Mobile — Single hero image */}
              <div className="relative lg:hidden">
                <img 
                  src={heroImage} 
                  alt="Pet sitter caring for a golden retriever" 
                  className="w-full h-64 object-cover rounded-2xl shadow-lg border border-gray-200" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-emerald-600 font-medium text-sm mb-2">Simple Process</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-lg text-gray-500 max-w-xl mx-auto">
                Getting started is simple — you could be earning within the hour
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {steps.map((step, index) => (
                  <div key={index} className="relative group">
                    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group-hover:-translate-y-1 h-full bg-white">
                      <CardContent className="p-6 text-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl mb-4 font-bold text-lg">
                          {step.step}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                      </CardContent>
                    </Card>
                    {index < steps.length - 1 && (
                      <ArrowRight className="hidden lg:block absolute top-1/2 -right-3 w-6 h-6 text-gray-300 -translate-y-1/2 z-10" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-[#fafbfa] border-y border-gray-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-emerald-600 font-medium text-sm mb-2">Why Join Us</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why people love being a ZiggySitter</h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Flexible work doing something you actually enjoy
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group bg-white">
                  <CardContent className="p-0">
                    <div className="flex items-start gap-5 p-6">
                      <div className="flex-shrink-0 w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <benefit.icon className="w-7 h-7 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                        <p className="text-gray-500 leading-relaxed">{benefit.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Daily Reports Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-emerald-600 font-medium text-sm mb-2">Stand Out</p>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                  Daily Updates That Build Trust
                </h2>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <Camera className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Share What You're Already Doing</h3>
                      <p className="text-gray-500 text-sm">Pet owners choose if they want daily updates. When they do, you simply share photos and notes.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <Star className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Earn Better Reviews</h3>
                      <p className="text-gray-500 text-sm">Owners who see daily updates leave better reviews. Better reviews mean more bookings.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">98% Completion Rate</h3>
                      <p className="text-gray-500 text-sm">When reports are requested, nearly all our sitters complete them without issue.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <img src={dailyReportImage} alt="Pet sitter writing daily report" className="w-full h-80 object-cover rounded-2xl shadow-lg border border-gray-200" />
                <Card className="border border-gray-200 bg-white shadow-lg -mt-16 mx-4 relative z-10">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl mb-3">
                        <Shield className="w-7 h-7" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Accountability Standard</h3>
                      <p className="text-sm text-gray-500 mt-1">When updates are requested</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 bg-[#fafbfa] rounded-xl p-3 border border-gray-100">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm text-gray-900">Complete all reports</p>
                          <p className="text-xs text-gray-500">Earn 100% payment</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-[#fafbfa] rounded-xl p-3 border border-gray-100">
                        <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm text-gray-900">Miss a requested report</p>
                          <p className="text-xs text-gray-500">15% deduction applies</p>
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
        <section className="py-20 bg-[#fafbfa] border-y border-gray-100" id="get-started">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <p className="text-emerald-600 font-medium text-sm mb-2">Your Potential</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">See What You Could Earn</h2>
              <p className="text-lg text-gray-500">
                Calculate your potential earnings and get started in minutes
              </p>
            </div>
            
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
              <EarningsCalculator />
              <SitterLeadForm source={referralCode ? `referral_${referralCode}` : 'become_sitter_page'} />
            </div>
            
            {referralCode && (
              <p className="text-center text-sm text-gray-500 mt-4">
                You were referred by a friend! You'll both get $20 credit when you complete your first booking.
              </p>
            )}
          </div>
        </section>

        {/* High Demand Suburbs */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">🔥 Pet Sitters Needed in These Areas</h2>
              <p className="text-gray-500">
                These areas have high demand and need more sitters
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
              {HIGH_DEMAND_SUBURBS.map((suburb) => (
                <Button
                  key={suburb.slug}
                  variant="outline"
                  className="group border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
                  onClick={() => navigate(`/become-sitter/${suburb.slug}`)}
                >
                  <MapPin className="w-4 h-4 mr-2 text-emerald-600" />
                  {suburb.name}
                  <Badge variant="secondary" className="ml-2 text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                    {suburb.searches}+/mo
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-[#fafbfa] border-t border-gray-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <p className="text-emerald-600 font-medium text-sm mb-2">Common Questions</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-4">
              {[
                { q: 'How much can I earn?', a: 'Rates vary by service — most sitters charge $30-60/day for pet sitting and $15-25 per dog walk. You set your own prices.' },
                { q: 'Do I need experience?', a: 'If you love pets and have spent time around them, you\'re off to a great start. We match you with bookings that suit your experience.' },
                { q: 'Is there a fee to join?', a: 'No — it\'s completely free to create your profile and start receiving booking requests.' },
                { q: 'What areas do you cover?', a: 'We cover NZ cities (Auckland, Wellington, Christchurch, Hamilton & more) plus the Sunshine Coast, QLD.' },
              ].map((faq, i) => (
                <Card key={i} className="border border-gray-200 shadow-sm bg-white">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                    <p className="text-gray-500 text-sm">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to earn doing what you <span className="text-emerald-400">love</span>?
            </h2>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Join sitters across New Zealand and Australia who earn extra cash caring for pets.
            </p>
            <Button 
              size="lg" 
              className="px-12 py-6 text-lg font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg"
              onClick={() => {
                ga4.clickSignup('become_sitter_bottom_cta');
                document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' });
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
