import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminAddTestFunds = () => {
  const [amount, setAmount] = useState("200");
  const [loading, setLoading] = useState(false);

  const handleAddFunds = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('add-test-funds', {
        body: { amount: parseFloat(amount) }
      });

      if (error) throw error;

      toast.success(data.message || `Successfully added $${amount} NZD to platform balance`);
      console.log('[ADD-TEST-FUNDS] Success:', data);
    } catch (error: any) {
      console.error('[ADD-TEST-FUNDS] Error:', error);
      toast.error(error.message || "Failed to add test funds");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              Add Test Funds to Platform
            </CardTitle>
            <CardDescription>
              Add funds to your Stripe test account to enable sitter payouts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This uses the special Stripe test card <code className="px-1 py-0.5 bg-muted rounded">4000000000000077</code> to add funds to your platform's available balance. This only works in test mode.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (NZD)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="200"
                min="1"
                step="1"
              />
              <p className="text-sm text-muted-foreground">
                Recommended: $200+ to cover multiple test payouts
              </p>
            </div>

            <Button 
              onClick={handleAddFunds} 
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Funds...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Add ${amount} to Test Balance
                </>
              )}
            </Button>

            <div className="pt-4 border-t space-y-2">
              <h3 className="font-semibold text-sm">How it works:</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Creates a test payment using Stripe's special test card</li>
                <li>Funds are added to your platform's available balance</li>
                <li>You can then process sitter payouts without errors</li>
                <li>Only works in Stripe test mode (not production)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAddTestFunds;