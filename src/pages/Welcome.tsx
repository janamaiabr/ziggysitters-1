import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';
import { CheckCircle, PawPrint, Search, UserPlus, Calendar, ArrowRight, Check } from 'lucide-react';
import { useEventTracking } from '@/hooks/useEventTracking';
import iconPaw from '@/assets/icons/icon-paw.png';
import iconShield from '@/assets/icons/icon-shield.png';
import iconStar from '@/assets/icons/icon-star.png';

export default function Welcome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { trackPageView } = useEventTracking();
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    trackPageView('welcome_page', { role: profile?.role });
    const signUpTime = new Date(user.created_at).getTime();
    setIsNewUser(Date.now() - signUpTime < 5 * 60 * 1000);
  }, [user, navigate, profile?.role, trackPageView]);

  const getNextSteps = () => {
    if (!profile?.role) {
      return [{ icon: UserPlus, title: "Complete Your Profile", description: "Set up your profile and choose your role", action: "Get Started", path: "/onboarding" }];
    }
    const steps = [];
    if (profile.role === 'pet_owner') {
      steps.push({ icon: Search, title: "Find a Sitter Now", description: "Browse available sitters in your area", action: "Search Now", path: "/find-sitters", primary: true });
      steps.push({ icon: PawPrint, title: "Add Your Pet Later", description: "Optional: Share your pet's details when you're ready to book", action: "Add Pet", path: "/profile" });
    }
    if (profile.role === 'pet_sitter') {
      steps.push({ icon: Calendar, title: "Complete Sitter Profile", description: "Add your services, availability, and rates", action: "Setup Profile", path: "/profile" });
    }
    return steps;
  };

  const title = isNewUser ? "Welcome to ZiggySitters!" : `Welcome back, ${profile?.first_name || 'there'}!`;
  const subtitle = isNewUser ? "Your account has been created successfully. Let's get you started!" : "Great to see you again. Here's what you can do next.";
  const nextSteps = getNextSteps();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
        <Card className="text-center shadow-lg border border-border bg-card">
          <CardHeader className="pb-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <img src={iconPaw} alt="" className="w-14 h-14" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <CheckCircle className="w-7 h-7 text-primary bg-card rounded-full" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-foreground font-display">{title}</CardTitle>
            <p className="text-lg text-muted-foreground mt-2 font-body">{subtitle}</p>
          </CardHeader>
        </Card>

        <div className="flex flex-wrap justify-center gap-3">
          <Badge className="px-4 py-2 text-sm bg-primary/10 text-primary border border-primary/20 font-body">
            <Check className="w-4 h-4 mr-2" /> Account Created
          </Badge>
          <Badge className="px-4 py-2 text-sm bg-secondary/10 text-secondary border border-secondary/20 font-body">
            <img src={iconShield} alt="" className="w-4 h-4 mr-2" /> Community Member
          </Badge>
        </div>

        <Card className="shadow-lg border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3 font-display text-foreground">
              <img src={iconStar} alt="" className="w-8 h-8" />
              Next Steps
            </CardTitle>
            <p className="text-muted-foreground mt-2 font-body">Here are some things you can do to get the most out of ZiggySitters</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {nextSteps.map((step, index) => (
              <div key={index} className={`flex items-center justify-between p-5 rounded-xl border ${(step as any).primary ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/30'} hover:shadow-md transition-all`}>
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 ${(step as any).primary ? 'bg-primary' : 'bg-secondary'} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <step.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground font-body">{step.title}</h3>
                    <p className="text-sm text-muted-foreground font-body">{step.description}</p>
                  </div>
                </div>
                <Button onClick={() => navigate(step.path)} className={`flex-shrink-0 font-body ${(step as any).primary ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`} size={(step as any).primary ? "default" : "sm"}>
                  {step.action} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button onClick={() => navigate('/')} variant="outline" size="lg" className="flex-1 h-14 text-lg font-body border-border">
            Explore Homepage
          </Button>
          {profile?.role ? (
            profile.role === 'pet_owner' ? (
              <Button onClick={() => navigate('/find-sitters')} size="lg" className="flex-1 h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90 font-body">
                Find Pet Sitters <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button onClick={() => navigate('/profile')} size="lg" className="flex-1 h-14 text-lg font-body">
                Complete Profile <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )
          ) : (
            <Button onClick={() => navigate('/onboarding')} size="lg" className="flex-1 h-14 text-lg font-body">
              Complete Setup <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
