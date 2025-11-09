import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, AlertTriangle, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function StripeModeIndicator() {
  const [isLiveMode, setIsLiveMode] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [sitters, setSitters] = useState<Array<{ id: string; first_name: string; last_name: string; email: string }>>([]);
  const { toast } = useToast();

  useEffect(() => {
    checkStripeMode();
    fetchSitters();
  }, []);

  const checkStripeMode = async () => {
    try {
      // Check if the publishable key is live or test
      const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      const isLive = publishableKey?.startsWith('pk_live_');
      setIsLiveMode(isLive);
    } catch (error) {
      console.error('Error checking Stripe mode:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSitters = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'pet_sitter')
        .eq('is_verified', true);

      if (error) throw error;
      setSitters(data || []);
    } catch (error) {
      console.error('Error fetching sitters:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Email copied to clipboard",
    });
  };

  if (loading) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5" />
            <div>
              <CardTitle>Stripe Payment Mode</CardTitle>
              <CardDescription>Current payment processing configuration</CardDescription>
            </div>
          </div>
          <Badge 
            variant={isLiveMode ? "default" : "secondary"}
            className={isLiveMode ? "bg-green-500 hover:bg-green-600" : "bg-orange-500 hover:bg-orange-600"}
          >
            {isLiveMode ? "LIVE MODE" : "TEST MODE"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLiveMode ? (
          <>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Live Mode Active:</strong> All payments are real transactions. Sitters must re-complete Stripe onboarding in live mode to receive payouts.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Action Required for Sitters:</h4>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                <p className="font-medium">Sitters need to re-onboard their Stripe accounts for live mode:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Go to Profile → Payments tab</li>
                  <li>Click "Connect Stripe Account" or "Re-connect for Live Mode"</li>
                  <li>Complete the Stripe verification process</li>
                </ol>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 w-full"
                  onClick={() => window.open('/profile?tab=payments', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Profile Payments Page
                </Button>
              </div>

              {sitters.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-sm mb-2">Verified Sitters ({sitters.length}):</h4>
                  <div className="bg-muted/30 p-3 rounded-lg max-h-48 overflow-y-auto">
                    <div className="space-y-2">
                      {sitters.map((sitter) => (
                        <div key={sitter.id} className="flex items-center justify-between text-sm">
                          <span className="font-medium">
                            {sitter.first_name} {sitter.last_name}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(sitter.email)}
                            className="h-7 text-xs"
                          >
                            {sitter.email}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Click email to copy. Contact these sitters to complete live Stripe onboarding.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <Alert>
            <AlertDescription>
              <strong>Test Mode:</strong> Payments are simulated. No real money is processed. Switch to live mode when ready for production.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
