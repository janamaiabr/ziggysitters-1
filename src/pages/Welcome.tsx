import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  PawPrint, 
  Search, 
  UserPlus, 
  Calendar,
  MessageCircle,
  ArrowRight,
  Shield
} from 'lucide-react';

import { useEventTracking } from '@/hooks/useEventTracking';

export default function Welcome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { trackPageView } = useEventTracking();
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Track page view
    trackPageView('welcome_page', { role: profile?.role });

    // Check if this is a new user (just signed up)
    const signUpTime = new Date(user.created_at).getTime();
    const now = Date.now();
    const timeDiff = now - signUpTime;
    const isNew = timeDiff < 5 * 60 * 1000;
    setIsNewUser(isNew);
  }, [user, navigate, profile?.role, trackPageView]);

  // No longer auto-redirect to wizard - let users explore freely
  // They can search without adding pets first

  const getNextSteps = () => {
    if (!profile?.role) {
      return [
        {
          icon: UserPlus,
          title: "Complete Your Profile",
          description: "Set up your profile and choose your role",
          action: "Get Started",
          path: "/onboarding"
        }
      ];
    }

    const steps = [];

    if (profile.role === 'pet_owner') {
      // Make searching the PRIMARY and MOST PROMINENT action
      steps.push({
        icon: Search,
        title: "Find a Sitter Now",
        description: "Browse available sitters in your area - no pet profile needed!",
        action: "Search Now",
        path: "/find-sitters",
        primary: true // Mark as primary
      });
      steps.push({
        icon: PawPrint,
        title: "Add Your Pet Later",
        description: "Optional: Share your pet's details when you're ready to book",
        action: "Add Pet",
        path: "/profile"
      });
    }

    if (profile.role === 'pet_sitter') {
      steps.push({
        icon: Calendar,
        title: "Complete Sitter Profile",
        description: "Add your services, availability, and rates",
        action: "Setup Profile",
        path: "/profile"
      });
    }

    return steps;
  };

  const getWelcomeMessage = () => {
    if (isNewUser) {
      return {
        title: "Welcome to ZiggySitters! 🎉",
        subtitle: "Your account has been created successfully. Let's get you started!"
      };
    }
    
    return {
      title: `Welcome back, ${profile?.first_name || 'there'}! 👋`,
      subtitle: "Great to see you again. Here's what you can do next."
    };
  };

  const { title, subtitle } = getWelcomeMessage();
  const nextSteps = getNextSteps();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden relative">
      <div className="w-full max-w-2xl space-y-6 relative z-10 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
        {/* Success Message */}
        <Card className="text-center shadow-xl border overflow-hidden relative bg-card">
          <CardHeader className="pb-6 relative">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="relative w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-xl">
                  <PawPrint className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <CheckCircle className="w-8 h-8 text-green-500 bg-white dark:bg-gray-900 rounded-full shadow-lg" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold text-foreground">
              {title}
            </CardTitle>
            <p className="text-lg text-muted-foreground mt-2">{subtitle}</p>
          </CardHeader>
        </Card>

        {/* Achievement Badges */}
        <div className="flex flex-wrap justify-center gap-3">
          <Badge className="px-5 py-2.5 text-base bg-green-500 text-white border-0 shadow-lg">
            <CheckCircle className="w-5 h-5 mr-2" />
            Account Created ✨
          </Badge>
          <Badge className="px-5 py-2.5 text-base bg-blue-500 text-white border-0 shadow-lg">
            <Shield className="w-5 h-5 mr-2" />
            Community Member 🎉
          </Badge>
          {profile?.role && (
            <Badge className="px-5 py-2.5 text-base bg-purple-500 text-white border-0 shadow-lg">
              <UserPlus className="w-5 h-5 mr-2" />
              Profile Started 🚀
            </Badge>
          )}
        </div>

        {/* Next Steps */}
        <Card className="shadow-xl border overflow-hidden relative bg-card">
          <CardHeader className="relative">
            <CardTitle className="text-2xl flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              <span className="text-foreground">Next Steps</span>
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Here are some things you can do to get the most out of ZiggySitters
            </p>
          </CardHeader>
          <CardContent className="space-y-4 relative">
            {nextSteps.map((step, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-5 rounded-xl border ${
                  (step as any).primary 
                    ? 'border-green-400 bg-green-50 dark:bg-green-950/30 shadow-lg' 
                    : 'border-border bg-muted/30'
                } hover:shadow-xl transition-all`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 ${
                    (step as any).primary 
                      ? 'bg-green-500' 
                      : 'bg-primary'
                  } rounded-full flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate(step.path)}
                  className={`flex-shrink-0 ${
                    (step as any).primary 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : ''
                  } shadow-lg`}
                  size={(step as any).primary ? "default" : "sm"}
                >
                  {step.action}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            size="lg"
            className="flex-1 h-14 text-lg border-2 transition-all hover:scale-105"
          >
            Explore Homepage 🏠
          </Button>
          {profile?.role ? (
            profile.role === 'pet_owner' ? (
              <Button 
                onClick={() => navigate('/find-sitters')}
                size="lg"
                className="flex-1 h-14 text-lg bg-green-500 hover:bg-green-600 shadow-xl transition-all hover:scale-105"
              >
                Find Pet Sitters 🔍
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={() => navigate('/profile')}
                size="lg"
                className="flex-1 h-14 text-lg shadow-xl transition-all hover:scale-105"
              >
                Complete Profile ✨
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )
          ) : (
            <Button 
              onClick={() => navigate('/onboarding')}
              size="lg"
              className="flex-1 h-14 text-lg shadow-xl transition-all hover:scale-105"
            >
              Complete Setup 🚀
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}