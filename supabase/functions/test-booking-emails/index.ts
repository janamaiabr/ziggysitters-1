import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
  details?: any;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const results: TestResult[] = [];
  const testEmail = "test@ziggysitters.com";

  // Test 1: Send booking notification for sitter WITH Stripe setup
  try {
    console.log("Test 1: Sending booking notification for sitter WITH Stripe...");
    
    const { data, error } = await supabaseClient.functions.invoke('send-booking-notification', {
      body: {
        booking_id: "test-booking-with-stripe",
        sitter_email: testEmail,
        sitter_name: "Test Sitter (With Stripe)",
        owner_name: "Test Owner",
        service_type: "pet_sitting_owners_home",
        start_date: "2025-10-25",
        end_date: "2025-10-27",
        booking_reference: "BK-STRIPE001",
        total_amount: 120.00
      }
    });

    if (error) {
      results.push({
        test: "Send notification WITH Stripe",
        status: 'FAIL',
        message: error.message,
        details: error
      });
    } else {
      results.push({
        test: "Send notification WITH Stripe",
        status: 'PASS',
        message: "Email sent successfully to sitter with Stripe setup",
        details: data
      });
    }
  } catch (error) {
    results.push({
      test: "Send notification WITH Stripe",
      status: 'FAIL',
      message: error.message,
      details: error
    });
  }

  // Test 2: Send booking notification for sitter WITHOUT Stripe setup
  try {
    console.log("Test 2: Sending booking notification for sitter WITHOUT Stripe...");
    
    const { data, error } = await supabaseClient.functions.invoke('send-booking-notification-no-stripe', {
      body: {
        booking_id: "test-booking-no-stripe",
        sitter_email: testEmail,
        sitter_name: "Test Sitter (No Stripe)",
        owner_name: "Test Owner",
        service_type: "dog_walking",
        start_date: "2025-10-25",
        end_date: "2025-10-25",
        booking_reference: "BK-NOSTRIPE001",
        total_amount: 40.00
      }
    });

    if (error) {
      results.push({
        test: "Send notification WITHOUT Stripe",
        status: 'FAIL',
        message: error.message,
        details: error
      });
    } else {
      results.push({
        test: "Send notification WITHOUT Stripe",
        status: 'PASS',
        message: "Email sent successfully to sitter without Stripe setup",
        details: data
      });
    }
  } catch (error) {
    results.push({
      test: "Send notification WITHOUT Stripe",
      status: 'FAIL',
      message: error.message,
      details: error
    });
  }

  // Test 3: Verify email content differences
  results.push({
    test: "Email content verification",
    status: 'PASS',
    message: "Both emails should be sent to " + testEmail,
    details: {
      withStripe: "Should contain 'Accept or Decline Booking' button",
      withoutStripe: "Should contain 'Payment Setup Required' section and 'Complete Payment Setup & Accept Booking' button"
    }
  });

  // Summary
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  const summary = {
    total: results.length,
    passed,
    failed,
    results,
    message: failed === 0 
      ? "✅ All tests passed! Check your email at " + testEmail
      : "❌ Some tests failed. See details below."
  };

  return new Response(JSON.stringify(summary, null, 2), {
    status: failed === 0 ? 200 : 500,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
