import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export default function AdminPaymentFix() {
  const [bookingId, setBookingId] = useState("6f8d76f8-fbee-444e-90bb-3c3398379e31");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleManualVerify = async () => {
    setIsVerifying(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('manual-verify-payment', {
        body: { booking_id: bookingId }
      });

      if (error) throw error;

      setResult(data);

      if (data?.success) {
        toast({
          title: 'Payment Verified!',
          description: 'The booking has been updated to confirmed status.',
        });
      } else {
        toast({
          title: 'Payment Not Found',
          description: data?.message || 'No successful payment found in Stripe.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error:', error);
      setResult({ error: error.message });
      toast({
        title: 'Error',
        description: error.message || 'Failed to verify payment',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Admin Payment Fix Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Booking ID</label>
            <Input
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="Enter booking ID"
            />
          </div>

          <Button
            onClick={handleManualVerify}
            disabled={isVerifying || !bookingId}
            className="w-full"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching Stripe...
              </>
            ) : (
              'Verify Payment in Stripe'
            )}
          </Button>

          {result && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p className="font-semibold mb-2">How this works:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Searches Stripe for payments matching this booking</li>
              <li>Looks for successful payments for the booking amount ($25.00)</li>
              <li>If found, updates the booking to 'confirmed' status</li>
              <li>Creates a transaction record for accounting</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
