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
      // Extract payment intent ID (could be string or object)
      const paymentIntentId = typeof session.payment_intent === 'string' 
        ? session.payment_intent 
        : session.payment_intent?.id;
      
      if (!paymentIntentId) {
        throw new Error('No payment intent found in session');
      }

      console.log('Payment intent ID:', paymentIntentId);

      // Update booking status to confirmed (ONLY from 'awaiting_payment' to prevent bypassing sitter acceptance)
      const { data: booking, error: updateError } = await supabaseClient
        .from('bookings')
        .update({ 
          status: 'confirmed',
          payment_status: 'paid',
          stripe_payment_intent_id: paymentIntentId
        })
        .eq('id', booking_id)
        .eq('status', 'awaiting_payment') // Only allow transition from awaiting_payment
        .select()
        .maybeSingle();

      if (updateError) {
        console.error('Error updating booking:', updateError);
        throw new Error(`Failed to update booking: ${updateError.message}`);
      }
      
      if (!booking) {
        throw new Error('Booking not found or not in awaiting_payment status');
      }

      console.log('Booking updated successfully:', booking.id);

      // Record transaction for accounting
      const platformFee = booking.platform_fee || 0;
      const gstAmount = Math.round((platformFee / 1.15) * 0.15 * 100) / 100; // Extract GST from fee
      const platformEarnings = platformFee; // Full platform fee (GST inclusive)

      await supabaseClient.from('transactions').insert({
        booking_id: booking.id,
        transaction_type: 'booking_payment',
        amount: booking.total_amount,
        gst_amount: gstAmount,
        platform_earnings: platformEarnings,
        description: `Payment received for booking ${booking.booking_reference}`,
        stripe_payment_intent_id: paymentIntentId,
        metadata: {
          service_type: booking.service_type,
          start_date: booking.start_date,
          end_date: booking.end_date
        }
      });

      // Send payment confirmation email to sitter
      try {
        await supabaseClient.functions.invoke('send-booking-payment-confirmation', {
          body: { booking_id: booking.id }
        });
        console.log('Payment confirmation email sent to sitter');
      } catch (emailError) {
        console.error('Error sending payment confirmation email:', emailError);
        // Don't fail the payment verification if email fails
      }

      return new Response(JSON.stringify({
        success: true, 
        booking_status: 'confirmed',
        payment_status: 'paid',
        amount: booking.total_amount
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