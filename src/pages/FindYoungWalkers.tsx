import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/seo/SEOHead";
import { YOUNG_WALKER_CONFIG } from "@/config/features";
import { 
  Dog, 
  Clock, 
  Shield, 
  DollarSign, 
  Heart, 
  MapPin, 
  CheckCircle2, 
  Users,
  Sparkles,
  Calendar,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function FindYoungWalkers() {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: "Fixed $10 Rate",
      description: `Just $${YOUNG_WALKER_CONFIG.SUGGESTED_RATE_PER_WALK} per ${YOUNG_WALKER_CONFIG.MAX_WALK_DURATION}-min walk`,
      color: "from-emerald-400 to-teal-500"
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Local Neighbourhood",
      description: "Young walkers stay within 2km of pickup",
      color: "from-blue-400 to-cyan-500"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Enthusiastic Care",
      description: "Young people who genuinely love dogs",
      color: "from-pink-400 to-rose-500"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Support Youth",
      description: "Help local young people earn & learn",
      color: "from-violet-400 to-purple-500"
    }
  ];

  const requirements = [
    { icon: <Dog className="h-5 w-5" />, text: "Small to medium dogs only" },
    { icon: <Heart className="h-5 w-5" />, text: "Well-behaved, doesn't pull on lead" },
    { icon: <Clock className="h-5 w-5" />, text: `${YOUNG_WALKER_CONFIG.MAX_WALK_DURATION}-minute walks` },
    { icon: <Calendar className="h-5 w-5" />, text: "After school (3pm+) & weekends" }
  ];

  const safetyChecklist = [
    "Dog has no history of aggression",
    "Dog is comfortable with new people",
    "Dog doesn't pull excessively on lead",
    "Walking routes are on safe footpaths"
  ];

  return (
    <>
      <SEOHead 
        title="Find Young Dog Walkers Auckland | Affordable Dog Walking | ZiggySitters"
        description="Find enthusiastic young dog walkers in your Auckland neighbourhood. Affordable rates, safe & supervised walks. Support local youth while your dog gets exercise."
        canonical="/find-young-walkers"
      />

      {/* Hero Section - Modern Split Layout */}
      <section className="relative bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 min-h-[80vh] flex items-center overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200/50 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200/50 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div className="text-center lg:text-left">
              <Badge className="mb-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 text-base px-4 py-2">
                <DollarSign className="h-4 w-4 mr-2" />
                Budget-Friendly Dog Walks
              </Badge>
              
              <h1 className="text-5xl md:text-6xl font-black text-slate-800 mb-6 leading-tight">
                Affordable Dog Walks by
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500">
                  Local Young People
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 mb-6 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Perfect for small to medium dogs who need regular short walks. 
                Support local youth while your dog gets exercise!
              </p>

              {/* Price highlight */}
              <div className="inline-flex items-center gap-3 bg-white border-2 border-emerald-200 rounded-2xl px-6 py-4 mb-8 shadow-lg">
                <div className="text-4xl font-black text-emerald-600">${YOUNG_WALKER_CONFIG.SUGGESTED_RATE_PER_WALK}</div>
                <div className="text-left">
                  <p className="font-semibold text-slate-800">per {YOUNG_WALKER_CONFIG.MAX_WALK_DURATION}-min walk</p>
                  <p className="text-sm text-slate-500">Fixed price, no surprises</p>
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-lg px-8 py-6 rounded-full font-bold shadow-xl shadow-emerald-200 group"
                  onClick={() => navigate("/search-young-walkers")}
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  Search Young Walkers Near Me
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-100 text-lg px-8 py-6 rounded-full font-bold"
                  onClick={() => navigate("/young-walkers")}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  My Child Wants to Walk Dogs
                </Button>
              </div>
            </div>

            {/* Right - Image */}
            <div className="relative hidden lg:block">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80" 
                  alt="Happy dog ready for a walk"
                  className="rounded-3xl shadow-2xl w-full h-[500px] object-cover"
                />
                
                {/* Floating card - safety */}
                <div className="absolute -left-8 bottom-20 bg-white rounded-2xl shadow-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Parent Supervised</p>
                      <p className="text-xs text-slate-500">Safe & local walks</p>
                    </div>
                  </div>
                </div>
                
                {/* Floating card - compare */}
                <div className="absolute -right-4 top-20 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 rounded-2xl shadow-xl px-5 py-3">
                  <p className="text-sm text-amber-800 font-medium">💡 Save vs regular sitters</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
              Why Choose Young Walkers?
            </Badge>
            <h2 className="text-4xl font-black text-slate-800 mb-4">
              Great for Dogs, <span className="text-emerald-600">Great for Your Wallet</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <CardContent className="pt-8 text-center">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mx-auto mb-4 text-white shadow-lg`}>
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{benefit.title}</h3>
                  <p className="text-slate-600 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left - Content */}
              <div>
                <Badge className="mb-4 bg-amber-100 text-amber-700 border-amber-200">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Is This Right for My Dog?
                </Badge>
                <h2 className="text-3xl font-black text-slate-800 mb-6">
                  Best for Calm, Friendly Dogs
                </h2>
                <p className="text-slate-600 mb-8">
                  Young Walkers are great for well-behaved small to medium dogs. 
                  For larger dogs or longer stays, check our regular pet sitters.
                </p>
                
                <div className="space-y-4 mb-8">
                  {requirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                        {req.icon}
                      </div>
                      <span className="font-medium text-slate-700">{req.text}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  onClick={() => navigate("/find-sitters")}
                  className="text-slate-600"
                >
                  Need a regular sitter instead? →
                </Button>
              </div>

              {/* Right - Safety Checklist */}
              <Card className="border-2 border-amber-200 bg-amber-50/50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-amber-600" />
                    <CardTitle className="text-xl">Before You Book</CardTitle>
                  </div>
                  <CardDescription>
                    Please confirm these about your dog:
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {safetyChecklist.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Compare Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-slate-800 mb-4">
                Young Walker vs Regular Sitter
              </h2>
              <p className="text-slate-600">Choose what's right for your dog</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Young Walker */}
              <Card className="border-2 border-emerald-200 bg-emerald-50/30">
                <CardHeader className="text-center pb-2">
                  <Badge className="w-fit mx-auto mb-2 bg-emerald-500 text-white border-0">Best Value</Badge>
                  <CardTitle className="text-2xl">Young Walker</CardTitle>
                  <div className="text-4xl font-black text-emerald-600">${YOUNG_WALKER_CONFIG.SUGGESTED_RATE_PER_WALK}</div>
                  <p className="text-sm text-slate-500">per {YOUNG_WALKER_CONFIG.MAX_WALK_DURATION}-min walk</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>{YOUNG_WALKER_CONFIG.MAX_WALK_DURATION}-minute neighbourhood walks</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Small to medium dogs</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>After school & weekends</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Photo update after walk</span>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600" 
                    onClick={() => navigate("/search-young-walkers")}
                  >
                    Find Young Walkers
                  </Button>
                </CardContent>
              </Card>

              {/* Regular Sitter */}
              <Card className="border-2 border-slate-200">
                <CardHeader className="text-center pb-2">
                  <Badge className="w-fit mx-auto mb-2 bg-slate-500 text-white border-0">Full Service</Badge>
                  <CardTitle className="text-2xl">Regular Sitter</CardTitle>
                  <div className="text-4xl font-black text-slate-700">$50+</div>
                  <p className="text-sm text-slate-500">per day</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-slate-500" />
                    <span>All day/overnight care</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-slate-500" />
                    <span>All dog sizes & types</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-slate-500" />
                    <span>Flexible scheduling</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-slate-500" />
                    <span>Daily photo reports</span>
                  </div>
                  <Button 
                    variant="outline"
                    className="w-full mt-4" 
                    onClick={() => navigate("/find-sitters")}
                  >
                    Find Regular Sitters
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="text-5xl mb-6">🐕</div>
            <h2 className="text-4xl font-black text-white mb-6">
              Ready to Find a Young Walker?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Your dog gets exercise, a young person earns pocket money, 
              and you support your local community. Everyone wins!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-emerald-700 hover:bg-white/90 text-lg px-10 py-7 rounded-full font-bold shadow-2xl group"
                onClick={() => navigate("/search-young-walkers")}
              >
                Find Young Walkers Near Me
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
