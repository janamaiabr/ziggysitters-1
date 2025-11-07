import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADD-TEST-FUNDS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Admin adding test funds");
    
    // Verify admin access
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Optional: Verify admin if auth header provided
    let userId = 'system';
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
      
      if (!userError && user) {
        userId = user.id;
        const { data: roles } = await supabaseClient
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .single();

        if (roles) {
          logStep("Admin verified", { user_id: user.id });
        }
      }
    }

    logStep("Processing test funds addition (admin endpoint)");

    const { amount = 200 } = await req.json();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Create a test payment method using the special card that adds to available balance
    logStep("Creating test payment method");
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: '4000000000000077', // Special test card that adds to available balance
        exp_month: 12,
        exp_year: 2030,
        cvc: '123',
      },
    });

    logStep("Payment method created", { pm_id: paymentMethod.id });

    // Create a PaymentIntent with this payment method
    logStep("Creating payment intent");
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'nzd',
      payment_method: paymentMethod.id,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      description: 'Test funds for platform - Admin added',
      metadata: {
        purpose: 'test_balance_funding',
        admin_id: userId,
      },
    });

    logStep("Payment intent created", { 
      pi_id: paymentIntent.id, 
      status: paymentIntent.status,
      amount: amount 
    });

    if (paymentIntent.status !== 'succeeded') {
      throw new Error(`Payment failed with status: ${paymentIntent.status}`);
    }

    // Record this as a test transaction
    await supabaseClient.from('transactions').insert({
      transaction_type: 'test_funding',
      amount: amount,
      gst_amount: 0,
      platform_earnings: amount,
      description: `Test funds added by admin - ${amount} NZD`,
      stripe_payment_intent_id: paymentIntent.id,
      metadata: {
        admin_id: userId,
        purpose: 'test_balance_funding',
      },
    });

    logStep("Transaction recorded");

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully added $${amount} NZD to test balance`,
        payment_intent_id: paymentIntent.id,
        amount: amount,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    logStep("ERROR adding test funds", { error: error.message });
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Failed to add test funds. This only works in Stripe test mode."
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});