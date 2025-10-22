import PaymentFlowTests from '@/components/testing/PaymentFlowTests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PaymentFlowTestsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              🚨 Payment Error Diagnostic Suite
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <h3 className="font-semibold">Known Payment Issue:</h3>
              <p className="text-muted-foreground">
                "Edge Function returned a non-2xx status code" when clicking "Complete Payment"
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <h3 className="font-semibold">What Was Fixed:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-2">
                <li><strong>Parameter mismatch:</strong> Frontend sends booking_id, backend expected bookingId - now accepts both</li>
                <li><strong>Missing error logging:</strong> Added comprehensive logging at every step</li>
                <li><strong>Auth validation:</strong> Better header checking and error messages</li>
                <li><strong>Database queries:</strong> Replaced complex JOIN with separate queries for reliability</li>
                <li><strong>Error handling:</strong> Detailed error responses with timestamps</li>
              </ul>
            </div>

            <div className="p-3 bg-orange-100 rounded border border-orange-300 text-sm">
              <strong>How to Use:</strong> Run all 10 tests below to verify the payment flow is working. 
              Check console logs and edge function logs for detailed debugging information.
            </div>
          </CardContent>
        </Card>

        <PaymentFlowTests />
      </div>
    </div>
  );
}
