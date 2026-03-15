import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import iconShield from '@/assets/icons/icon-shield.png';
import iconCamera from '@/assets/icons/icon-camera.png';
import iconHeart from '@/assets/icons/icon-heart.png';
import iconStar from '@/assets/icons/icon-star.png';
import iconPaw from '@/assets/icons/icon-paw.png';

const testimonials = [
  { name: 'Sarah M.', location: 'Auckland', text: "I was so nervous leaving my two cats for the first time. My sitter sent photos every day and even called when Miso was being fussy with food.", rating: 5 },
  { name: 'Tom & Lisa', location: 'Wellington', text: "Our dog Max has separation anxiety. The sitter followed our routine perfectly and Max was actually happy when we got back.", rating: 5 },
  { name: 'Priya K.', location: 'Christchurch', text: "The vetting process gave us confidence. Knowing our sitter had been background checked made all the difference.", rating: 5 },
];

export default function Guarantee() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Our Sitter Guarantee — Your Pet's Safety Comes First | ZiggySitters"
        description="Every ZiggySitters sitter is vetted, background checked, and committed to your pet's safety."
        keywords="pet sitter guarantee nz, safe pet sitting, vetted pet sitters"
        canonical="/guarantee"
      />

      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600&h=800&fit=crop" alt="Pet safety" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        </div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest mb-4 font-body" style={{ color: 'hsl(152 45% 55%)' }}>Our Guarantee</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-[1.1] mb-6 font-display">
              Is My Pet Safe? <span className="text-primary">Absolutely.</span>
            </h1>
            <p className="text-lg text-white/80 font-body mb-8 max-w-xl">
              We know leaving your pet with someone new is a big deal. That's why we've built multiple layers of trust into every booking.
            </p>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-body px-8 py-6 text-lg" onClick={() => navigate('/find-sitters')}>
              Find a Trusted Sitter <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Vetting Process */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">Our process</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">Our Vetting Process</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: iconPaw, title: 'Identity Verification', desc: 'Government ID check and address verification for every sitter.' },
              { icon: iconShield, title: 'Background Check', desc: 'Police vetting to ensure your pet is in safe, trustworthy hands.' },
              { icon: iconHeart, title: 'Pet Experience Review', desc: 'We assess experience with different animals, breeds, and care needs.' },
              { icon: iconStar, title: 'Ongoing Reviews', desc: 'Sitters are rated after every booking. Low ratings trigger re-evaluation.' },
            ].map((step, i) => (
              <Card key={i} className="border border-border shadow-sm hover:shadow-md transition-shadow bg-card">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4"><img src={step.icon} alt="" className="w-12 h-12" /></div>
                  <h3 className="text-lg font-semibold mb-2 text-center font-body text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground text-center font-body">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Insurance & Emergency */}
      <section className="py-20 md:py-28 bg-muted">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border border-border shadow-sm bg-card">
              <CardContent className="p-8">
                <img src={iconShield} alt="" className="w-12 h-12 mb-4" />
                <h3 className="text-2xl font-bold mb-3 font-display text-foreground">Insurance Coverage</h3>
                <p className="text-muted-foreground mb-4 font-body">Every booking is covered. If something unexpected happens, our coverage helps protect both you and your pet.</p>
                <ul className="space-y-2">
                  {['Pet injury coverage during bookings', 'Property damage protection', 'Liability coverage for sitters'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm font-body text-foreground"><Check className="w-4 h-4 text-primary flex-shrink-0" />{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border border-border shadow-sm bg-card">
              <CardContent className="p-8">
                <img src={iconPaw} alt="" className="w-12 h-12 mb-4" />
                <h3 className="text-2xl font-bold mb-3 font-display text-foreground">Emergency Protocols</h3>
                <p className="text-muted-foreground mb-4 font-body">Every sitter knows exactly what to do in an emergency.</p>
                <ul className="space-y-2">
                  {['Vet contact details collected before every booking', 'Sitters trained on emergency procedures', '24/7 ZiggySitters support line', 'Immediate owner notification'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm font-body text-foreground"><Check className="w-4 h-4 text-primary flex-shrink-0" />{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Daily Updates */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <img src={iconCamera} alt="" className="w-14 h-14 mx-auto mb-4" />
          <h2 className="text-3xl font-bold font-display text-foreground mb-4">Daily Photo Updates</h2>
          <p className="text-lg text-muted-foreground mb-6 font-body">
            Missing your pet? Our sitters send you daily photos and updates so you know exactly how your furry friend is doing.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">Testimonials</p>
            <h2 className="text-3xl font-bold font-display text-foreground">What Pet Parents Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <Card key={i} className="border border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex gap-0.5 mb-3">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />))}</div>
                  <p className="text-sm text-muted-foreground mb-4 italic font-body">"{t.text}"</p>
                  <p className="font-semibold text-sm text-foreground font-body">{t.name}</p>
                  <p className="text-xs text-muted-foreground font-body">{t.location}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">Your Pet Deserves the Best Care</h2>
          <p className="text-lg text-secondary-foreground/60 mb-8 max-w-xl mx-auto font-body">Join thousands of NZ pet parents who trust ZiggySitters.</p>
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-body px-10 py-6 text-lg" onClick={() => navigate('/find-sitters')}>
            Find a Sitter Now <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </>
  );
}
