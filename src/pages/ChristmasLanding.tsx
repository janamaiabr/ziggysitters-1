import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

import iconShield from "@/assets/icons/icon-shield.png";
import iconCamera from "@/assets/icons/icon-camera.png";
import iconHeart from "@/assets/icons/icon-heart.png";
import iconClock from "@/assets/icons/icon-clock.png";
import iconStar from "@/assets/icons/icon-star.png";
import iconCheck from "@/assets/icons/icon-check.png";
import iconCalendar from "@/assets/icons/icon-calendar.png";
import iconHouse from "@/assets/icons/icon-house.png";
import iconPaw from "@/assets/icons/icon-paw.png";
import iconGift from "@/assets/icons/icon-gift.png";

export default function ChristmasLanding() {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Christmas Pet Sitting | ZiggySitters"
        description="Book a loving pet sitter for Christmas before spots run out. Holiday pet care with daily updates and verified sitters."
        canonical="/christmas"
      />

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1544568100-847a948585b9?w=1600&h=900&fit=crop" alt="Happy pet at Christmas" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/30" />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-sm font-semibold mb-6 border border-white/20 text-white font-body">
              <img src={iconCalendar} alt="" className="w-4 h-4" />
              Christmas bookings now open
              <span className={`text-xs rounded-full bg-primary text-primary-foreground px-2 py-0.5 font-bold ${!isMobile ? 'animate-pulse' : ''}`}>
                Limited spots!
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight mb-6 text-white font-display">
              Your Pet's Perfect
              <br />
              <span className="text-primary">Christmas Holiday</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mb-8 font-body">
              Heading away for the holidays? Give your furry family the gift of staying home with a trusted, 
              verified sitter who sends daily photo updates.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link to="/find-sitters?season=christmas">
                <Button size="lg" className="h-14 px-8 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xl">
                  <img src={iconGift} alt="" className="w-5 h-5 mr-2" />
                  Find Your Christmas Sitter
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="lg" variant="outline-white" className="h-14 px-8 text-lg font-semibold">
                  How It Works
                </Button>
              </Link>
            </div>

            <p className="text-sm text-white/60 mt-6 font-body">
              Peak dates (Dec 24-27 & New Year's Eve) are booking fast. Secure your spot today!
            </p>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-12 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: iconShield, label: "Verified Sitters", desc: "ID & police checked" },
              { icon: iconCamera, label: "Daily Updates", desc: "Photos & videos" },
              { icon: iconHeart, label: "Trusted by Pet Parents", desc: "Real reviews" },
              { icon: iconClock, label: "24/7 Support", desc: "We're here to help" }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="flex justify-center mb-3">
                  <img src={item.icon} alt="" className="w-10 h-10 brightness-0 invert" />
                </div>
                <p className="font-bold text-sm mb-1 text-secondary-foreground font-body">{item.label}</p>
                <p className="text-xs text-secondary-foreground/60 font-body">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Book Early */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">Don't miss out</p>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">
                Why Book Your Christmas Sitter Early?
              </h2>
              <p className="text-lg text-muted-foreground mt-4 font-body">
                The best sitters get snapped up quickly during the festive season
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: iconCalendar, title: "Peak Dates Fill Fast", desc: "Christmas Eve through Boxing Day are the most popular dates. Experienced sitters are already receiving multiple requests." },
                { icon: iconStar, title: "Best Sitters, Best Care", desc: "Our most experienced, verified sitters get booked first. Don't miss out on the best care for your precious pets." },
                { icon: iconHeart, title: "Peace of Mind", desc: "Book early and relax. No last-minute scrambling, no settling for less. Just pure holiday relaxation knowing your pets are sorted." },
              ].map((item, i) => (
                <Card key={i} className="border border-border hover:shadow-xl transition-shadow bg-card">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <img src={item.icon} alt="" className="w-12 h-12" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 font-display text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground font-body">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">What's included</p>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">
                What Your Pet Gets This Christmas
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: iconHouse, title: "Stay in Their Own Home", desc: "No stressful kennels. Your pet stays in their safe, familiar environment with all their favourite toys, bed, and routines intact." },
                { icon: iconCamera, title: "Daily Photo & Video Updates", desc: "Get adorable photos and videos sent straight to your phone every day. See your pet happy, healthy, and having a great time." },
                { icon: iconHeart, title: "One-on-One Attention", desc: "Your sitter focuses entirely on your pet. No sharing attention with dozens of other animals like at boarding facilities." },
                { icon: iconCalendar, title: "Holiday Routine Maintained", desc: "Christmas can be stressful for pets. Your sitter keeps their feeding, walking, and play schedule exactly as normal." },
                { icon: iconShield, title: "Emergency Vet Access", desc: "All sitters have access to 24/7 emergency vet contacts and know exactly what to do if anything comes up." },
                { icon: iconGift, title: "Special Christmas Treats", desc: "Let your sitter know about any special Christmas treats or toys and they'll make sure your pet feels the festive love!" },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start p-6 bg-card rounded-xl border border-border hover:shadow-lg transition-shadow">
                  <img src={item.icon} alt="" className="w-10 h-10 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold mb-2 font-display text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground font-body">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">3 simple steps</p>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">
                Book in 3 Simple Steps
              </h2>
            </div>

            <div className="space-y-8">
              {[
                { num: "1", title: "Tell Us About Your Pet & Dates", desc: "Create a free profile and tell us about your furry friend — their personality, routines, any special needs. Select your Christmas travel dates." },
                { num: "2", title: "Browse Available Sitters", desc: "See which verified, local sitters are still available for your dates. Read reviews, check their experience, and pick your perfect match." },
                { num: "3", title: "Book & Relax", desc: "Send a booking request. Once accepted, you'll get your sitter's contact info. Chat, do a meet-and-greet, then enjoy your holiday worry-free!" },
              ].map((step) => (
                <div key={step.num} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-xl font-display">
                    {step.num}
                  </div>
                  <div className="pt-3">
                    <h3 className="text-xl font-bold mb-2 font-display text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground font-body">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link to="/find-sitters">
                <Button size="lg" className="h-14 px-8 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90">
                  Start Your Search <span className="ml-2">→</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">Testimonials</p>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">
                What Pet Parents Say About Their Christmas Bookings
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: "Sarah & Max", pet: "Golden Retriever", text: "We went to the South Island for Christmas and our sitter sent us photos of Max every single day. He looked so happy!", stars: 5 },
                { name: "James & Luna", pet: "Tabby Cat", text: "Luna hates change, so we were nervous about leaving her over New Year's. Our sitter kept her routine perfectly and Luna didn't even notice!", stars: 5 },
                { name: "Emma & Buddy", pet: "Beagle Mix", text: "Booked last minute for Christmas Eve and got the perfect sitter. Buddy had an amazing time and we could actually relax on holiday.", stars: 5 },
              ].map((review, i) => (
                <Card key={i} className="border border-border bg-card">
                  <CardContent className="p-6">
                    <div className="flex gap-0.5 mb-3">
                      {[...Array(review.stars)].map((_, j) => (
                        <img key={j} src={iconStar} alt="" className="w-4 h-4" />
                      ))}
                    </div>
                    <p className="text-sm mb-4 italic text-muted-foreground font-body">"{review.text}"</p>
                    <div className="border-t border-border pt-3">
                      <p className="font-semibold text-sm font-body text-foreground">{review.name}</p>
                      <p className="text-xs text-muted-foreground font-body">{review.pet}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 font-body">FAQ</p>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">
                Christmas Booking FAQs
              </h2>
            </div>

            <div className="space-y-4">
              {[
                { q: "How much does Christmas pet sitting cost?", a: "Prices vary by sitter, service type, and location. You'll see exact prices when browsing sitters — many offer holiday packages too!" },
                { q: "What if my sitter cancels at the last minute?", a: "While extremely rare, if your sitter has an emergency, we'll help you find a replacement immediately." },
                { q: "Can I do a meet-and-greet before Christmas?", a: "Absolutely! We highly recommend meeting your sitter beforehand so your pet gets comfortable with them." },
                { q: "What happens if my pet gets sick during the holidays?", a: "All our sitters have emergency contacts and know what to do. They'll contact you immediately and can take your pet to the vet if needed." },
                { q: "Do sitters work on Christmas Day?", a: "Yes! Many of our sitters specifically choose to work Christmas Day because they love caring for pets." },
                { q: "How far in advance should I book?", a: "For Christmas dates, we recommend booking at least 4-6 weeks in advance. Peak dates fill up fastest." },
              ].map((faq, i) => (
                <Card key={i} className="border border-border bg-card">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2 flex items-start gap-2 font-display text-foreground">
                      <img src={iconCheck} alt="" className="w-5 h-5 flex-shrink-0 mt-1" />
                      {faq.q}
                    </h3>
                    <p className="text-muted-foreground ml-7 font-body">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 font-display">
              Don't Leave Your Pet's Christmas to Chance
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-secondary-foreground/60 font-body">
              The best sitters are getting booked right now. Secure your spot today and give yourself 
              (and your pet) the gift of stress-free holiday travel.
            </p>
            <Link to="/find-sitters">
              <Button size="lg" className="h-16 px-10 text-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xl">
                Find Available Sitters Now <span className="ml-2">→</span>
              </Button>
            </Link>
            <p className="text-sm mt-6 text-secondary-foreground/50 font-body">
              No credit card required to browse · Free to create a profile · Book in under 5 minutes
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
