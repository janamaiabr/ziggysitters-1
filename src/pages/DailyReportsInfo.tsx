import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';

import iconCalendar from '@/assets/icons/icon-calendar.png';
import iconCamera from '@/assets/icons/icon-camera.png';
import iconShield from '@/assets/icons/icon-shield.png';
import iconHeart from '@/assets/icons/icon-heart.png';
import iconClock from '@/assets/icons/icon-clock.png';
import iconStar from '@/assets/icons/icon-star.png';
import iconCheck from '@/assets/icons/icon-check.png';
import iconDollar from '@/assets/icons/icon-dollar.png';

export default function DailyReportsInfo() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Daily Reports — Pet Care Updates | ZiggySitters"
        description="Get daily photo updates and detailed care reports from your pet sitter. Optional but guaranteed when requested."
        canonical="/daily-reports-info"
      />

      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600&h=800&fit=crop" alt="Pet care" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        </div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest mb-4 font-body" style={{ color: 'hsl(152 45% 55%)' }}>Daily Reports</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-[1.1] mb-6 font-display">
              Your Choice, <span className="text-primary">Our Guarantee</span>
            </h1>
            <p className="text-lg text-white/80 font-body mb-8 max-w-xl">
              Want daily updates with photos? Simply check the box when booking. When you request them,
              ZiggySitters ensures your sitter delivers — or they face a 15% payment reduction.
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

      {/* How It Works Section */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
              How Optional Daily Reports Work
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
              Choose to receive comprehensive reports when booking — when you do, our system
              ensures sitters deliver quality updates about your pet's well-being.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
            {[
              { icon: iconCalendar, title: 'Choose Your Updates', desc: "Simply check the box when booking if you want daily reports. Not every booking needs them — you decide what level of communication works best for you." },
              { icon: iconCamera, title: 'Guaranteed Delivery', desc: "When you request reports, sitters must deliver them with photos. Our 15% payment deduction ensures accountability — reports are guaranteed when requested." },
              { icon: iconShield, title: 'Comprehensive Care', desc: "Reports cover feeding, exercise, medication, sleep quality, and any special care requirements your pet may have." },
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

          {/* Sample Report Preview */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold font-display">Daily Report — March 15, 2024</h3>
              <Badge variant="secondary" className="font-body">
                <img src={iconCheck} alt="" className="h-4 w-4 mr-1" />
                Completed
              </Badge>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-muted p-3 rounded-lg">
                <h4 className="font-medium mb-2 font-body">Exercise & Activities</h4>
                <p className="text-sm text-muted-foreground font-body">
                  45-minute morning walk in the park, played fetch for 20 minutes. 
                  Max was very energetic and social with other dogs.
                </p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <h4 className="font-medium mb-2 font-body">Feeding & Appetite</h4>
                <p className="text-sm text-muted-foreground font-body">
                  Ate breakfast completely at 7:30 AM. Good appetite and finished 
                  dinner by 6:00 PM. Plenty of fresh water available.
                </p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground italic font-body">
              "Max had a wonderful day! He's such a happy and well-behaved dog. 
              Looking forward to our adventure tomorrow!"
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
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
              { icon: iconClock, title: 'Real-time Communication', desc: "Stay connected with daily updates delivered to your inbox." },
              { icon: iconStar, title: 'Quality Assurance', desc: "Detailed reports ensure high standards of pet care." },
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

      {/* Payment & Quality Section */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="bg-secondary text-secondary-foreground rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <img src={iconDollar} alt="" className="w-16 h-16" />
            </div>
            <h2 className="text-3xl font-bold mb-4 font-display">
              Optional, But Guaranteed When Requested
            </h2>
            <p className="text-xl mb-8 text-secondary-foreground/70 max-w-3xl mx-auto font-body">
              When you request daily reports, sitters must complete them for 100% payment. Missing requested
              reports results in a 15% deduction — ensuring accountability when you choose transparency.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div className="bg-secondary-foreground/10 rounded-xl p-6 text-left">
                <h3 className="text-xl font-semibold mb-3 font-display">For Pet Parents</h3>
                <ul className="space-y-2 text-secondary-foreground/80 font-body">
                  {['Choose if you want daily updates when booking', 'Guaranteed delivery when you request them', 'Detailed care documentation with photos', 'Accountability through payment structure'].map((item, i) => (
                    <li key={i} className="flex items-start gap-2"><img src={iconCheck} alt="" className="w-4 h-4 mt-0.5 flex-shrink-0" />{item}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-secondary-foreground/10 rounded-xl p-6 text-left">
                <h3 className="text-xl font-semibold mb-3 font-display">For Sitters</h3>
                <ul className="space-y-2 text-secondary-foreground/80 font-body">
                  {["Reports only required when owners request them", "100% payment for completing requested reports", "Build trust with detailed documentation", "Flexibility for bookings that don't need reports"].map((item, i) => (
                    <li key={i} className="flex items-start gap-2"><img src={iconCheck} alt="" className="w-4 h-4 mt-0.5 flex-shrink-0" />{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
            Your Choice, Our Guarantee
          </h2>
          <p className="text-lg text-secondary-foreground/60 mb-8 max-w-2xl mx-auto font-body">
            Join pet parents who choose ZiggySitters for flexible, accountable
            pet care — with optional daily reports that are guaranteed when you request them.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-body px-10 py-6 text-lg">
              <Link to="/find-sitters">Find a Sitter</Link>
            </Button>
            <Button asChild variant="outline-white" size="lg" className="font-body px-10 py-6 text-lg">
              <Link to="/become-sitter">Become a Sitter</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
