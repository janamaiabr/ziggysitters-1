import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Star, Shield, Heart, Camera, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function ChristmasLanding() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Christmas Pet Sitting | ZiggySitters"
        description="Book a loving pet sitter for Christmas before spots run out. Holiday pet care with daily updates and verified sitters."
        canonical="/christmas"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-50 to-emerald-50 dark:from-red-950/30 dark:to-emerald-950/30">
        {/* Festive floating emojis */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-10 text-5xl animate-bounce" style={{ animationDuration: '2s' }}>🎄</div>
          <div className="absolute top-20 right-12 text-4xl animate-bounce" style={{ animationDelay: "0.4s", animationDuration: '2.5s' }}>🎁</div>
          <div className="absolute bottom-24 left-1/4 text-4xl animate-bounce" style={{ animationDelay: "0.8s", animationDuration: '3s' }}>🐾</div>
          <div className="absolute bottom-20 right-1/4 text-5xl animate-bounce" style={{ animationDelay: "1.2s", animationDuration: '2.8s' }}>⭐</div>
          <div className="absolute top-1/2 right-10 text-3xl animate-bounce" style={{ animationDelay: "1.6s", animationDuration: '2.3s' }}>❄️</div>
        </div>

        {/* Soft festive blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-20 -left-10 w-96 h-96 rounded-full bg-red-500/30 dark:bg-red-700/20 blur-3xl" />
          <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-emerald-500/30 dark:bg-emerald-700/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-red-600/20 dark:bg-red-600/15 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-red-100 dark:bg-red-900/30 px-4 py-2 text-sm font-semibold shadow-sm mb-6 border-2 border-red-300 dark:border-red-800">
                <span>🎅 Christmas bookings now open</span>
                <span className="text-xs rounded-full bg-red-600 text-white px-2 py-0.5 font-bold animate-pulse">
                  Limited spots!
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
                <span className="text-red-700 dark:text-red-400">
                  Your Pet&apos;s Perfect
                </span>
                <br />
                <span className="text-emerald-700 dark:text-emerald-400">
                  Christmas Holiday 🎄
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Heading away for the holidays? Give your furry family the gift of staying home with a trusted, 
                verified sitter who sends daily photo updates.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link to="/find-sitters?season=christmas">
                  <Button size="lg" className="h-14 px-8 text-lg font-bold bg-red-600 hover:bg-red-700 shadow-2xl">
                    🎁 Find Your Christmas Sitter
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold border-2 border-emerald-600 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950">
                    How It Works
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-muted-foreground mt-6">
                ⚡ <strong>Peak dates (Dec 24-27 & New Year&apos;s Eve)</strong> are booking fast. Secure your spot today!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-12 bg-gradient-to-r from-red-50 to-emerald-50 dark:from-red-950/10 dark:to-emerald-950/10 border-y border-red-200 dark:border-red-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Shield, label: "Verified Sitters", desc: "ID & police checked" },
              { icon: Camera, label: "Daily Updates", desc: "Photos & videos" },
              { icon: Heart, label: "Trusted by 1000s", desc: "Happy pet parents" },
              { icon: Clock, label: "24/7 Support", desc: "We're here to help" }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-700 text-white mb-3 shadow-lg">
                  <item.icon className="w-7 h-7" />
                </div>
                <p className="font-bold text-sm mb-1">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Book Early */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Why Book Your Christmas Sitter <span className="text-red-600">Early?</span>
            </h2>
            <p className="text-center text-muted-foreground mb-12 text-lg">
              The best sitters get snapped up quickly during the festive season
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  emoji: "📅",
                  title: "Peak Dates Fill Fast",
                  desc: "Christmas Eve through Boxing Day are the most popular dates. Top-rated sitters are already receiving multiple requests."
                },
                {
                  emoji: "⭐",
                  title: "Best Sitters, Best Care",
                  desc: "Our highest-rated, most experienced sitters get booked first. Don't miss out on the cream of the crop for your precious pets."
                },
                {
                  emoji: "😌",
                  title: "Peace of Mind",
                  desc: "Book early and relax. No last-minute scrambling, no settling for less. Just pure holiday relaxation knowing your pets are sorted."
                }
              ].map((item, i) => (
                <Card key={i} className="border-2 border-red-200 dark:border-red-900 hover:shadow-xl transition-shadow">
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
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-red-50 dark:from-emerald-950/10 dark:to-red-950/10">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              What Your Pet Gets This <span className="text-emerald-700">Christmas</span>
            </h2>
            <p className="text-center text-muted-foreground mb-12 text-lg">
              Every booking includes these festive perks
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: "🏡", title: "Stay in Their Own Home", desc: "No stressful kennels. Your pet stays in their safe, familiar environment with all their favourite toys, bed, and routines intact." },
                { icon: "📸", title: "Daily Photo & Video Updates", desc: "Get adorable photos and videos sent straight to your phone every day. See your pet happy, healthy, and having a great time." },
                { icon: "💚", title: "One-on-One Attention", desc: "Your sitter focuses entirely on your pet. No sharing attention with dozens of other animals like at boarding facilities." },
                { icon: "🎄", title: "Holiday Routine Maintained", desc: "Christmas can be stressful for pets. Your sitter keeps their feeding, walking, and play schedule exactly as normal." },
                { icon: "🚨", title: "Emergency Vet Access", desc: "All sitters have access to 24/7 emergency vet contacts and know exactly what to do if anything comes up." },
                { icon: "🎁", title: "Special Christmas Treats", desc: "Let your sitter know about any special Christmas treats or toys and they'll make sure your pet feels the festive love!" }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start p-6 bg-background rounded-xl border-2 border-emerald-300 dark:border-emerald-900 hover:shadow-lg transition-shadow">
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

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Book in <span className="text-red-600">3 Simple Steps</span>
            </h2>
            <p className="text-center text-muted-foreground mb-12 text-lg">
              Getting your Christmas pet care sorted is easier than wrapping presents
            </p>

            <div className="space-y-8">
              {[
                {
                  num: "1",
                  title: "Tell Us About Your Pet & Dates",
                  desc: "Create a free profile and tell us about your furry friend - their personality, routines, any special needs. Select your Christmas travel dates."
                },
                {
                  num: "2",
                  title: "Browse Available Sitters",
                  desc: "See which verified, local sitters are still available for your dates. Read reviews, check their experience, and pick your perfect match."
                },
                {
                  num: "3",
                  title: "Book & Relax",
                  desc: "Send a booking request. Once accepted, you'll get your sitter's contact info. Chat, do a meet-and-greet, then enjoy your holiday worry-free!"
                }
              ].map((step) => (
                <div key={step.num} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center text-2xl font-bold shadow-xl">
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
                <Button size="lg" className="h-14 px-8 text-lg font-bold bg-emerald-700 hover:bg-emerald-800">
                  Start Your Search 🎅
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-red-50 to-emerald-50 dark:from-red-950/10 dark:to-emerald-950/10">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              What Pet Parents Say About Their <span className="text-emerald-700">Christmas Bookings</span>
            </h2>
            <p className="text-center text-muted-foreground mb-12 text-lg">
              Real reviews from real holiday bookings
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "Sarah & Max",
                  pet: "Golden Retriever",
                  text: "We went to the South Island for Christmas and our sitter sent us photos of Max every single day. He looked so happy! Best Christmas present ever.",
                  stars: 5
                },
                {
                  name: "James & Luna",
                  pet: "Tabby Cat",
                  text: "Luna hates change, so we were nervous about leaving her over New Year's. Our sitter kept her routine perfectly and Luna didn't even notice we were gone!",
                  stars: 5
                },
                {
                  name: "Emma & Buddy",
                  pet: "Beagle Mix",
                  text: "Booked last minute for Christmas Eve and got the perfect sitter. Buddy had an amazing time and we could actually relax on holiday. Will book again next year for sure!",
                  stars: 5
                }
              ].map((review, i) => (
                <Card key={i} className="border-2 border-emerald-300 dark:border-emerald-900">
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
              Christmas Booking <span className="text-red-600">FAQs</span>
            </h2>
            <p className="text-center text-muted-foreground mb-12 text-lg">
              Common questions about holiday pet sitting
            </p>

            <div className="space-y-4">
              {[
                {
                  q: "How much does Christmas pet sitting cost?",
                  a: "Prices vary by sitter, service type, and location, but typically range from $50-80/day for house sitting or $25-40 per drop-in visit. You'll see exact prices when browsing sitters - many offer holiday packages too!"
                },
                {
                  q: "What if my sitter cancels at the last minute?",
                  a: "While extremely rare, if your sitter has an emergency, we'll help you find a replacement immediately. Most of our sitters are incredibly reliable - cancellations are less than 1% of all bookings."
                },
                {
                  q: "Can I do a meet-and-greet before Christmas?",
                  a: "Absolutely! We highly recommend meeting your sitter beforehand so your pet gets comfortable with them. This also lets you go through routines, show where everything is, and ask any questions."
                },
                {
                  q: "What happens if my pet gets sick during the holidays?",
                  a: "All our sitters have emergency contacts and know what to do. They'll contact you immediately and can take your pet to the vet if needed. Make sure to leave your vet's details during booking."
                },
                {
                  q: "Do sitters work on Christmas Day?",
                  a: "Yes! Many of our sitters specifically choose to work Christmas Day because they love caring for pets. Your pet will get all their normal care, including festive cuddles!"
                },
                {
                  q: "How far in advance should I book?",
                  a: "For Christmas dates, we recommend booking at least 4-6 weeks in advance. Peak dates (Dec 23-27) fill up fastest, often 2-3 months ahead. Book now to secure the best sitters!"
                }
              ].map((faq, i) => (
                <Card key={i} className="border-2 border-red-200 dark:border-red-900">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2 flex items-start gap-2">
                      <Check className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-1" />
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
      <section className="py-20 bg-red-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-6xl">🎄</div>
          <div className="absolute top-20 right-20 text-5xl">⭐</div>
          <div className="absolute bottom-10 left-1/4 text-6xl">🎁</div>
          <div className="absolute bottom-20 right-1/3 text-5xl">❄️</div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Don&apos;t Leave Your Pet&apos;s Christmas to Chance
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-95">
              The best sitters are getting booked right now. Secure your spot today and give yourself 
              (and your pet) the gift of stress-free holiday travel.
            </p>
            <Link to="/find-sitters">
              <Button size="lg" variant="secondary" className="h-16 px-10 text-xl font-bold shadow-2xl hover:scale-105 transition-transform">
                🎅 Find Available Sitters Now
              </Button>
            </Link>
            <p className="text-sm mt-6 opacity-90">
              No credit card required to browse • Free to create a profile • Book in under 5 minutes
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
