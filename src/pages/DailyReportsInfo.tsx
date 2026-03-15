import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import dailyReportScreenshot from '@/assets/home/daily-report-screenshot.jpg';

import iconCalendar from '@/assets/icons/icon-calendar.png';
import iconCamera from '@/assets/icons/icon-camera.png';
import iconShield from '@/assets/icons/icon-shield.png';
import iconHeart from '@/assets/icons/icon-heart.png';
import iconClock from '@/assets/icons/icon-clock.png';
import iconStar from '@/assets/icons/icon-star.png';
import iconCheck from '@/assets/icons/icon-check.png';

export default function DailyReportsInfo() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Daily Reports — Pet Care Updates | ZiggySitters"
        description="Get daily photo updates and detailed care reports from your pet sitter. Optional but guaranteed when requested."
        canonical="/daily-reports-info"
      />

      {/* Hero — clean, no stock image */}
      <section className="bg-secondary py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4 font-body">Daily Reports</p>
            <h1 className="text-4xl md:text-5xl font-bold text-secondary-foreground leading-[1.1] mb-6 font-display">
              See Your Pet's Day, Every Day
            </h1>
            <p className="text-lg text-secondary-foreground/70 font-body mb-8 max-w-xl mx-auto">
              Request daily photo updates when booking. Your sitter sends photos, meal notes, mood updates, and more — so you never have to wonder.
            </p>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-body px-8 py-6 text-lg">
              <Link to="/find-sitters">
                Find a Sitter
                <span className="ml-2">→</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works with product screenshot */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
              How Daily Reports Work
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
              Choose to receive reports when booking. When you do, your sitter sends daily updates about your pet's care.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
            {[
              { icon: iconCalendar, title: 'Opt-in When Booking', desc: "Simply check the box when you book. Not every booking needs daily reports — you decide what works for you." },
              { icon: iconCamera, title: 'Photos & Notes Daily', desc: "Your sitter sends photos, meal updates, walk notes, and mood reports. You see exactly how your pet's day went." },
              { icon: iconShield, title: 'Comprehensive Care Log', desc: "Reports cover feeding, exercise, medication, sleep quality, and any special care needs your pet has." },
            ].map((item, i) => (
              <Card key={i} className="text-center border border-border bg-card">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <img src={item.icon} alt="" className="w-12 h-12" />
                  </div>
                  <CardTitle className="font-display">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-body">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Product screenshot */}
          <div className="max-w-sm mx-auto">
            <div className="relative">
              <img 
                src={dailyReportScreenshot} 
                alt="ZiggySitters daily report interface showing pet photos, meal notes, and activity updates"
                className="w-full rounded-2xl shadow-2xl border border-border"
                loading="lazy"
              />
              <div className="absolute -bottom-3 -right-3 bg-card rounded-lg px-3 py-2 shadow-lg border border-border">
                <p className="text-xs font-semibold text-foreground font-body">Real app screenshot</p>
                <p className="text-[10px] text-muted-foreground font-body">What owners actually receive</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 md:py-28 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">Benefits</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
              Why Choose Daily Reports?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: iconHeart, title: 'Peace of Mind', desc: "Know your pet is happy and well-cared for while you're away." },
              { icon: iconCamera, title: 'Visual Updates', desc: "See your pet's activities and mood through daily photos." },
              { icon: iconClock, title: 'Stay Connected', desc: "Daily updates delivered to your inbox — feel close even when apart." },
              { icon: iconStar, title: 'Quality Care', desc: "Detailed reports help maintain high standards of pet care." },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="flex justify-center mb-3">
                  <img src={item.icon} alt="" className="w-10 h-10" />
                </div>
                <h3 className="font-semibold mb-2 font-body text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground font-body">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For owners & sitters — no punitive language */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="bg-secondary text-secondary-foreground rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 font-display">
              Optional, But Guaranteed When Requested
            </h2>
            <p className="text-xl mb-8 text-secondary-foreground/70 max-w-3xl mx-auto font-body">
              You choose whether you want daily updates. When you opt in, sitters are committed to delivering quality reports as part of your booking.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div className="bg-secondary-foreground/10 rounded-xl p-6 text-left">
                <h3 className="text-xl font-semibold mb-3 font-display">For Pet Parents</h3>
                <ul className="space-y-2 text-secondary-foreground/80 font-body">
                  {['Choose if you want daily updates when booking', 'Guaranteed delivery when you request them', 'Photos, meal notes, mood & activity updates', 'Feel connected to your pet while away'].map((item, i) => (
                    <li key={i} className="flex items-start gap-2"><img src={iconCheck} alt="" className="w-4 h-4 mt-0.5 flex-shrink-0" />{item}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-secondary-foreground/10 rounded-xl p-6 text-left">
                <h3 className="text-xl font-semibold mb-3 font-display">For Sitters</h3>
                <ul className="space-y-2 text-secondary-foreground/80 font-body">
                  {["Reports only required when owners request them", "Share what you're already doing — quick and easy", "Build trust and earn better reviews", "Flexibility for bookings that don't need reports"].map((item, i) => (
                    <li key={i} className="flex items-start gap-2"><img src={iconCheck} alt="" className="w-4 h-4 mt-0.5 flex-shrink-0" />{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
            Ready to Try Daily Reports?
          </h2>
          <p className="text-lg text-secondary-foreground/60 mb-8 max-w-2xl mx-auto font-body">
            Find a sitter and opt in to daily photo updates when you book.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-body px-10 py-6 text-lg">
              <Link to="/find-sitters">Find a Sitter</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-body px-10 py-6 text-lg border-secondary-foreground/20 text-secondary-foreground hover:bg-secondary-foreground/10">
              <Link to="/become-sitter">Become a Sitter</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
