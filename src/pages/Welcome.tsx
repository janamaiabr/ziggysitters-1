import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';
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

export default function Welcome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check if this is a new user (just signed up)
    const signUpTime = new Date(user.created_at).getTime();
    const now = Date.now();
    const timeDiff = now - signUpTime;
    // Consider new user if account was created within the last 5 minutes
    setIsNewUser(timeDiff < 5 * 60 * 1000);
  }, [user, navigate]);

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
      steps.push({
        icon: Search,
        title: "Find Pet Sitters",
        description: "Browse verified sitters in your area",
        action: "Find Sitters",
        path: "/find-sitters"
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

    steps.push({
      icon: MessageCircle,
      title: "Get Help",
      description: "Have questions? Our support team is here to help",
      action: "Contact Support",
      path: "/contact"
    });

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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Success Message */}
        <Card className="text-center shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <PawPrint className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <CheckCircle className="w-6 h-6 text-green-500 bg-background rounded-full" />
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            <p className="text-muted-foreground">{subtitle}</p>
          </CardHeader>
        </Card>

        {/* Achievement Badges */}
        <div className="flex flex-wrap justify-center gap-3">
          <Badge variant="secondary" className="px-4 py-2">
            <CheckCircle className="w-4 h-4 mr-2" />
            Account Created
          </Badge>
          <Badge variant="secondary" className="px-4 py-2">
            <Shield className="w-4 h-4 mr-2" />
            Community Member
          </Badge>
          {profile?.role && (
            <Badge variant="secondary" className="px-4 py-2">
              <UserPlus className="w-4 h-4 mr-2" />
              Profile Started
            </Badge>
          )}
        </div>

        {/* Next Steps */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Next Steps</CardTitle>
            <p className="text-muted-foreground">
              Here are some things you can do to get the most out of ZiggySitters
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {nextSteps.map((step, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate(step.path)}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0"
                >
                  {step.action}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Support Information */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Need help getting started? Visit our{' '}
            <Button 
              variant="link" 
              className="p-0 h-auto text-sm"
              onClick={() => navigate('/how-it-works')}
            >
              How It Works
            </Button>{' '}
            page or{' '}
            <Button 
              variant="link" 
              className="p-0 h-auto text-sm"
              onClick={() => navigate('/contact')}
            >
              contact support
            </Button>
            .
          </p>
        </div>

        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="flex-1"
          >
            Explore Homepage
          </Button>
          {profile?.role ? (
            profile.role === 'pet_owner' ? (
              <Button 
                onClick={() => navigate('/find-sitters')}
                className="flex-1"
              >
                Find Pet Sitters
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={() => navigate('/profile')}
                className="flex-1"
              >
                Complete Profile
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )
          ) : (
            <Button 
              onClick={() => navigate('/onboarding')}
              className="flex-1"
            >
              Complete Setup
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}