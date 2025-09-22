import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, CheckCircle, Mail, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OnboardingLayout from '@/components/layout/OnboardingLayout';

export default function OnboardingPendingApproval() {
  const navigate = useNavigate();

  return (
    <OnboardingLayout>
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-yellow-100 rounded-full">
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">Profile Submitted for Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Thank you for completing your sitter profile! Your submission has been received and is now under review.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    What happens next?
                  </h3>
                  
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-primary">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Admin Review</p>
                        <p>Our team will review your profile, services, and any uploaded documents within 24-48 hours.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-primary">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Email Notification</p>
                        <p>You'll receive an email notification once your profile has been approved or if we need additional information.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-primary">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Start Receiving Bookings</p>
                        <p>Once approved, your profile will be visible to pet owners and you can start receiving booking requests!</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">In the meantime...</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        You can browse other sitters to see how they structure their profiles, or explore the platform to familiarize yourself with how bookings work.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/find-sitters')}
                    className="flex-1"
                  >
                    Browse Sitters
                  </Button>
                  <Button 
                    onClick={() => navigate('/profile')}
                    className="flex-1"
                  >
                    View My Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}