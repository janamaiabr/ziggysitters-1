import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/seo/SEOHead";
import { YOUNG_WALKER_CONFIG } from "@/config/features";
import { 
  Dog, 
  Clock, 
  Shield, 
  DollarSign, 
  Heart, 
  CheckCircle2, 
  Star,
  Wallet,
  Sparkles,
  TrendingUp,
  Users,
  ArrowRight,
  Zap,
  Target,
  Rocket
} from "lucide-react";

export default function YoungWalkers() {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: <Wallet className="h-8 w-8" />,
      title: "Real Money, Real Skills",
      description: `Earn $${YOUNG_WALKER_CONFIG.MIN_RATE}-$${YOUNG_WALKER_CONFIG.MAX_RATE} per walk. Your first step to financial independence!`,
      color: "from-emerald-400 to-teal-500",
      bgColor: "bg-emerald-500/10"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Do What You Love",
      description: "Turn your passion for dogs into pocket money. Best. Job. Ever.",
      color: "from-pink-400 to-rose-500",
      bgColor: "bg-pink-500/10"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Fits Your Schedule",
      description: "After school, weekends, school holidays - you choose when you work!",
      color: "from-amber-400 to-orange-500",
      bgColor: "bg-amber-500/10"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Build Your Reputation",
      description: "Get reviews, grow your client base, and learn real business skills.",
      color: "from-violet-400 to-purple-500",
      bgColor: "bg-violet-500/10"
    }
  ];

  const safetyFeatures = [
    "Parent/caregiver registers & approves everything",
    "Only friendly, well-behaved dogs",
    "30-minute walks in your neighbourhood",
    `Ages ${YOUNG_WALKER_CONFIG.MIN_AGE}-${YOUNG_WALKER_CONFIG.MAX_AGE} only`,
    "No school hours (9am-3pm weekdays)",
    "One dog at a time",
    "Local walks only",
    "GPS tracking available"
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Parent Signs You Up",
      description: "Your parent/caregiver creates an account and sets up your profile",
      emoji: "👨‍👩‍👧",
      color: "bg-gradient-to-br from-blue-400 to-cyan-500"
    },
    {
      step: 2,
      title: "Set Your Hours",
      description: "Pick after-school and weekend times that work for you",
      emoji: "📅",
      color: "bg-gradient-to-br from-purple-400 to-pink-500"
    },
    {
      step: 3,
      title: "Get Bookings",
      description: "Local dog owners find you and request walks",
      emoji: "🐕",
      color: "bg-gradient-to-br from-amber-400 to-orange-500"
    },
    {
      step: 4,
      title: "Walk & Earn!",
      description: "Have fun with dogs and watch your savings grow",
      emoji: "💰",
      color: "bg-gradient-to-br from-emerald-400 to-teal-500"
    }
  ];

  const testimonials = [
    {
      name: "Emma, 14",
      suburb: "Mt Eden",
      quote: "I've saved up $800 for a new phone just walking dogs after school. Plus I get to hang out with the cutest dogs ever!",
      avatar: "🧒"
    },
    {
      name: "Jake, 16",
      suburb: "Ponsonby",
      quote: "Way better than asking parents for money. I walk 4 dogs a week and it's actually fun!",
      avatar: "👦"
    },
    {
      name: "Sophie's Mum",
      suburb: "Remuera",
      quote: "The safety features give me peace of mind. Sophie loves it and is learning responsibility.",
      avatar: "👩"
    }
  ];

  return (
    <>
      <SEOHead 
        title="Young Dog Walkers Auckland | Teen Dog Walking Jobs | ZiggySitters"
        description="Looking for your first job? Become a young dog walker in Auckland. Earn pocket money walking dogs after school. Safe, parent-approved platform for ages 12-17."
        canonical="/young-walkers"
      />

      {/* Hero Section - Split Layout with Image */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 min-h-[85vh] flex items-center">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-200/50 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-200/50 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div className="text-center lg:text-left">
              <Badge className="mb-6 bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 text-base px-4 py-2">
                <Sparkles className="h-4 w-4 mr-2" />
                For {YOUNG_WALKER_CONFIG.MIN_AGE}-{YOUNG_WALKER_CONFIG.MAX_AGE} Year Olds
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-800 mb-6 leading-tight">
                Turn Your Love of Dogs Into
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600">
                  Pocket Money! 💰
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Auckland's first safe, parent-approved platform for young entrepreneurs to earn money walking neighbourhood dogs.
              </p>

              {/* Important parent notice */}
              <div className="inline-flex items-center gap-3 bg-amber-100 border border-amber-300 rounded-2xl px-5 py-3 mb-8">
                <Users className="h-6 w-6 text-amber-600" />
                <span className="font-semibold text-amber-800">Parents register their child - it's quick & safe!</span>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-lg px-8 py-6 rounded-full font-bold shadow-xl shadow-purple-300 group"
                  onClick={() => navigate("/young-walker-registration")}
                >
                  <Rocket className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                  Parents: Register Your Child
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-slate-300 text-slate-700 hover:bg-slate-100 text-lg px-8 py-6 rounded-full font-bold"
                  onClick={() => navigate("/search-young-walkers")}
                >
                  <Dog className="mr-2 h-5 w-5" />
                  I'm a Dog Owner
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-slate-600 text-sm">
                <div className="flex items-center gap-2 bg-white/80 rounded-full px-4 py-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>100% Parent Controlled</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 rounded-full px-4 py-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>NZ Law Compliant</span>
                </div>
              </div>
            </div>

            {/* Right - Image */}
            <div className="relative hidden lg:block">
              <div className="relative">
                {/* Main image */}
                <img 
                  src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80" 
                  alt="Happy teenager walking a friendly dog"
                  className="rounded-3xl shadow-2xl w-full h-[550px] object-cover"
                />
                
                {/* Floating card - earnings */}
                <div className="absolute -left-8 top-20 bg-white rounded-2xl shadow-xl p-4 animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-emerald-600">${YOUNG_WALKER_CONFIG.SUGGESTED_RATE_PER_WALK}</p>
                      <p className="text-xs text-slate-500">per walk</p>
                    </div>
                  </div>
                </div>
                
                {/* Floating card - age badge */}
                <div className="absolute -right-4 bottom-32 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-2xl shadow-xl px-6 py-4">
                  <p className="font-bold text-lg">Ages {YOUNG_WALKER_CONFIG.MIN_AGE}-{YOUNG_WALKER_CONFIG.MAX_AGE}</p>
                  <p className="text-sm text-white/80">Perfect first job!</p>
                </div>

                {/* Decorative paw prints */}
                <div className="absolute -top-6 right-12 text-5xl opacity-20">🐾</div>
                <div className="absolute -bottom-4 left-20 text-4xl opacity-20">🐾</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* "Why Join" Benefits - Colorful Cards */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0">
              <Zap className="h-4 w-4 mr-1" />
              Why Young Walkers Love It
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-4">
              Your First Business
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-600"> Starts Here</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              More than pocket money – you're building skills, responsibility, and a reputation
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card 
                key={index} 
                className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white"
              >
                <CardContent className="pt-8 pb-6 relative z-10">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-6 text-white shadow-lg`}>
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-600">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - with image */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Image */}
            <div className="relative order-2 lg:order-1">
              <img 
                src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80" 
                alt="Friendly dog ready for a walk"
                className="rounded-3xl shadow-xl w-full h-[500px] object-cover"
              />
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl -z-10" />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl -z-10" />
            </div>

            {/* Right - Steps */}
            <div className="order-1 lg:order-2">
              <Badge className="mb-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0">
                Super Easy to Start
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-8">
                How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">Works</span>
              </h2>
              
              <div className="space-y-6">
                {howItWorks.map((step) => (
                  <div key={step.step} className="flex items-start gap-4 group">
                    <div className={`flex-shrink-0 w-14 h-14 ${step.color} rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      {step.step}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{step.emoji}</span>
                        <h3 className="text-lg font-bold text-slate-800">{step.title}</h3>
                      </div>
                      <p className="text-slate-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Important parent callout */}
              <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">👨‍👩‍👧‍👦</span>
                  <div>
                    <h3 className="font-bold text-slate-800 mb-1">Parents Are In Control</h3>
                    <p className="text-sm text-slate-600">
                      All registrations must be done by a parent or caregiver. You approve every booking and receive all payments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Earnings Showcase */}
      <section className="py-20 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <DollarSign className="h-4 w-4 mr-1" />
              Real Earning Potential
            </Badge>
            
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              See What You Could Earn 💵
            </h2>
            
            <p className="text-xl text-white/90 mb-12">
              At ${YOUNG_WALKER_CONFIG.SUGGESTED_RATE_PER_WALK} per walk, doing just 3 walks per week...
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <p className="text-5xl font-black text-yellow-300 mb-2">${YOUNG_WALKER_CONFIG.SUGGESTED_RATE_PER_WALK * 3}</p>
                <p className="text-white/80 font-medium">Per Week</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 border border-white/30 transform md:scale-110 shadow-xl">
                <p className="text-6xl font-black text-yellow-300 mb-2">${YOUNG_WALKER_CONFIG.SUGGESTED_RATE_PER_WALK * 3 * 4}</p>
                <p className="text-white/80 font-medium">Per Month</p>
                <Badge className="mt-2 bg-yellow-400 text-slate-900 border-0">Most Popular</Badge>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <p className="text-5xl font-black text-yellow-300 mb-2">${YOUNG_WALKER_CONFIG.SUGGESTED_RATE_PER_WALK * 3 * 52}</p>
                <p className="text-white/80 font-medium">Per Year</p>
              </div>
            </div>

            <p className="text-lg text-white/80">
              🎮 That's enough for a new gaming console, 📱 a phone upgrade, or 💰 serious savings!
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials with images */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0">
              <Star className="h-4 w-4 mr-1" />
              Success Stories
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-4">
              Hear From Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">Young Walkers</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-slate-50 to-white">
                <CardContent className="pt-8">
                  <div className="text-5xl mb-4">{testimonial.avatar}</div>
                  <p className="text-slate-600 mb-6 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-bold text-slate-800">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.suburb}, Auckland</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Section - Side by side with image */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div>
                <Badge className="mb-4 bg-green-100 text-green-700 border-green-200">
                  <Shield className="h-4 w-4 mr-1" />
                  Parent Peace of Mind
                </Badge>
                <h2 className="text-4xl font-black text-slate-800 mb-6">
                  Safety Is Our <span className="text-green-600">#1 Priority</span>
                </h2>
                <p className="text-lg text-slate-600 mb-8">
                  We've designed this program with NZ employment law and child safety at its core. 
                  Parents control everything.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {safetyFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 bg-white rounded-xl p-3 shadow-sm">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Image */}
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80" 
                  alt="Safe dog walking in neighbourhood"
                  className="rounded-3xl shadow-xl w-full h-[450px] object-cover"
                />
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">100% Safe</p>
                    <p className="text-sm text-slate-500">Parent approved</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="text-6xl mb-6">🐕</div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Ready to Start Your <span className="text-yellow-300">Dog Walking Business?</span>
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Parents: It takes just 5 minutes to register your child. 
              Help them earn pocket money doing something they love!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                className="bg-white text-purple-700 hover:bg-white/90 text-lg px-10 py-7 rounded-full font-bold shadow-2xl group"
                onClick={() => navigate("/young-walker-registration")}
              >
                <Target className="mr-2 h-6 w-6" />
                Parents: Register Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <p className="text-white/70 text-sm">
              Free to join • No commitment • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">Quick Questions</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-800 mb-2">How old do I need to be?</h3>
                <p className="text-slate-600">
                  Young Walkers must be between {YOUNG_WALKER_CONFIG.MIN_AGE} and {YOUNG_WALKER_CONFIG.MAX_AGE} years old. 
                  Your parent/caregiver must register you.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-800 mb-2">What dogs can I walk?</h3>
                <p className="text-slate-600">
                  For safety, Young Walkers only walk small to medium sized dogs that are well-behaved. 
                  One dog at a time.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-800 mb-2">When can I walk dogs?</h3>
                <p className="text-slate-600">
                  After school (3pm onwards), weekends, and school holidays. Not during school hours!
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-8">
            <Link to="/faq" className="text-purple-600 hover:text-purple-700 font-medium">
              View all FAQs →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
