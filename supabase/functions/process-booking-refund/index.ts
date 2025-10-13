import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-REFUND] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw userError;
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { booking_id } = await req.json();
    if (!booking_id) throw new Error("booking_id is required");
    logStep("Processing refund for booking", { bookingId: booking_id });

    // Get booking details
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('*, owner:profiles!owner_id(*), sitter:profiles!sitter_id(*)')
      .eq('id', booking_id)
      .single();

    if (bookingError) throw bookingError;
    if (!booking) throw new Error("Booking not found");
    logStep("Booking fetched", { status: booking.status, paymentIntent: booking.stripe_payment_intent_id });

    // Check if user is involved in booking
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile || (profile.id !== booking.owner_id && profile.id !== booking.sitter_id)) {
      throw new Error("Unauthorized - not involved in this booking");
    }

    // Only process refunds for confirmed bookings with payment
    if (booking.status !== 'confirmed' || !booking.stripe_payment_intent_id) {
      logStep("No refund needed", { status: booking.status, hasPayment: !!booking.stripe_payment_intent_id });
      
      // Just cancel the booking
      const { error: updateError } = await supabaseClient
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', booking_id);

      if (updateError) throw updateError;

      return new Response(JSON.stringify({ 
        success: true, 
        refund_amount: 0,
        message: "Booking cancelled (no payment to refund)" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Calculate refund based on timing
    const now = new Date();
    const startDate = new Date(booking.start_date);
    const hoursUntilStart = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    logStep("Calculated time until start", { hoursUntilStart });

    let refundPercentage = 0;
    if (hoursUntilStart > 24) {
      refundPercentage = 100; // Full refund
    } else if (hoursUntilStart >= 0) {
      refundPercentage = 50; // 50% refund
    } else {
      refundPercentage = 0; // No refund (day-of or after start)
    }

    logStep("Refund percentage determined", { refundPercentage });

    // Calculate refund amount (never refund platform fee)
    const serviceAmount = booking.total_amount - booking.platform_fee;
    const refundAmount = Math.round((serviceAmount * refundPercentage) / 100 * 100); // Convert to cents
    logStep("Refund amount calculated", { 
      totalAmount: booking.total_amount, 
      platformFee: booking.platform_fee, 
      serviceAmount, 
      refundAmount 
    });

    // Process Stripe refund if applicable
    if (refundAmount > 0) {
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2025-08-27.basil",
      });

      logStep("Processing Stripe refund", { paymentIntent: booking.stripe_payment_intent_id, refundAmount });

      const refund = await stripe.refunds.create({
        payment_intent: booking.stripe_payment_intent_id,
        amount: refundAmount,
        reason: 'requested_by_customer',
        metadata: {
          booking_id: booking_id,
          refund_percentage: refundPercentage.toString(),
          hours_until_start: hoursUntilStart.toString()
        }
      });

      logStep("Stripe refund created", { refundId: refund.id, status: refund.status });

      // Record refund transaction
      await supabaseClient.from('transactions').insert({
        booking_id: booking_id,
        transaction_type: 'refund',
        amount: -(refundAmount / 100), // Convert from cents and negative for refund
        gst_amount: 0,
        platform_earnings: 0,
        description: `Refund for booking ${booking.booking_reference} (${refundPercentage}% refund)`,
        stripe_refund_id: refund.id,
        stripe_payment_intent_id: booking.stripe_payment_intent_id,
        metadata: {
          refund_percentage: refundPercentage,
          cancellation_date: new Date().toISOString(),
          hours_until_start: hoursUntilStart
        }
      });
    }

    // Update booking status
    const { error: updateError } = await supabaseClient
      .from('bookings')
      .update({ status: 'cancelled', payment_status: refundAmount > 0 ? 'refunded' : 'cancelled' })
      .eq('id', booking_id);

    if (updateError) throw updateError;
    logStep("Booking updated to cancelled");

    return new Response(JSON.stringify({ 
      success: true, 
      refund_amount: refundAmount / 100,
      refund_percentage: refundPercentage,
      platform_fee_retained: booking.platform_fee
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});