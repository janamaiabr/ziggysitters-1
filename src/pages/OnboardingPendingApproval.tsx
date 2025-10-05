import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Shield, CheckCircle, AlertCircle, Mail, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/contexts/ProfileContext';

export default function OnboardingPendingApproval() {
  const navigate = useNavigate();
  const { profile } = useProfile();

  const getVerificationStatus = () => {
    if (!profile) return 'pending';
    
    if (profile.is_verified || profile.verification_status === 'verified') {
      return 'approved';
    } else if (profile.verification_status === 'rejected') {
      return 'rejected';
    }
    return 'pending';
  };

  const status = getVerificationStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader className="p-8">
              <div className="flex justify-center mb-4">
                {status === 'approved' ? (
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                ) : status === 'rejected' ? (
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-10 h-10 text-red-600" />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="w-10 h-10 text-yellow-600" />
                  </div>
                )}
              </div>
              
              <CardTitle className="text-2xl mb-4">
                {status === 'approved' 
                  ? '🎉 Profile Approved!' 
                  : status === 'rejected'
                  ? '❌ Profile Not Approved'
                  : '⏳ Profile Under Review'}
              </CardTitle>
              
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                {status === 'approved'
                  ? "Congratulations! Your sitter profile has been verified. You can now start accepting bookings!"
                  : status === 'rejected'
                  ? "Your profile verification was not approved. Please update your information and documents, then contact support."
                  : "Thank you for completing your sitter profile! Our team is reviewing your information and will notify you via email once the verification is complete."}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6 p-8 pt-0">
              {/* Status Badge */}
              <div className="flex justify-center">
                <Badge 
                  variant={status === 'approved' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary'}
                  className="flex items-center gap-2 px-4 py-2"
                >
                  {status === 'approved' ? (
                    <>
                      <Shield className="w-4 h-4" />
                      Verified Sitter
                    </>
                  ) : status === 'rejected' ? (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      Verification Rejected
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4" />
                      Pending Verification
                    </>
                  )}
                </Badge>
              </div>

              {/* Next Steps */}
              {status === 'pending' && (
                <div className="bg-muted/50 rounded-lg p-6 text-left">
                  <h3 className="font-semibold mb-3">What happens next?</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start">
                      <span className="mr-2">1.</span>
                      <span>Our team will review your profile and verification documents</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">2.</span>
                      <span>You'll receive an email notification (usually within 24-48 hours)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">3.</span>
                      <span>Once approved, you can start accepting booking requests</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">4.</span>
                      <span>Make sure to connect your bank account in your profile to receive payments</span>
                    </li>
                  </ul>
                </div>
              )}

              {status === 'approved' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-semibold text-green-900 mb-2">Important Next Step!</h3>
                  <p className="text-sm text-green-700 mb-4">
                    Before you can accept bookings, you need to connect your bank account to receive payments.
                  </p>
                  <Button 
                    onClick={() => navigate('/profile?tab=verification')}
                    variant="default"
                    className="w-full"
                  >
                    Connect Bank Account
                  </Button>
                </div>
              )}

              {status === 'rejected' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="font-semibold text-red-900 mb-2">What to do?</h3>
                  <p className="text-sm text-red-700 mb-4">
                    Please update your profile information and re-upload clear, valid verification documents.
                    Contact support if you need assistance.
                  </p>
                </div>
              )}

              {/* Contact Support */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>Questions? Contact us at hello@ziggysitters.com</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => navigate('/')}
                  className="px-8"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Homepage
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/profile')}
                  className="px-8"
                >
                  View My Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
