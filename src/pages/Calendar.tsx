import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ArrowLeft, AlertCircle } from 'lucide-react';
import SitterCalendar from '@/components/calendar/SitterCalendar';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Calendar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading } = useProfile();

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'pet_sitter')) {
      navigate('/');
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (!profile || profile.role !== 'pet_sitter') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/profile')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <CalendarIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">My Calendar</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your availability and view upcoming bookings
          </p>
        </div>

        {!profile.onboarding_completed && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Complete your sitter onboarding to start accepting bookings. 
              <Button 
                variant="link" 
                className="p-0 h-auto ml-1" 
                onClick={() => navigate('/onboarding')}
              >
                Complete onboarding →
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Availability & Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SitterCalendar />
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-2">Calendar Tips:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Green dates</strong> show your confirmed bookings</li>
            <li>• <strong>Yellow dates</strong> indicate pending booking requests</li>
            <li>• Click any date to mark yourself unavailable or add notes</li>
            <li>• Your calendar automatically blocks dates when you accept bookings</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
