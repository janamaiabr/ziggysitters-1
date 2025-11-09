import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ExternalLink, CreditCard } from 'lucide-react';
import { useProfile } from '@/contexts/ProfileContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export default function StripeLiveModeWarning() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<{
    connected: boolean;
    enabled: boolean;
    onboarding_completed: boolean;
  } | null>(null);

  useEffect(() => {
    checkIfWarningNeeded();
  }, [profile]);

  const checkIfWarningNeeded = async () => {
    // Only show for pet sitters
    if (!profile || profile.role !== 'pet_sitter') {
      setShowWarning(false);
      return;
    }

    // Check if system is in live mode
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    const isLiveMode = publishableKey?.startsWith('pk_live_');

    if (!isLiveMode) {
      setShowWarning(false);
      return;
    }

    // Check sitter's Stripe status
    try {
      const { data, error } = await supabase.functions.invoke('stripe-connect-account-status');
      
      if (!error && data) {
        setStripeStatus(data);
        
        // Show warning if:
        // 1. Not connected at all, OR
        // 2. Connected but not enabled (test mode account or incomplete onboarding)
        const needsReOnboarding = !data.connected || !data.enabled;
        setShowWarning(needsReOnboarding);
      } else {
        // If no Stripe account at all, show warning
        setShowWarning(true);
      }
    } catch (error) {
      console.error('Error checking Stripe status:', error);
      // Show warning on error to be safe
      setShowWarning(true);
    }
  };

  if (!showWarning) {
    return null;
  }

  return (
    <Alert className="mb-6 border-red-600 bg-red-50 dark:bg-red-950/20 shadow-lg">
      <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 animate-pulse" />
      <AlertTitle className="text-red-900 dark:text-red-100 font-bold text-lg">
        🚀 LIVE LAUNCH: Stripe Re-onboarding Required
      </AlertTitle>
      <AlertDescription className="text-red-800 dark:text-red-200 mt-2 space-y-4">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border-2 border-red-300 dark:border-red-800 space-y-3">
          <p className="font-bold text-base">
            Ziggy Sitters is now processing <span className="text-red-600">REAL PAYMENTS</span>! 
            {stripeStatus?.connected 
              ? " Your test mode Stripe account must be upgraded to live mode."
              : " You must connect your Stripe account to accept bookings."}
          </p>
          
          <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded border border-red-200 dark:border-red-900">
            <p className="font-semibold mb-2 text-red-900 dark:text-red-100">⚠️ YOU CANNOT ACCEPT BOOKINGS UNTIL THIS IS COMPLETE</p>
            <p className="text-sm">Complete Stripe verification to start earning with real payouts.</p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-sm text-red-900 dark:text-red-100">Follow these steps now:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li className="font-medium">Click "Set Up Stripe Now" button below</li>
              <li>Complete Stripe Connect verification with your bank details</li>
              <li>Wait 1-2 business days for Stripe approval</li>
              <li>Start accepting paid bookings!</li>
            </ol>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded border border-blue-200 dark:border-blue-900">
            <p className="text-xs text-blue-900 dark:text-blue-100">
              <strong>Why this is needed:</strong> The platform was previously in test mode. Now that we're processing real money, 
              Stripe requires live verification for all sitters. This is a one-time process that enables secure payouts to your bank.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button 
            onClick={() => navigate('/profile?tab=payments')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-md flex-1"
            size="lg"
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Set Up Stripe Now
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.open('https://stripe.com/connect', '_blank')}
            className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Learn More
          </Button>
        </div>

        <p className="text-xs text-center text-red-700 dark:text-red-400 italic">
          Check your email for detailed instructions. Contact support if you need help.
        </p>
      </AlertDescription>
    </Alert>
  );
}
