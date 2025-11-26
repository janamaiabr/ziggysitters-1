import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Star, Shield, Heart, Camera, Clock, Tag, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export default function BlackFridayLanding() {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Black Friday Pet Sitting Sale | ZiggySitters"
        description="Black Friday exclusive: Save 50% on platform fee for all pet sitting bookings. Limited time offer on trusted, verified pet sitters."
        canonical="/black-friday"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800 text-white">
        {/* Floating emojis - only animate on desktop */}
        {!isMobile && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-10 left-10 text-5xl animate-bounce" style={{ animationDuration: '2s' }}>💰</div>
            <div className="absolute top-20 right-12 text-4xl animate-bounce" style={{ animationDelay: "0.4s", animationDuration: '2.5s' }}>🏷️</div>
            <div className="absolute bottom-24 left-1/4 text-4xl animate-bounce" style={{ animationDelay: "0.8s", animationDuration: '3s' }}>🐾</div>
            <div className="absolute bottom-20 right-1/4 text-5xl animate-bounce" style={{ animationDelay: "1.2s", animationDuration: '2.8s' }}>⭐</div>
            <div className="absolute top-1/2 right-10 text-3xl animate-bounce" style={{ animationDelay: "1.6s", animationDuration: '2.3s' }}>✨</div>
          </div>
        )}

        {/* Blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-20 -left-10 w-96 h-96 rounded-full bg-yellow-500/30 blur-3xl" />
          <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-orange-500/30 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-yellow-600/20 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-yellow-400 text-zinc-900 px-4 py-2 text-sm font-bold shadow-sm mb-6">
                <Zap className="w-4 h-4" />
                <span>BLACK FRIDAY SALE</span>
                <span className={`text-xs rounded-full bg-zinc-900 text-yellow-400 px-2 py-0.5 font-bold ${!isMobile ? 'animate-pulse' : ''}`}>
                  ENDS SOON!
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
                <span className="text-yellow-400">
                  50% Off Platform Fee
                </span>
                <br />
                <span className="text-white">
                  This Black Friday 🏷️
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-zinc-200 max-w-3xl mx-auto mb-8">
                Book verified, trusted pet sitters and save 50% on our platform fee. 
                Limited time offer - your furry friends deserve the best care at a better price.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link to="/find-sitters?promo=BLACKFRIDAY50">
                  <Button size="lg" className="h-14 px-8 text-lg font-bold bg-yellow-400 text-zinc-900 hover:bg-yellow-500 shadow-2xl">
                    🏷️ Claim 50% Off Platform Fee
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold bg-white text-zinc-900 border-2 border-white hover:bg-zinc-100">
                    How It Works
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-zinc-300 mt-6">
                ⚡ <strong>Use code BLACKFRIDAY50</strong> at checkout. Offer valid until November 30th.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-12 bg-yellow-50 dark:bg-yellow-950/20 border-y border-yellow-200 dark:border-yellow-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Shield, label: "Verified Sitters", desc: "ID & police checked" },
              { icon: Camera, label: "Daily Updates", desc: "Photos & videos" },
              { icon: Heart, label: "Trusted by 1000s", desc: "Happy pet parents" },
              { icon: Tag, label: "Best Price", desc: "Guaranteed savings" }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-yellow-500 text-zinc-900 mb-3 shadow-lg">
                  <item.icon className="w-7 h-7" />
                </div>
                <p className="font-bold text-sm mb-1">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why This Deal is Amazing */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Why This <span className="text-yellow-600">Black Friday Deal</span> is Unbeatable
            </h2>
            <p className="text-center text-muted-foreground mb-12 text-lg">
              The best pet care at the best price - only this weekend
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  emoji: "💰",
                  title: "50% Off Platform Fee",
                  desc: "Save 50% on our platform fee for all bookings made during Black Friday. Works for house sitting, drop-ins, and all service types."
                },
                {
                  emoji: "⭐",
                  title: "Same Premium Quality",
                  desc: "Sale price doesn't mean cheaper service. You still get our verified, highly-rated sitters with daily updates and full support."
                },
                {
                  emoji: "🎁",
                  title: "Use It Anytime",
                  desc: "Book now for any future dates - Christmas holidays, New Year's, summer vacations. Lock in this price for your next trip!"
                }
              ].map((item, i) => (
                <Card key={i} className="border-2 border-yellow-200 dark:border-yellow-900 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-4">{item.emoji}</div>
                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-20 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/10 dark:to-orange-950/10">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              What Your Pet Gets <span className="text-yellow-700">(50% Off Platform Fee!)</span>
            </h2>
            <p className="text-center text-muted-foreground mb-12 text-lg">
              Premium pet care with 50% savings on our platform fee
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: "🏡", title: "Stay in Their Own Home", desc: "No stressful kennels. Your pet stays comfortable in their familiar environment with their favourite toys and routines." },
                { icon: "📸", title: "Daily Photo & Video Updates", desc: "Receive adorable photos and videos every single day. See your happy, healthy pet enjoying their time with their sitter." },
                { icon: "💚", title: "One-on-One Attention", desc: "Your pet gets dedicated care from their sitter. No crowded facilities or divided attention - just personal, loving care." },
                { icon: "🎯", title: "Flexible Scheduling", desc: "Morning visits, evening care, overnight stays - book exactly what your pet needs at times that work for your schedule." },
                { icon: "🚨", title: "Emergency Support", desc: "24/7 emergency vet access and support. Every sitter knows exactly what to do if anything unexpected happens." },
                { icon: "✨", title: "Experienced Pet Lovers", desc: "All our sitters are genuine animal lovers with verified experience. Many are pet owners themselves who understand your concerns." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start p-6 bg-background rounded-xl border-2 border-yellow-300 dark:border-yellow-900 hover:shadow-lg transition-shadow">
                  <div className="text-4xl flex-shrink-0">{item.icon}</div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How to Claim */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              How to Claim Your <span className="text-yellow-600">50% Platform Fee Discount</span>
            </h2>
            <p className="text-center text-muted-foreground mb-12 text-lg">
              Three simple steps to save on your booking
            </p>

            <div className="space-y-8">
              {[
                {
                  num: "1",
                  title: "Browse Available Sitters",
                  desc: "Search by location and dates to see which verified sitters are available. Read reviews, check their experience, and find your perfect match."
                },
                {
                  num: "2",
                  title: "Send a Booking Request",
                  desc: "Found the right sitter? Send them a booking request with your pet's details and your travel dates. Most sitters respond within hours!"
                },
                {
                  num: "3",
                  title: "Use Code BLACKFRIDAY50",
                  desc: "Once your sitter accepts, enter code BLACKFRIDAY50 at checkout to get 50% off the platform fee. That's instant savings on your booking!"
                }
              ].map((step) => (
                <div key={step.num} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-yellow-500 text-zinc-900 flex items-center justify-center text-2xl font-bold shadow-xl">
                    {step.num}
                  </div>
                  <div className="pt-3">
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link to="/find-sitters">
                <Button size="lg" className="h-14 px-8 text-lg font-bold bg-yellow-500 text-zinc-900 hover:bg-yellow-600">
                  Start Browsing Sitters 🏷️
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/10 dark:to-orange-950/10">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Join 1000s of Happy <span className="text-yellow-700">Pet Parents</span>
            </h2>
            <p className="text-center text-muted-foreground mb-12 text-lg">
              See why pet owners trust us with their furry family members
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "Rachel & Charlie",
                  pet: "Border Collie",
                  text: "Best decision ever! Our sitter sent us photos twice a day and Charlie looked so happy. Worth every penny and this sale makes it even better!",
                  stars: 5
                },
                {
                  name: "Mike & Whiskers",
                  pet: "Persian Cat",
                  text: "Whiskers is super picky about people, but she loved her sitter! The daily updates gave us such peace of mind while we were overseas. Highly recommend.",
                  stars: 5
                },
                {
                  name: "Lisa & Bailey",
                  pet: "Labrador",
                  text: "We've used ZiggySitters three times now and every experience has been amazing. Bailey gets so excited when his sitter arrives. Can't wait to book again with this discount!",
                  stars: 5
                }
              ].map((review, i) => (
                <Card key={i} className="border-2 border-yellow-300 dark:border-yellow-900">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-3">
                      {[...Array(review.stars)].map((_, j) => (
                        <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm mb-4 italic">&quot;{review.text}&quot;</p>
                    <div className="border-t pt-3">
                      <p className="font-semibold text-sm">{review.name}</p>
                      <p className="text-xs text-muted-foreground">{review.pet}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Black Friday Sale <span className="text-yellow-600">FAQs</span>
            </h2>
            <p className="text-center text-muted-foreground mb-12 text-lg">
              Everything you need to know about this offer
            </p>

            <div className="space-y-4">
              {[
                {
                  q: "When does this Black Friday sale end?",
                  a: "The 50% platform fee discount is valid until November 30th at midnight. After that, regular pricing returns. Book now to lock in these savings for any future dates!"
                },
                {
                  q: "Can I use the discount for any dates?",
                  a: "Yes! Book during the Black Friday sale period and use your 50% platform fee discount for pet sitting on any future dates - Christmas, New Year's, next summer, anytime you need care."
                },
                {
                  q: "Is there a minimum booking required?",
                  a: "No minimum! Whether you need a quick drop-in visit or two weeks of house sitting, the 50% platform fee discount applies to all bookings made during this sale."
                },
                {
                  q: "Do I need to pay upfront to claim the discount?",
                  a: "You only pay once your sitter accepts your booking request. Enter the code BLACKFRIDAY50 at checkout to apply your 50% platform fee discount automatically."
                },
                {
                  q: "What exactly is discounted?",
                  a: "The 50% discount applies to our platform fee only. You'll still pay the sitter's regular rate for their services, but you save 50% on the platform fee we normally charge."
                },
                {
                  q: "Can I combine this with other offers?",
                  a: "The Black Friday discount cannot be combined with other promotional codes, but it's already our biggest discount of the year - you're getting the best deal possible!"
                },
                {
                  q: "What if I need to cancel my booking?",
                  a: "Standard cancellation policies apply based on when you cancel. Check our cancellation policy for details, but you'll receive a refund according to the timeframe."
                }
              ].map((faq, i) => (
                <Card key={i} className="border-2 border-yellow-200 dark:border-yellow-900">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2 flex items-start gap-2">
                      <Check className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-1" />
                      {faq.q}
                    </h3>
                    <p className="text-muted-foreground ml-7">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-zinc-900 to-zinc-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className={`inline-flex items-center gap-2 rounded-full bg-yellow-400 text-zinc-900 px-4 py-2 text-sm font-bold mb-6 ${!isMobile ? 'animate-pulse' : ''}`}>
              <Zap className="w-4 h-4" />
              <span>LAST CHANCE - SALE ENDS SOON!</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
              Don&apos;t Miss Out on 50% Off Platform Fee
            </h2>

            <p className="text-xl text-zinc-200 mb-10 max-w-2xl mx-auto">
              This Black Friday deal ends November 30th. Book now with 50% off our platform fee 
              for any future dates. Your pets deserve the best!
            </p>

            <Link to="/find-sitters?promo=BLACKFRIDAY50">
              <Button size="lg" className="h-16 px-10 text-xl font-bold bg-yellow-400 text-zinc-900 hover:bg-yellow-500 shadow-2xl">
                🏷️ Get 50% Off Platform Fee Now
              </Button>
            </Link>

            <p className="text-sm text-zinc-300 mt-6">
              Use code <span className="font-bold text-yellow-400">BLACKFRIDAY50</span> at checkout
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
