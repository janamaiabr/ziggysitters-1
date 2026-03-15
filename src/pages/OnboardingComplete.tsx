import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, Shield, Phone, Heart, Award, Search, Users, Home, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useProfile } from '@/contexts/ProfileContext';

export default function OnboardingComplete() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { profile, loading } = useProfile();

  const getNextSteps = () => {
    if (!profile) return [];

    if (profile.role === 'pet_owner') {
      return [
        {
          icon: Search,
          title: 'Find Pet Sitters',
          description: 'Browse and book local sitters in your area',
          action: 'Find Sitters',
          path: '/find-sitters'
        },
        {
          icon: Star,
          title: 'Complete Your Profile',
          description: 'Add more details about yourself and your pets',
          action: 'Go to Profile',
          path: '/profile'
        },
        {
          icon: Users,
          title: 'Manage Your Pets',
          description: 'Add your pets information for sitters',
          action: 'Add Pets',
          path: '/profile?tab=pets'
        }
      ];
    }

    if (profile.role === 'pet_sitter') {
      return [
        {
          icon: Star,
          title: 'Complete Your Profile',
          description: 'Add more details to attract pet owners',
          action: 'Go to Profile',
          path: '/profile'
        },
        {
          icon: Shield,
          title: 'Get Vetted',
          description: 'Upload documents to build trust with owners',
          action: 'Upload Documents',
          path: '/profile?tab=verification'
        },
        {
          icon: Heart,
          title: 'Set Your Services',
          description: 'Configure your services and pricing',
          action: 'Set Services',
          path: '/profile?tab=services'
        }
      ];
    }

    return [];
  };

  const nextSteps = getNextSteps();

  return (
    <div className={`min-h-screen bg-background ${isMobile ? 'p-4' : 'py-12'}`}>
      <div className={`container mx-auto ${isMobile ? 'px-0' : 'px-4'}`}>
        <div className={`max-w-${isMobile ? 'full' : '2xl'} mx-auto`}>
          <Card className="text-center border-border">
            <CardHeader className={isMobile ? 'p-6' : 'p-8'}>
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
              </div>

              <CardTitle className={`${isMobile ? 'text-xl' : 'text-2xl'} mb-4`}>
                Welcome to ZiggySitters
              </CardTitle>

              <p className={`text-muted-foreground ${isMobile ? 'text-base' : 'text-lg'} max-w-md mx-auto`}>
                {profile?.role === 'pet_owner'
                  ? "Your profile is ready. You can now find a trusted sitter."
                  : profile?.role === 'pet_sitter'
                  ? 'Your sitter profile is ready. Complete vetting to start accepting bookings.'
                  : 'Your profile has been created. You can now find or offer pet care services.'}
              </p>
            </CardHeader>

            <CardContent className={`space-y-6 ${isMobile ? 'p-6 pt-0' : 'p-8 pt-0'}`}>
              <div className="flex justify-center space-x-4">
                <Badge variant="secondary" className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Profile Created
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Community Member
                </Badge>
                {profile?.role === 'pet_sitter' && (
                  <Badge variant="outline" className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    {profile?.is_verified ? 'Vetted Sitter' : 'Vetting Pending'}
                  </Badge>
                )}
              </div>

              {loading ? (
                <div className="text-center">Loading...</div>
              ) : (
                <div className="space-y-4">
                  <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold`}>
                    {profile?.role === 'pet_owner' ? 'Get Started' : 'Next Steps'}
                  </h3>

                  <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4`}>
                    {nextSteps.map((step, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow border-border">
                        <CardContent className={isMobile ? 'p-4' : 'p-6'}>
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                              <step.icon className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">{step.title}</h4>
                              <p className="text-sm text-muted-foreground">{step.description}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(step.path)}
                              className="w-full"
                            >
                              {step.action}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>Need help? Contact support at hello@ziggysitters.com</span>
                </div>
              </div>

              <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-3 justify-center`}>
                <Button onClick={() => navigate('/')} className={isMobile ? 'w-full' : 'px-8'}>
                  <Home className="w-4 h-4 mr-2" />
                  Go to Homepage
                </Button>
                {profile?.role === 'pet_owner' ? (
                  <Button
                    variant="outline"
                    onClick={() => navigate('/find-sitters')}
                    className={isMobile ? 'w-full' : 'px-8'}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Find Sitters
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => navigate('/profile')}
                    className={isMobile ? 'w-full' : 'px-8'}
                  >
                    <UserCircle className="w-4 h-4 mr-2" />
                    Complete Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
