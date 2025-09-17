import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-REFUND] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase client using the service role key for admin access
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Get all confirmed bookings with payment intent IDs
    const { data: bookings, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('id, booking_reference, stripe_payment_intent_id, status')
      .eq('status', 'confirmed')
      .not('stripe_payment_intent_id', 'is', null);

    if (bookingError) {
      throw new Error(`Failed to fetch bookings: ${bookingError.message}`);
    }

    logStep("Found bookings to check", { count: bookings?.length || 0 });

    let updatedCount = 0;

    // Check each booking's payment status
    for (const booking of bookings || []) {
      try {
        // Get the payment intent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(booking.stripe_payment_intent_id);
        
        // Check if there are any refunds
        if (paymentIntent.charges?.data?.[0]?.refunded) {
          const charge = paymentIntent.charges.data[0];
          logStep("Found refunded payment", { 
            bookingId: booking.id, 
            paymentIntentId: booking.stripe_payment_intent_id,
            refunded: charge.refunded,
            amountRefunded: charge.amount_refunded
          });

          // Update booking status to cancelled
          const { error: updateError } = await supabaseClient
            .from('bookings')
            .update({ 
              status: 'cancelled',
              payment_status: 'refunded'
            })
            .eq('id', booking.id);

          if (updateError) {
            logStep("Failed to update booking", { bookingId: booking.id, error: updateError.message });
          } else {
            updatedCount++;
            logStep("Updated booking status to cancelled", { bookingId: booking.id });
          }
        }
      } catch (error) {
        logStep("Error checking payment intent", { 
          bookingId: booking.id, 
          paymentIntentId: booking.stripe_payment_intent_id,
          error: error.message 
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      checkedBookings: bookings?.length || 0,
      updatedBookings: updatedCount
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-refund-status", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});