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
  Star,
  Users,
  Sparkles,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function FindYoungWalkers() {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Affordable Rates",
      description: `Just $${YOUNG_WALKER_CONFIG.SUGGESTED_RATE_PER_WALK} per 30-minute walk. Great value for regular exercise.`
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Local Neighbourhood",
      description: "Young walkers stay within 2km of pickup. Quick, convenient walks near home."
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Enthusiastic Care",
      description: "Young people who genuinely love dogs and are eager to spend time with your pet."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Support Youth",
      description: "Help local young people learn responsibility and earn their first income."
    }
  ];

  const requirements = [
    {
      icon: <Dog className="h-5 w-5" />,
      title: "Dog Size",
      description: "Small to medium dogs only (no large or giant breeds)"
    },
    {
      icon: <Heart className="h-5 w-5" />,
      title: "Temperament",
      description: "Well-behaved dogs that don't pull strongly on lead"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Walk Duration",
      description: "30-minute walks maximum"
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      title: "Timing",
      description: "After school hours (3pm+) and weekends"
    }
  ];

  const safetyChecklist = [
    "Dog has no history of aggression",
    "Dog is comfortable with new people",
    "Dog doesn't pull excessively on lead",
    "Walking routes are on safe footpaths",
    "Emergency contact numbers provided",
    "Weather-appropriate scheduling only"
  ];

  return (
    <>
      <SEOHead 
        title="Find Young Dog Walkers Auckland | Affordable Dog Walking | ZiggySitters"
        description="Find enthusiastic young dog walkers in your Auckland neighbourhood. Affordable rates, safe & supervised walks. Support local youth while your dog gets exercise."
        canonical="/find-young-walkers"
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-secondary/10 via-background to-primary/10 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-secondary/20 text-secondary-foreground border-secondary/30">
              Affordable Local Dog Walking
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Find a <span className="text-primary">Young Dog Walker</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connect with enthusiastic young people in your neighbourhood who love dogs. 
              Affordable walks, happy dogs, and you're supporting local youth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/search-young-walkers")}>
                <Dog className="mr-2 h-5 w-5" />
                Find Young Walkers Near Me
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/young-walkers")}>
                My Child Wants to Walk Dogs
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It's Different */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Alert className="mb-12 border-primary/30 bg-primary/5">
              <Sparkles className="h-5 w-5 text-primary" />
              <AlertTitle>What makes Young Walker different?</AlertTitle>
              <AlertDescription>
                Young Walkers are {YOUNG_WALKER_CONFIG.MIN_AGE}-{YOUNG_WALKER_CONFIG.MAX_AGE} year olds who walk dogs 
                after school for pocket money. It's a great option for well-behaved small/medium dogs who need 
                regular short walks. For longer stays or multiple pets, check our{" "}
                <a href="/find-sitters" className="text-primary hover:underline">regular pet sitters</a>.
              </AlertDescription>
            </Alert>

            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Young Walkers?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                      {benefit.icon}
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Is Young Walker Right for My Dog?</h2>
            <p className="text-center text-muted-foreground mb-12">
              Young Walkers work best for calm, friendly dogs. Here's what to consider:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {requirements.map((req, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        {req.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{req.title}</h3>
                        <p className="text-muted-foreground text-sm">{req.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Safety Checklist */}
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <CardTitle>Dog Owner Checklist</CardTitle>
                </div>
                <CardDescription>
                  Please confirm these before booking a Young Walker:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {safetyChecklist.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Simple, Affordable Pricing</h2>
            <Card className="border-2 border-primary">
              <CardHeader className="bg-primary/5">
                <Badge className="w-fit mx-auto mb-2">Most Popular</Badge>
                <CardTitle className="text-4xl">${YOUNG_WALKER_CONFIG.SUGGESTED_RATE_PER_WALK}</CardTitle>
                <CardDescription>per 30-minute walk</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3 text-left">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>30-minute neighbourhood walk</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Fresh water and treats (if allowed)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Photo update after walk</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Direct messaging with walker's parent</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" size="lg" onClick={() => navigate("/auth?role=pet_owner")}>
                  Get Started
                </Button>
              </CardContent>
            </Card>
            <p className="mt-4 text-sm text-muted-foreground">
              Payment processed securely. A small platform fee applies.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="font-semibold mb-2">Browse Young Walkers</h3>
                <p className="text-muted-foreground text-sm">
                  Find young walkers in your suburb. See their availability and reviews.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="font-semibold mb-2">Book & Confirm</h3>
                <p className="text-muted-foreground text-sm">
                  Choose a time slot, confirm your dog's details, and pay securely online.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="font-semibold mb-2">Walk Day</h3>
                <p className="text-muted-foreground text-sm">
                  Walker picks up your dog, takes them for a walk, and sends you a photo update.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find a Young Walker?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Your dog gets exercise, a young person earns pocket money, 
            and you support your local community. Everyone wins!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate("/search-young-walkers")}
            >
              Find Young Walkers Near Me
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate("/find-sitters")}
            >
              Or Browse Regular Sitters
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}