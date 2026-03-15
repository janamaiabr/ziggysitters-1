import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SEOHead from '@/components/seo/SEOHead';
import { useNavigate } from 'react-router-dom';

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
import iconNum1 from '@/assets/icons/icon-num-1.png';
import iconNum2 from '@/assets/icons/icon-num-2.png';
import iconNum3 from '@/assets/icons/icon-num-3.png';
import iconNum4 from '@/assets/icons/icon-num-4.png';

const numIcons = [iconNum1, iconNum2, iconNum3, iconNum4];

const forOwners = [
  { icon: iconPaw, title: 'Search & Browse', description: 'Find verified sitters near you. Read reviews and view real profiles.' },
  { icon: iconCamera, title: 'Choose Your Updates', description: "Request daily photo reports when booking — it's completely optional." },
  { icon: iconHeart, title: 'Peace of Mind', description: 'Get daily updates when requested — know your pet is happy and safe.' },
  { icon: iconShield, title: 'Payment Protection', description: 'Secure payments via Stripe. Money protected until service is complete.' },
];

const forSitters = [
  { icon: iconPaw, title: 'Create Profile', description: 'Sign up and showcase your pet care experience.' },
  { icon: iconCamera, title: 'Send Updates', description: 'Share daily reports with photos when owners request them.' },
  { icon: iconStar, title: 'Build Trust', description: 'Great updates earn great reviews — grow your bookings over time.' },
  { icon: iconPayment, title: 'Get Paid', description: 'Set your own rates. Secure payments after each booking.' },
];

const safetyFeatures = [
  { icon: iconShield, title: 'ID Verified', description: 'Sitters verify their identity with government-issued ID.' },
  { icon: iconPaw, title: 'Local & Vetted', description: 'Every sitter is a real local person in your community.' },
  { icon: iconStar, title: 'Real Reviews', description: 'Transparent feedback from actual pet owners after bookings.' },
  { icon: iconPayment, title: 'Secure Payments', description: 'Protected payment processing powered by Stripe.' },
];

const services = [
  { title: "Pet Sitting (Sitter's Home)", description: "Your pet stays at sitter's home with full care", icon: iconHouse },
  { title: 'Pet Sitting (Your Home)', description: 'Sitter stays at your home to care for pets', icon: iconHouse },
  { title: 'Drop-in Visits', description: 'Pop in to feed, play & give cuddles at your home', icon: iconBowl },
  { title: 'Pet Boarding', description: "Your pet stays at the sitter's home", icon: iconBoarding },
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
        <section className="bg-secondary py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4 font-body">How it works</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-secondary-foreground leading-[1.1] font-display">
                Book a Local Sitter. Get Daily Updates.
              </h1>
              <p className="text-lg text-secondary-foreground/70 mb-8 max-w-xl mx-auto font-body">
                Find verified pet sitters near you. Choose daily photo updates when you want them.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
                <Card key={i} className="text-center border border-border shadow-sm hover:shadow-md transition-all relative bg-card pt-4">
                  <CardContent className="p-8">
                    <div className="absolute -top-5 -left-3">
                      <img src={numIcons[i]} alt={`Step ${i + 1}`} className="w-12 h-12" />
                    </div>
                    <div className="flex justify-center mb-4">
                      <img src={step.icon} alt="" className="w-16 h-16" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 font-body text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground font-body">{step.description}</p>
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
                Join as a pet sitter. Set your own rates, accept bookings that fit your schedule.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {forSitters.map((step, i) => (
                <Card key={i} className="text-center border border-border shadow-sm hover:shadow-md transition-all relative bg-card pt-4">
                  <CardContent className="p-8">
                    <div className="absolute -top-5 -left-3">
                      <img src={numIcons[i]} alt={`Step ${i + 1}`} className="w-12 h-12" />
                    </div>
                    <div className="flex justify-center mb-4">
                      <img src={step.icon} alt="" className="w-16 h-16" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 font-body text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground font-body">{step.description}</p>
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
              <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">Your Pet's Safety Comes First</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto font-body">
                We prioritize pet safety through identity verification, secure payments, and transparent reviews.
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
              <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">Pet Care Services</h2>
              <p className="text-muted-foreground max-w-xl mx-auto font-body">Every sitter sets their own rates. Browse profiles to compare.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {services.map((service, i) => (
                <Card key={i} className="text-center border border-border bg-card">
                  <CardContent className="p-8">
                    <div className="flex justify-center mb-4">
                      <img src={service.icon} alt="" className="w-16 h-16" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 font-body text-foreground">{service.title}</h3>
                    <p className="text-sm text-muted-foreground font-body">{service.description}</p>
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
              <div className="flex justify-center mb-4"><img src={iconQuestion} alt="" className="w-14 h-14" /></div>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">Common Questions</h2>
            </div>
            <div className="max-w-3xl mx-auto space-y-6">
              {[
                { q: 'How are pet sitters verified?', a: 'Sitters verify their identity with government-issued ID. Some also complete police vet checks for an additional trust badge.' },
                { q: "What happens if a sitter doesn't send daily updates?", a: "Daily reports are optional — you choose when booking. When requested, sitters are expected to complete them as part of the booking agreement." },
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
        <section className="py-24 bg-secondary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 text-secondary-foreground">Ready to Get Started?</h2>
            <p className="text-lg text-secondary-foreground/70 mb-8 max-w-xl mx-auto font-body">
              Find an affordable, trusted local sitter — or earn extra cash caring for pets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-body px-10 py-6 text-lg" onClick={() => navigate('/find-sitters')}>
                Find a Sitter <span className="ml-2">→</span>
              </Button>
              <Button size="lg" variant="outline-white" className="font-body px-10 py-6 text-lg" onClick={() => navigate('/become-sitter')}>
                Become a Sitter — It's Free
              </Button>
            </div>
            <p className="text-sm text-secondary-foreground/50 mt-4 font-body">
              Free to join · No payment until you book · Cancel anytime
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
