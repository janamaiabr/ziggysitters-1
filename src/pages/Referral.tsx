import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Gift, Share2, Heart, DollarSign, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Referral() {
  const navigate = useNavigate();
  const referralLink = 'https://ziggysitters.com/?ref=YOUR_CODE';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Referral link copied to clipboard!');
  };

  return (
    <>
      <SEOHead
        title="Refer a Pet Parent — Get $20 Credit | ZiggySitters"
        description="Share ZiggySitters with friends and family. You get $20 credit, they get $15 off their first booking. It's a win-win for pet parents across New Zealand."
        keywords="ziggysitters referral, pet sitting referral, refer a friend pet sitter nz"
        canonical="/referral"
      />

      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-accent/20 to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Gift className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Refer &amp; Earn</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Give $15, Get $20
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Share ZiggySitters with a fellow pet parent. They get <strong>$15 off</strong> their first booking,
            and you get <strong>$20 credit</strong> towards your next one. Everyone wins — especially the pets. 🐾
          </p>
          <Button size="lg" onClick={handleCopyLink} className="gap-2 text-lg px-8 py-6">
            <Share2 className="w-5 h-5" />
            Share Your Referral Link
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: <Share2 className="w-8 h-8 text-primary" />,
                title: '1. Share Your Link',
                desc: 'Copy your unique referral link and send it to friends, family, or anyone who has a pet.',
              },
              {
                icon: <Users className="w-8 h-8 text-primary" />,
                title: '2. They Book a Sitter',
                desc: 'Your friend signs up and books their first pet sitting service — with $15 off automatically applied.',
              },
              {
                icon: <DollarSign className="w-8 h-8 text-primary" />,
                title: '3. You Get $20 Credit',
                desc: 'Once their booking is completed, $20 credit is added to your ZiggySitters account. Simple as that.',
              },
            ].map((step, i) => (
              <Card key={i} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Share */}
      <section className="py-16 md:py-20 bg-accent/10">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Why Pet Parents Love Referring</h2>
          <p className="text-lg text-muted-foreground mb-8">
            When you refer someone to ZiggySitters, you're not just sharing a service — you're sharing
            peace of mind. Every sitter is vetted, every booking includes optional daily photo updates,
            and every pet gets the care they deserve.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {[
              'Vetted, trusted sitters across NZ',
              'Optional daily photo updates',
              'No limit on referrals — keep earning',
              'Credits never expire',
              'Works for all pet types',
              'NZ-owned and operated',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm">
                <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Spread the Love?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Share your referral link now and start earning credits with every friend who books.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={handleCopyLink} className="gap-2">
              <Share2 className="w-5 h-5" />
              Copy Referral Link
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/find-sitters')} className="gap-2 border-white text-white hover:bg-white/10">
              Browse Sitters
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
