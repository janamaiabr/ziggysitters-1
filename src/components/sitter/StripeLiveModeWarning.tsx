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
    <Alert className="mb-6 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
      <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
      <AlertTitle className="text-orange-900 dark:text-orange-100 font-semibold">
        Action Required: Stripe Account Setup for Live Payments
      </AlertTitle>
      <AlertDescription className="text-orange-800 dark:text-orange-200 mt-2 space-y-3">
        <p>
          Our platform is now processing <strong>real payments</strong> in live mode. 
          {stripeStatus?.connected 
            ? " Your current Stripe account was set up in test mode and needs to be updated."
            : " You need to connect your Stripe account to receive payouts for bookings."}
        </p>
        
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-orange-200 dark:border-orange-800 space-y-2">
          <p className="font-semibold text-sm">What you need to do:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Click the button below to go to your Payments settings</li>
            <li>Click "Connect Stripe Account" (or "Re-connect for Live Mode")</li>
            <li>Complete the Stripe verification process with your bank details</li>
            <li>Wait 1-2 business days for Stripe to verify your account</li>
          </ol>
          <p className="text-xs text-orange-700 dark:text-orange-300 mt-3">
            <strong>Important:</strong> You cannot accept new bookings until this is complete. Stripe verification is required to receive payouts for your services.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button 
            onClick={() => navigate('/profile?tab=payments')}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Set Up Stripe Now
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.open('https://stripe.com/connect', '_blank')}
            className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-300"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Learn About Stripe
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
