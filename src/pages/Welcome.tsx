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
    const isNew = timeDiff < 5 * 60 * 1000;
    setIsNewUser(isNew);

    // For new pet owners, redirect to quick setup wizard
    if (isNew && profile?.role === 'pet_owner') {
      navigate('/quick-setup');
    }
  }, [user, navigate, profile?.role]);

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
      // Encourage BOTH searching AND adding pets
      steps.push({
        icon: Search,
        title: "Browse Pet Sitters",
        description: "See who's available in your area right now",
        action: "Find Sitters",
        path: "/find-sitters"
      });
      steps.push({
        icon: PawPrint,
        title: "Add Your Pet",
        description: "Help sitters prepare by sharing your pet's details",
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-blue-950/20 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Cute floating animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 text-5xl animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }}>🎉</div>
        <div className="absolute top-32 right-1/4 text-4xl animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}>💖</div>
        <div className="absolute top-40 left-1/3 text-3xl animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}>✨</div>
        <div className="absolute bottom-32 right-1/3 text-4xl animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2.2s' }}>🐾</div>
        <div className="absolute bottom-20 left-1/4 text-5xl animate-bounce" style={{ animationDelay: '2s', animationDuration: '2.8s' }}>🎊</div>
      </div>

      {/* Playful background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-20 w-80 h-80 bg-purple-300 dark:bg-purple-700 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-pink-300 dark:bg-pink-700 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-300 dark:bg-blue-700 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="w-full max-w-2xl space-y-6 relative z-10 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
        {/* Success Message */}
        <Card className="text-center shadow-2xl border-2 border-purple-200 dark:border-purple-800 overflow-hidden relative">
          {/* Decorative Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-blue-950/20 opacity-60"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-300 dark:bg-purple-700 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-300 dark:bg-pink-700 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          <CardHeader className="pb-6 relative">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce" style={{ animationDuration: '1.5s' }}>
                  <PawPrint className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <CheckCircle className="w-8 h-8 text-green-500 bg-white dark:bg-gray-900 rounded-full shadow-lg animate-pulse" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              {title}
            </CardTitle>
            <p className="text-lg text-muted-foreground mt-2">{subtitle}</p>
          </CardHeader>
        </Card>

        {/* Achievement Badges */}
        <div className="flex flex-wrap justify-center gap-3 animate-in fade-in duration-700" style={{ animationDelay: '200ms' }}>
          <Badge className="px-5 py-2.5 text-base bg-gradient-to-r from-green-400 to-green-600 text-white border-0 shadow-lg hover:scale-110 transition-transform">
            <CheckCircle className="w-5 h-5 mr-2" />
            Account Created ✨
          </Badge>
          <Badge className="px-5 py-2.5 text-base bg-gradient-to-r from-blue-400 to-blue-600 text-white border-0 shadow-lg hover:scale-110 transition-transform">
            <Shield className="w-5 h-5 mr-2" />
            Community Member 🎉
          </Badge>
          {profile?.role && (
            <Badge className="px-5 py-2.5 text-base bg-gradient-to-r from-purple-400 to-purple-600 text-white border-0 shadow-lg hover:scale-110 transition-transform">
              <UserPlus className="w-5 h-5 mr-2" />
              Profile Started 🚀
            </Badge>
          )}
        </div>

        {/* Next Steps */}
        <Card className="shadow-2xl border-2 border-pink-200 dark:border-pink-800 overflow-hidden relative animate-scale-in">
          {/* Decorative Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-blue-950/20 opacity-60"></div>
          
          <CardHeader className="relative">
            <CardTitle className="text-2xl flex items-center gap-3">
              <span className="text-3xl animate-bounce">🎯</span>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Next Steps
              </span>
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Here are some things you can do to get the most out of ZiggySitters 💫
            </p>
          </CardHeader>
          <CardContent className="space-y-4 relative">
            {nextSteps.map((step, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-5 rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 dark:hover:from-pink-950/20 dark:hover:to-purple-950/20 hover:shadow-xl transition-all hover:scale-[1.02]"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate(step.path)}
                  className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
                  size="sm"
                >
                  {step.action}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Support Information */}
        <div className="text-center text-sm bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-5 animate-in fade-in duration-700" style={{ animationDelay: '400ms' }}>
          <p className="font-medium">
            <span className="text-lg">💡</span> Need help getting started? Visit our{' '}
            <Button 
              variant="link" 
              className="p-0 h-auto text-sm font-bold text-purple-600 dark:text-purple-400 hover:underline"
              onClick={() => navigate('/how-it-works')}
            >
              How It Works
            </Button>{' '}
            page or{' '}
            <Button 
              variant="link" 
              className="p-0 h-auto text-sm font-bold text-purple-600 dark:text-purple-400 hover:underline"
              onClick={() => navigate('/contact')}
            >
              contact support
            </Button>
            . We're here to help! 🤗
          </p>
        </div>

        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            size="lg"
            className="flex-1 h-14 text-lg border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all hover:scale-105"
          >
            Explore Homepage 🏠
          </Button>
          {profile?.role ? (
            profile.role === 'pet_owner' ? (
              <Button 
                onClick={() => navigate('/find-sitters')}
                size="lg"
                className="flex-1 h-14 text-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 shadow-2xl transition-all hover:scale-105"
              >
                Find Pet Sitters 🔍
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={() => navigate('/profile')}
                size="lg"
                className="flex-1 h-14 text-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 shadow-2xl transition-all hover:scale-105"
              >
                Complete Profile ✨
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )
          ) : (
            <Button 
              onClick={() => navigate('/onboarding')}
              size="lg"
              className="flex-1 h-14 text-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 shadow-2xl transition-all hover:scale-105"
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