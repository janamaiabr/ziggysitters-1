import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import iconGift from '@/assets/icons/icon-gift.png';
import iconCommunity from '@/assets/icons/icon-community.png';
import iconPayment from '@/assets/icons/icon-payment.png';
import iconHeart from '@/assets/icons/icon-heart.png';

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
        description="Share ZiggySitters with friends. You get $20 credit, they get $15 off their first booking."
        keywords="ziggysitters referral, pet sitting referral, refer a friend pet sitter nz"
        canonical="/referral"
      />

      {/* Hero */}
      <section className="py-20 md:py-28 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <img src={iconGift} alt="" className="w-16 h-16" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display text-foreground mb-4">
            Give $15, Get $20
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 font-body">
            Share ZiggySitters with a fellow pet parent. They get <strong className="text-foreground">$15 off</strong> their first booking,
            and you get <strong className="text-foreground">$20 credit</strong> towards your next one.
          </p>
          <Button size="lg" onClick={handleCopyLink} className="bg-primary text-primary-foreground hover:bg-primary/90 font-body px-10 py-6 text-lg">
            Share Your Referral Link
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">Simple process</p>
            <h2 className="text-3xl font-bold font-display text-foreground">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: iconGift, title: '1. Share Your Link', desc: 'Copy your unique referral link and send it to friends, family, or anyone who has a pet.' },
              { icon: iconCommunity, title: '2. They Book a Sitter', desc: 'Your friend signs up and books their first pet sitting service — with $15 off automatically applied.' },
              { icon: iconPayment, title: '3. You Get $20 Credit', desc: 'Once their booking is completed, $20 credit is added to your account. Simple as that.' },
            ].map((step, i) => (
              <Card key={i} className="text-center border border-border shadow-sm hover:shadow-md transition-shadow bg-card">
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="flex justify-center mb-4"><img src={step.icon} alt="" className="w-14 h-14" /></div>
                  <h3 className="text-xl font-semibold mb-2 font-body text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground font-body">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Share */}
      <section className="py-20 md:py-28 bg-muted">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <img src={iconHeart} alt="" className="w-14 h-14 mx-auto mb-4" />
          <h2 className="text-3xl font-bold font-display text-foreground mb-4">Why Pet Parents Love Referring</h2>
          <p className="text-lg text-muted-foreground mb-8 font-body">
            When you refer someone, you're sharing peace of mind. Every sitter is vetted, every booking includes optional daily photo updates.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {['Vetted, trusted sitters across NZ', 'Optional daily photo updates', 'No limit on referrals', 'Credits never expire', 'Works for all pet types', 'NZ-owned and operated'].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-card border border-border rounded-xl p-4">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-foreground font-body">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold font-display mb-4">Ready to Spread the Love?</h2>
          <p className="text-lg text-secondary-foreground/60 mb-8 max-w-xl mx-auto font-body">
            Share your referral link now and start earning credits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-body px-10 py-6 text-lg" onClick={handleCopyLink}>
              Copy Referral Link
            </Button>
            <Button size="lg" variant="outline-white" className="font-body px-10 py-6 text-lg" onClick={() => navigate('/find-sitters')}>
              Browse Sitters
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
