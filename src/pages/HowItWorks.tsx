import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SEOHead from '@/components/seo/SEOHead';
import { Badge } from '@/components/ui/badge';
import iconSearch from '@/assets/icons/icon-search.png';
import { useNavigate } from 'react-router-dom';
import petServices from '@/assets/pet-services-ai-backup.jpg';

import iconShield from '@/assets/icons/icon-shield.png';
import iconCamera from '@/assets/icons/icon-camera.png';
import iconStar from '@/assets/icons/icon-star.png';
import iconHeart from '@/assets/icons/icon-heart.png';
import iconPaw from '@/assets/icons/icon-paw.png';
import iconPayment from '@/assets/icons/icon-payment.png';
import iconHouse from '@/assets/icons/icon-house.png';
import iconBowl from '@/assets/icons/icon-bowl.png';
import iconBoarding from '@/assets/icons/icon-boarding.png';
import iconQuestion from '@/assets/icons/icon-question.png';

const forOwners = [
  { icon: iconPaw, title: 'Search & Browse', description: 'Find verified sitters and choose if you want daily reports' },
  { icon: iconCamera, title: 'Choose Your Updates', description: "Request daily photo reports when booking - it's your choice" },
  { icon: iconHeart, title: 'Peace of Mind', description: 'Get daily updates if requested - sitters are held accountable' },
  { icon: iconShield, title: 'Payment Protection', description: 'When you request reports, sitters must deliver or face 15% deduction' },
];

const forSitters = [
  { icon: iconPaw, title: 'Create Profile', description: 'Sign up and showcase your pet care experience' },
  { icon: iconCamera, title: 'Submit Reports When Requested', description: 'Send daily reports with photos by 9 PM for bookings that request them' },
  { icon: iconStar, title: 'Build Trust', description: 'Reliable reporting builds your reputation - get more bookings' },
  { icon: iconPayment, title: 'Earn Full Payment', description: '100% pay when completing requested reports, 15% deduction if missed' },
];

const safetyFeatures = [
  { icon: iconShield, title: 'Three Trust Levels', description: 'New sitters, ID verified sitters, and gold star sitters (police vet check)' },
  { icon: iconPaw, title: 'Identity Verification Available', description: 'Sitters can verify their ID to earn trust badges and stand out' },
  { icon: iconStar, title: 'Feedback & Ratings', description: 'Transparent feedback system from real pet owners' },
  { icon: iconPayment, title: 'Secure Payments', description: 'Protected payment processing with money-back guarantee' },
];

const services = [
  { title: "Pet Sitting (Sitter's Home)", description: "Your pet stays at sitter's home with full care", price: 'From $30/day', icon: iconHouse },
  { title: 'Pet Sitting (Your Home)', description: 'Sitter stays at your home to care for pets', price: 'From $40/day', icon: iconHouse },
  { title: 'Drop-in Visits', description: 'Pop in to feed, play & give cuddles at your home', price: 'From $20/visit', icon: iconBowl },
  { title: 'Pet Boarding', description: "Your pet stays at the sitter's home", price: 'From $40/night', icon: iconBoarding },
];

export default function HowItWorks() {
  const navigate = useNavigate();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Book a Pet Sitter with Daily Photo Updates",
    "description": "Step-by-step guide on how to find and book verified pet sitters who provide daily photo updates in New Zealand.",
    "totalTime": "PT10M",
    "step": [
      { "@type": "HowToStep", "name": "Search for Pet Sitters", "text": "Browse verified pet sitters in your area", "url": "https://ziggysitters.com/find-sitters" },
      { "@type": "HowToStep", "name": "View Sitter Profiles", "text": "Review sitter profiles, ratings, and feedback" },
      { "@type": "HowToStep", "name": "Book Your Sitter", "text": "Select dates, service type, and choose if you want daily reports" },
      { "@type": "HowToStep", "name": "Receive Daily Updates", "text": "Get daily reports with photos if you requested them" },
    ]
  };

  return (
    <>
      <SEOHead
        title="How It Works: Book Pet Sitters with Optional Daily Updates | ZiggySitters NZ"
        description="Learn how to book verified pet sitters in New Zealand. Choose to receive daily photo updates when booking."
        keywords="how pet sitting works, book pet sitter online, daily pet photo updates, verified pet care NZ"
        canonical="/how-it-works"
        structuredData={structuredData}
      />
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative min-h-[60vh] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <img src={petServices} alt="Pet sitting services" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/30" />
          </div>
          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-widest mb-4 font-body" style={{ color: 'hsl(152 45% 55%)' }}>How it works</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white leading-[1.1] font-display">
                Pet Sitting with Optional Daily Updates
              </h1>
              <p className="text-lg text-white/80 mb-8 max-w-xl font-body">
                New Zealand's flexible pet sitting platform - choose daily photo updates when you want them, with accountability guaranteed
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold px-8 py-6 text-lg" onClick={() => navigate('/find-sitters')}>
                  Find a Sitter <span className="ml-2">→</span>
                </Button>
                <Button size="lg" variant="outline-white" className="font-body px-8 py-6 text-lg" onClick={() => navigate('/become-sitter')}>
                  Become a Sitter
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* For Pet Owners */}
        <section className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">For Pet Owners</p>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">Book a Pet Sitter in 4 Easy Steps</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto font-body">
                Find verified pet sitters across New Zealand. Choose to receive daily photo updates when booking.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {forOwners.map((step, i) => (
                <Card key={i} className="text-center border border-border shadow-sm hover:shadow-md transition-all relative bg-card">
                  <CardContent className="p-8">
                    <div className="flex justify-center mb-4">
                      <img src={step.icon} alt="" className="w-16 h-16" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 font-body text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground font-body">{step.description}</p>
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm font-body">{i + 1}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* For Pet Sitters */}
        <section className="py-20 md:py-28 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">For Pet Sitters</p>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">Earn Money Caring for Pets</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto font-body">
                Join New Zealand's leading pet sitting platform. Deliver reports on time, build trust, and earn competitive rates.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {forSitters.map((step, i) => (
                <Card key={i} className="text-center border border-border shadow-sm hover:shadow-md transition-all relative bg-card">
                  <CardContent className="p-8">
                    <div className="flex justify-center mb-4">
                      <img src={step.icon} alt="" className="w-16 h-16" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 font-body text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground font-body">{step.description}</p>
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-bold text-sm font-body">{i + 1}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Safety & Trust */}
        <section className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">Safety</p>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">Pet Safety & Verified Sitter Trust</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto font-body">
                We prioritize pet safety through identity verification, secure payments, and transparent feedback.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {safetyFeatures.map((feature, i) => (
                <Card key={i} className="text-center border border-border shadow-sm bg-card">
                  <CardContent className="p-8">
                    <div className="flex justify-center mb-4">
                      <img src={feature.icon} alt="" className="w-16 h-16" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 font-body text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground font-body">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Service Types */}
        <section className="py-20 md:py-28 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">Services</p>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">Pet Care Services in New Zealand</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {services.map((service, i) => (
                <Card key={i} className="text-center border border-border bg-card">
                  <CardContent className="p-8">
                    <div className="flex justify-center mb-4">
                      <img src={service.icon} alt="" className="w-14 h-14" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 font-body text-foreground">{service.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 font-body">{service.description}</p>
                    <Badge variant="secondary" className="font-body">{service.price}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="flex justify-center mb-4"><img src={iconQuestion} alt="" className="w-12 h-12" /></div>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">Common Questions</h2>
            </div>
            <div className="max-w-3xl mx-auto space-y-6">
              {[
                { q: 'How are pet sitters verified on ZiggySitters?', a: 'ZiggySitters has three sitter trust levels: New sitters, ID Verified sitters, and Gold Star sitters (completed police vet check). All levels can accept bookings.' },
                { q: "What happens if a sitter doesn't send daily updates?", a: 'When pet owners request daily reports, sitters must deliver. If missed, they face a 15% payment deduction.' },
                { q: 'How do payments work?', a: 'Payments are processed securely through Stripe. You pay when booking, and sitters receive payment after service completion.' },
                { q: 'Can I meet the pet sitter before booking?', a: 'Absolutely. We encourage meet and greet sessions to ensure a good match before the booking starts.' },
              ].map((faq, i) => (
                <Card key={i} className="border border-border bg-card">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-2 font-body">{faq.q}</h3>
                    <p className="text-sm text-muted-foreground font-body">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-secondary text-secondary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-secondary-foreground/60 mb-8 max-w-xl mx-auto font-body">
              Join thousands of NZ pet parents and sitters on ZiggySitters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-body px-10 py-6 text-lg" onClick={() => navigate('/find-sitters')}>
                Find a Sitter <span className="ml-2">→</span>
              </Button>
              <Button size="lg" variant="outline-white" className="font-body px-10 py-6 text-lg" onClick={() => navigate('/become-sitter')}>
                Become a Sitter
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
