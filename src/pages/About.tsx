import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import iconSearch from '@/assets/icons/icon-search.png';
import { useNavigate } from 'react-router-dom';

import iconHeart from '@/assets/icons/icon-heart.png';
import iconShield from '@/assets/icons/icon-shield.png';
import iconStar from '@/assets/icons/icon-star.png';
import iconCommunity from '@/assets/icons/icon-community.png';

const values = [
  { icon: iconHeart, title: 'Love for Animals', description: 'Every team member and sitter shares a genuine love for pets and their wellbeing.' },
  { icon: iconShield, title: 'Trust & Safety', description: 'ID verification and transparent reviews ensure your pet is always in safe hands.' },
  { icon: iconStar, title: 'Quality Service', description: 'We maintain high standards through rigorous vetting and continuous feedback.' },
  { icon: iconCommunity, title: 'Community', description: 'Building a trusted community where pet lovers can connect and support each other.' },
];

const team = [
  {
    name: 'Jana Maia', role: 'Co-Founder',
    bio: "Pet parent to a high-needs rescue dog requiring daily medication. Understands the challenges of finding reliable care for special-needs animals.",
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b9c5?w=150&h=150&fit=crop&crop=face'
  },
  {
    name: 'Rachel Nottingham', role: 'Co-Founder',
    bio: "Experienced with anxious and reactive pets. Rachel's background in animal behavior helps ensure our platform serves pets with unique needs.",
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  }
];

export default function About() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="About ZiggySitters - Founded by Pet Parents | ZiggySitters"
        description="Learn about ZiggySitters' founders who created the platform for pets requiring specialized care and daily updates."
        keywords="about ZiggySitters, pet care founders, Auckland pet care"
        canonical="/about"
      />
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative min-h-[50vh] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1600&h=800&fit=crop" alt="Pets" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          </div>
          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-widest mb-4 font-body" style={{ color: 'hsl(152 45% 55%)' }}>Our Story</p>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-[1.1] font-display mb-6">About ZiggySitters</h1>
              <p className="text-lg text-white/80 font-body max-w-xl">
                We're on a mission to create a world where every pet receives the love and care they deserve, even when their parents can't be there.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">How we started</p>
                <h2 className="text-3xl font-bold font-display text-foreground mb-6">Born from High-Needs Pet Parents</h2>
                <div className="space-y-4 text-muted-foreground font-body leading-relaxed">
                  <p>ZiggySitters was founded in 2022 by Jana Maia and Rachel Nottingham, two pet parents with high-needs animals who struggled to find reliable, understanding pet care.</p>
                  <p>After countless disappointing experiences with pet sitters who didn't understand their pets' unique needs, they decided to create a platform that truly prioritizes the wellbeing of every pet.</p>
                  <p>What started as a personal mission became a thriving community where pet parents can find sitters who genuinely understand and care.</p>
                </div>
              </div>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-border">
                <img src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=450&fit=crop" alt="Happy pets" className="w-full h-full object-cover" loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 md:py-28 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">What we believe</p>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">Our Values</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {values.map((v, i) => (
                <Card key={i} className="text-center border border-border bg-card hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-4">
                      <img src={v.icon} alt="" className="w-14 h-14" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 font-body text-foreground">{v.title}</h3>
                    <p className="text-sm text-muted-foreground font-body">{v.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">The people behind it</p>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">Meet Our Team</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {team.map((m, i) => (
                <Card key={i} className="text-center border border-border bg-card hover:shadow-md transition-shadow">
                  <CardContent className="p-8">
                    <Avatar className="h-24 w-24 mx-auto mb-4">
                      <AvatarImage src={m.image} alt={m.name} className="object-cover" />
                      <AvatarFallback>{m.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-semibold mb-1 font-body text-foreground">{m.name}</h3>
                    <p className="text-primary font-medium mb-3 text-sm font-body">{m.role}</p>
                    <p className="text-sm text-muted-foreground font-body">{m.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-secondary text-secondary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">Join Our Community</h2>
            <p className="text-lg text-secondary-foreground/60 mb-8 max-w-xl mx-auto font-body">
              Whether you're looking for reliable pet care or want to earn doing what you love.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-body px-10 py-6 text-lg" onClick={() => navigate('/find-sitters')}>
                Find a Sitter <ArrowRight className="ml-2 h-4 w-4" />
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
