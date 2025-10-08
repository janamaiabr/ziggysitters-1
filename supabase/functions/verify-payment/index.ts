import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Retrieve authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { session_id, booking_id } = await req.json();
    if (!session_id || !booking_id) throw new Error("Session ID and Booking ID are required");

    console.log('Verifying payment for session:', session_id, 'booking:', booking_id);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log('Stripe session status:', session.payment_status);

    if (session.payment_status === 'paid') {
      // Update booking status to confirmed (from either 'pending' or 'awaiting_payment')
      const { data: booking, error: updateError } = await supabaseClient
        .from('bookings')
        .update({ 
          status: 'confirmed',
          payment_status: 'paid',
          stripe_payment_intent_id: session.payment_intent
        })
        .eq('id', booking_id)
        .in('status', ['pending', 'awaiting_payment'])
        .select()
        .single();

      if (updateError) {
        console.error('Error updating booking:', updateError);
        throw new Error(`Failed to update booking: ${updateError.message}`);
      }

      console.log('Booking updated successfully:', booking.id);

      return new Response(JSON.stringify({ 
        success: true, 
        booking_status: 'confirmed',
        payment_status: 'paid' 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Payment not completed',
        payment_status: session.payment_status 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});