import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
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

    const { sessionId, bookingReference } = await req.json();
    
    if (!sessionId || !bookingReference) {
      throw new Error("Missing sessionId or bookingReference");
    }
    
    logStep("Request received", { sessionId, bookingReference });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Stripe session retrieved", { 
      sessionId: session.id, 
      paymentStatus: session.payment_status,
      paymentIntentId: session.payment_intent 
    });

    if (session.payment_status !== 'paid') {
      throw new Error(`Payment not completed. Status: ${session.payment_status}`);
    }

    // Update booking status in database
    const { data: booking, error: updateError } = await supabaseClient
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_status: 'paid',
        stripe_payment_intent_id: session.payment_intent
      })
      .eq('booking_reference', bookingReference)
      .eq('stripe_checkout_session_id', sessionId)
      .select()
      .single();

    if (updateError || !booking) {
      logStep("Failed to update booking", { error: updateError?.message });
      throw new Error(`Failed to update booking: ${updateError?.message}`);
    }

    logStep("Booking updated successfully", { 
      bookingId: booking.id,
      status: booking.status,
      paymentStatus: booking.payment_status 
    });

    return new Response(JSON.stringify({ 
      success: true,
      booking: {
        id: booking.id,
        reference: booking.booking_reference,
        status: booking.status,
        paymentStatus: booking.payment_status
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});