import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, CheckCircle, Phone, Camera, UserCheck, Heart, Star, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Guarantee() {
  const navigate = useNavigate();

  const testimonials = [
    {
      name: 'Sarah M.',
      location: 'Auckland',
      text: "I was so nervous leaving my two cats for the first time. My sitter sent photos every day and even called when Miso was being fussy with food. I'll never use anyone else.",
      rating: 5,
    },
    {
      name: 'Tom & Lisa',
      location: 'Wellington',
      text: "Our dog Max has separation anxiety and we were terrified. The sitter followed our routine perfectly and Max was actually happy when we got back. That says everything.",
      rating: 5,
    },
    {
      name: 'Priya K.',
      location: 'Christchurch',
      text: "The vetting process gave us confidence. Knowing our sitter had been background checked and reviewed by other pet parents made all the difference.",
      rating: 5,
    },
  ];

  return (
    <>
      <SEOHead
        title="Our Sitter Guarantee — Your Pet's Safety Comes First | ZiggySitters"
        description="Every ZiggySitters sitter is vetted, background checked, and committed to your pet's safety. Learn about our vetting process, insurance, and emergency protocols."
        keywords="pet sitter guarantee nz, safe pet sitting, vetted pet sitters, pet sitting insurance nz, trusted pet care"
        canonical="/guarantee"
      />

      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-green-50 via-blue-50 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 border border-green-200 rounded-full px-4 py-2 mb-6">
            <Shield className="w-4 h-4 text-green-700" />
            <span className="text-sm font-medium text-green-700">ZiggySitters Guarantee</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Is My Pet Safe? <span className="text-primary">Absolutely.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            We know leaving your pet with someone new is a big deal. That's why we've built
            multiple layers of trust and safety into every ZiggySitters booking.
          </p>
          <Button size="lg" onClick={() => navigate('/find-sitters')} className="gap-2 text-lg px-8 py-6">
            Find a Trusted Sitter
          </Button>
        </div>
      </section>

      {/* Vetting Process */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Our Vetting Process</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Not just anyone can become a ZiggySitters sitter. Every applicant goes through a thorough
            multi-step process before they can care for your pet.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: <UserCheck className="w-7 h-7 text-primary" />,
                title: 'Identity Verification',
                desc: 'Government ID check and address verification for every sitter.',
              },
              {
                icon: <Shield className="w-7 h-7 text-primary" />,
                title: 'Background Check',
                desc: 'Police vetting to ensure your pet is in safe, trustworthy hands.',
              },
              {
                icon: <Heart className="w-7 h-7 text-primary" />,
                title: 'Pet Experience Review',
                desc: 'We assess experience with different animals, breeds, and care needs.',
              },
              {
                icon: <Star className="w-7 h-7 text-primary" />,
                title: 'Ongoing Reviews',
                desc: 'Sitters are rated after every booking. Low ratings trigger re-evaluation.',
              },
            ].map((step, i) => (
              <Card key={i} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6 pb-5 px-5">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Insurance & Emergency */}
      <section className="py-16 md:py-20 bg-accent/10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Insurance */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <Shield className="w-10 h-10 text-green-600 mb-4" />
                <h3 className="text-2xl font-bold mb-3">Insurance Coverage</h3>
                <p className="text-muted-foreground mb-4">
                  Every booking through ZiggySitters is covered. If something unexpected happens
                  during a sitting, our coverage helps protect both you and your pet.
                </p>
                <ul className="space-y-2">
                  {['Pet injury coverage during bookings', 'Property damage protection', 'Liability coverage for sitters'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Emergency Protocols */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <AlertTriangle className="w-10 h-10 text-orange-500 mb-4" />
                <h3 className="text-2xl font-bold mb-3">Emergency Protocols</h3>
                <p className="text-muted-foreground mb-4">
                  Every sitter knows exactly what to do in an emergency. We have clear protocols
                  and 24/7 support to handle any situation.
                </p>
                <ul className="space-y-2">
                  {[
                    'Vet contact details collected before every booking',
                    'Sitters trained on emergency procedures',
                    '24/7 ZiggySitters support line',
                    'Immediate owner notification for any concern',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Daily Updates */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Camera className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Daily Photo Updates</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Missing your pet? Our sitters can send you daily photos and updates so you know
            exactly how your furry friend is doing. It's like FaceTime, but fluffier.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="bg-primary/5 rounded-xl p-4 flex items-center gap-3">
              <Camera className="w-5 h-5 text-primary" />
              <span className="font-medium">Photos of walks & playtime</span>
            </div>
            <div className="bg-primary/5 rounded-xl p-4 flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary" />
              <span className="font-medium">Direct messaging with sitter</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20 bg-accent/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">What Pet Parents Say</h2>
          <p className="text-center text-muted-foreground mb-12">
            Don't just take our word for it — hear from real NZ pet parents.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">"{t.text}"</p>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.location}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Your Pet Deserves the Best Care</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join thousands of NZ pet parents who trust ZiggySitters with their furry family members.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => navigate('/find-sitters')} className="gap-2">
              Find a Sitter Now
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/how-it-works')} className="gap-2 border-white text-white hover:bg-white/10">
              How It Works
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
