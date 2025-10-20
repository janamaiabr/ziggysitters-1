import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function TestDailyReportEmail() {
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState('');

  const handleTestEmail = async () => {
    if (!bookingId.trim()) {
      toast.error('Please enter a booking ID');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Sending test daily report email for booking:', bookingId);
      
      // Mock report data for testing
      const testReportData = {
        photo_urls: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1'],
        exercise_duration: 45,
        exercise_notes: 'Had a great walk in the park, very energetic today!',
        medication_given: true,
        medication_notes: 'Gave morning medication at 9am as scheduled',
        sleep_quality: 'good',
        sleep_notes: 'Slept well throughout the night',
        time_alone_hours: 2,
        food_consumption: 'all',
        food_notes: 'Finished all breakfast and dinner',
        general_notes: 'Great day overall! Very playful and affectionate. Enjoyed belly rubs and playtime.',
        mood: 'very_happy'
      };

      const { data, error } = await supabase.functions.invoke('send-daily-report-email', {
        body: {
          bookingId: bookingId,
          reportDate: new Date().toISOString(),
          reportData: testReportData
        }
      });
      
      console.log('Function response:', { data, error });
      
      if (error) {
        console.error('Error sending daily report email:', error);
        toast.error(`Failed: ${error.message}`);
        return;
      }
      
      toast.success('Daily report email sent successfully!');
    } catch (error: any) {
      console.error('Caught error:', error);
      toast.error(`Error: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test Daily Report Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Booking ID
              </label>
              <Input
                type="text"
                placeholder="Enter a valid booking ID"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter a booking ID from your database to test the email
              </p>
            </div>
            
            <Button 
              onClick={handleTestEmail}
              disabled={loading}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Test Daily Report Email
            </Button>

            <div className="text-sm text-muted-foreground border-t pt-4 mt-4">
              <p className="font-semibold mb-2">Test data being used:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Exercise: 45 minutes</li>
                <li>Mood: Very Happy 😊</li>
                <li>Food: Ate everything</li>
                <li>Sleep: Good quality</li>
                <li>Medication: Given</li>
                <li>Sample photo included</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
