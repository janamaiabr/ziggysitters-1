import { Link, useNavigate } from "react-router-dom";
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
  Wallet,
  Calendar
} from "lucide-react";

export default function YoungWalkers() {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: <Wallet className="h-6 w-6" />,
      title: "Earn Pocket Money",
      description: `Earn $${YOUNG_WALKER_CONFIG.MIN_RATE}-$${YOUNG_WALKER_CONFIG.MAX_RATE} per walk. Perfect for saving up!`
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Love Dogs?",
      description: "Turn your passion for dogs into your first job experience."
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "After School Hours",
      description: "Flexible scheduling that works around school. Walk dogs after 3pm on weekdays."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Safe & Supervised",
      description: "Parent-approved platform with safety guidelines and local neighbourhood walks only."
    }
  ];

  const safetyFeatures = [
    "Parent/caregiver must register and approve",
    "Only small to medium, well-behaved dogs",
    "Maximum 30-minute walks in local area",
    `Walkers must be ${YOUNG_WALKER_CONFIG.MIN_AGE}-${YOUNG_WALKER_CONFIG.MAX_AGE} years old`,
    "No work during school hours (9am-3pm weekdays)",
    "No evening walks after 10pm",
    "One dog at a time for safety",
    "GPS tracking available for parents"
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Parent Signs Up",
      description: "A parent or caregiver creates an account and registers their child as a Young Walker."
    },
    {
      step: 2,
      title: "Set Availability",
      description: "Choose after-school hours and weekends when your child is available to walk dogs."
    },
    {
      step: 3,
      title: "Get Matched",
      description: "Local dog owners find your child's profile and request walks for their friendly dogs."
    },
    {
      step: 4,
      title: "Walk & Earn",
      description: "Complete safe, supervised walks and earn money directly to your account."
    }
  ];

  return (
    <>
      <SEOHead 
        title="Young Dog Walkers Auckland | Teen Dog Walking Jobs | ZiggySitters"
        description="Looking for your first job? Become a young dog walker in Auckland. Earn pocket money walking dogs after school. Safe, parent-approved platform for ages 12-17."
        canonical="/young-walkers"
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              Ages {YOUNG_WALKER_CONFIG.MIN_AGE}-{YOUNG_WALKER_CONFIG.MAX_AGE} Welcome
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Become a <span className="text-primary">Young Dog Walker</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Love dogs? Want to earn pocket money? Join Auckland's first platform designed 
              specifically for young people to walk dogs safely in their neighbourhood.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/auth?role=young_walker")}>
                <Dog className="mr-2 h-5 w-5" />
                Register as Young Walker
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/find-young-walkers")}>
                I'm a Dog Owner
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Parent/caregiver registration required
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Become a Young Walker?</h2>
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
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step) => (
              <div key={step.step} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {step.step < 4 && (
                  <div className="hidden lg:block absolute top-6 left-[60%] w-[80%] h-0.5 bg-primary/20" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Safety First</h2>
              <p className="text-muted-foreground">
                We've designed this program with NZ employment law and child safety as our top priority.
              </p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {safetyFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Earnings Calculator Preview */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Earn While You Learn</h2>
            <p className="text-muted-foreground mb-8">
              At ${YOUNG_WALKER_CONFIG.SUGGESTED_RATE_PER_WALK} per walk, doing just 3 walks a week means:
            </p>
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-primary">${YOUNG_WALKER_CONFIG.SUGGESTED_RATE_PER_WALK * 3}</p>
                  <p className="text-sm text-muted-foreground">Per Week</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-primary">${YOUNG_WALKER_CONFIG.SUGGESTED_RATE_PER_WALK * 3 * 4}</p>
                  <p className="text-sm text-muted-foreground">Per Month</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-primary">${YOUNG_WALKER_CONFIG.SUGGESTED_RATE_PER_WALK * 3 * 52}</p>
                  <p className="text-sm text-muted-foreground">Per Year</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join Auckland's community of young dog walkers. Parents, register your child today 
            and help them earn pocket money while doing something they love.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate("/auth?role=young_walker")}
          >
            Register Now (Parent Required)
          </Button>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Common Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How old do I need to be?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Young Walkers must be between {YOUNG_WALKER_CONFIG.MIN_AGE} and {YOUNG_WALKER_CONFIG.MAX_AGE} years old. 
                  If you're under {YOUNG_WALKER_CONFIG.ADULT_SUPERVISION_REQUIRED_UNDER}, an adult must be nearby during walks.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What dogs can I walk?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  For safety, Young Walkers only walk small to medium sized dogs that are well-behaved 
                  and don't pull on the lead. One dog at a time.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">When can I walk dogs?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Under NZ law, you can't work during school hours (9am-3pm on school days) or late at night 
                  (after 10pm). After-school hours and weekends are perfect!
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-8">
            <Link to="/faq" className="text-primary hover:underline">
              View all FAQs →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}