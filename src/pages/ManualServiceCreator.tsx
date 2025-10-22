import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';
import { supabase } from '@/integrations/supabase/client';

export default function ManualServiceCreator() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [serviceType, setServiceType] = useState<'drop_in_visits' | 'pet_sitting_owners_home' | 'pet_sitting_sitters_home'>('drop_in_visits');
  const [hourlyRate, setHourlyRate] = useState('');
  const [dailyRate, setDailyRate] = useState('');

  const handleCreateService = async () => {
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "Profile ID not found. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }

    // Set default rates based on service type if not provided
    let defaultHourly = hourlyRate;
    let defaultDaily = dailyRate;
    
    if (!hourlyRate && serviceType === 'drop_in_visits') defaultHourly = '30';
    if (!dailyRate && serviceType === 'pet_sitting_owners_home') defaultDaily = '50';
    if (!dailyRate && serviceType === 'pet_sitting_sitters_home') defaultDaily = '60';

    setLoading(true);
    console.log('=== Manual Service Creation ===');
    console.log('profile.id:', profile.id);
    console.log('user.id:', user?.id);
    console.log('serviceType:', serviceType);

    try {
      const serviceData = {
        sitter_id: profile.id,
        service_type: serviceType as any,
        description: 'Manually created service for testing - with rates!',
        experience_years: 1,
        has_fenced_yard: false,
        accepted_pet_species: ['dog', 'cat'] as any,
        accepted_pet_sizes: ['small', 'medium'] as any,
        allows_senior_pets: true,
        allows_puppies: true,
        max_pets: 2,
        hourly_rate: defaultHourly ? parseFloat(defaultHourly) : null,
        daily_rate: defaultDaily ? parseFloat(defaultDaily) : null,
        overnight_rate: null
      };

      console.log('Attempting to insert service:', serviceData);

      const { data, error } = await supabase
        .from('sitter_services')
        .insert(serviceData)
        .select();

      console.log('Insert result - data:', data);
      console.log('Insert result - error:', error);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Service created with rates! Check console for details.`,
      });

      // Verify it was saved
      const { data: verifyData, error: verifyError } = await supabase
        .from('sitter_services')
        .select('*')
        .eq('sitter_id', profile.id);

      console.log('Verification query - data:', verifyData);
      console.log('Verification query - error:', verifyError);

    } catch (error: any) {
      console.error('Error creating service:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQueryServices = async () => {
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "Profile ID not found",
        variant: "destructive"
      });
      return;
    }

    console.log('=== Querying Services ===');
    console.log('profile.id:', profile.id);

    const { data, error } = await supabase
      .from('sitter_services')
      .select('*')
      .eq('sitter_id', profile.id);

    console.log('Query result - data:', data);
    console.log('Query result - error:', error);

    toast({
      title: "Query Result",
      description: `Found ${data?.length || 0} services. Check console for details.`,
    });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-2xl mx-auto space-y-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>🛠️ Manual Service Creator - Debugging Tool</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <p><strong>Profile ID:</strong> {profile?.id || 'Not loaded'}</p>
              <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
              <p><strong>Role:</strong> {profile?.role || 'Unknown'}</p>
            </div>

            <div className="p-3 bg-blue-100 rounded border border-blue-300 text-sm">
              <p><strong>Purpose:</strong> This tool bypasses the onboarding flow to directly test service creation and querying.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Service Type</Label>
              <Select value={serviceType} onValueChange={(value: any) => setServiceType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="drop_in_visits">Drop-in Visits</SelectItem>
                  <SelectItem value="pet_sitting_owners_home">Pet Sitting (Owner's Home)</SelectItem>
                  <SelectItem value="pet_sitting_sitters_home">Pet Sitting (Sitter's Home)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Hourly Rate ($)</Label>
              <Input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="25"
              />
            </div>

            <div className="space-y-2">
              <Label>Daily Rate ($)</Label>
              <Input
                type="number"
                value={dailyRate}
                onChange={(e) => setDailyRate(e.target.value)}
                placeholder="50"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateService} disabled={loading}>
                {loading ? 'Creating...' : 'Create Service'}
              </Button>
              <Button variant="outline" onClick={handleQueryServices}>
                Query Services
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 text-sm">
            <p className="font-semibold mb-2">Instructions:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Make sure you're logged in as a pet sitter</li>
              <li>Fill in the service details above</li>
              <li>Click "Create Service" - check console for detailed logs</li>
              <li>Click "Query Services" to verify it was saved</li>
              <li>Go back to /stripe-onboarding-tests and run tests again</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
