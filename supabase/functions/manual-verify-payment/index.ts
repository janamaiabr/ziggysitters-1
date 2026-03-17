import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
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

    const { booking_id } = await req.json();
    if (!booking_id) throw new Error("Booking ID is required");

    console.log('[MANUAL-VERIFY] Verifying payment for booking:', booking_id);

    // Get booking details
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('*, owner:profiles!bookings_owner_id_fkey(email)')
      .eq('id', booking_id)
      .maybeSingle();

    if (bookingError) {
      throw new Error(`Database error: ${bookingError.message}`);
    }
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    console.log('[MANUAL-VERIFY] Booking found:', { 
      reference: booking.booking_reference, 
      status: booking.status,
      payment_status: booking.payment_status,
      owner_email: booking.owner.email
    });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Search for payment intents by booking reference in metadata
    const paymentIntents = await stripe.paymentIntents.search({
      query: `metadata['booking_id']:'${booking_id}'`,
      limit: 10,
    });

    console.log('[MANUAL-VERIFY] Found payment intents by booking_id:', paymentIntents.data.length);

    // Also search by customer email
    let customerPayments: Stripe.PaymentIntent[] = [];
    if (booking.owner?.email) {
      const customers = await stripe.customers.list({ 
        email: booking.owner.email,
        limit: 1 
      });
      
      if (customers.data.length > 0) {
        const customerPaymentIntents = await stripe.paymentIntents.list({
          customer: customers.data[0].id,
          limit: 20,
        });
        customerPayments = customerPaymentIntents.data;
        console.log('[MANUAL-VERIFY] Found customer payments:', customerPayments.length);
      }
    }

    // Search by booking reference in metadata as well
    let bookingRefPayments: Stripe.PaymentIntent[] = [];
    try {
      const refPaymentIntents = await stripe.paymentIntents.search({
        query: `metadata['booking_reference']:'${booking.booking_reference}'`,
        limit: 10,
      });
      bookingRefPayments = refPaymentIntents.data;
      console.log('[MANUAL-VERIFY] Found payment intents by booking_reference:', bookingRefPayments.length);
    } catch (e) {
      console.log('[MANUAL-VERIFY] Could not search by booking_reference:', (e as Error).message);
    }

    // Find a successful payment for this amount
    const allPayments = [...paymentIntents.data, ...customerPayments, ...bookingRefPayments];
    console.log('[MANUAL-VERIFY] Total payments to check:', allPayments.length);
    console.log('[MANUAL-VERIFY] Looking for amount:', booking.total_amount, 'NZD (', Math.round(booking.total_amount * 100), 'cents)');
    
    // Log all payment amounts for debugging
    allPayments.forEach((pi, idx) => {
      console.log(`[MANUAL-VERIFY] Payment ${idx + 1}: status=${pi.status}, amount=${pi.amount} cents, id=${pi.id}`);
    });

    const successfulPayment = allPayments.find(pi => 
      pi.status === 'succeeded' && 
      pi.amount === Math.round(booking.total_amount * 100) // Stripe uses cents
    );

    if (successfulPayment) {
      console.log('[MANUAL-VERIFY] Found successful payment:', successfulPayment.id);

      // Update booking
      const { data: updatedBooking, error: updateError } = await supabaseClient
        .from('bookings')
        .update({ 
          status: 'confirmed',
          payment_status: 'paid',
          stripe_payment_intent_id: successfulPayment.id
        })
        .eq('id', booking_id)
        .select()
        .maybeSingle();

      if (updateError) {
        console.error('[MANUAL-VERIFY] Error updating booking:', updateError);
        throw new Error(`Failed to update booking: ${updateError.message}`);
      }
      
      if (!updatedBooking) {
        throw new Error('Booking not found after update');
      }

      // Record transaction
      const platformFee = booking.platform_fee || 0;
      const gstAmount = Math.round((platformFee / 1.15) * 0.15 * 100) / 100;

      await supabaseClient.from('transactions').insert({
        booking_id: booking.id,
        transaction_type: 'booking_payment',
        amount: booking.total_amount,
        gst_amount: gstAmount,
        platform_earnings: platformFee,
        description: `Payment verified for booking ${booking.booking_reference}`,
        stripe_payment_intent_id: successfulPayment.id,
        metadata: {
          service_type: booking.service_type,
          start_date: booking.start_date,
          end_date: booking.end_date,
          manually_verified: true
        }
      });

      console.log('[MANUAL-VERIFY] Booking updated successfully');

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Payment verified and booking confirmed',
        booking_status: 'confirmed',
        payment_status: 'paid',
        payment_intent_id: successfulPayment.id,
        amount: booking.total_amount
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      console.log('[MANUAL-VERIFY] No successful payment found');
      
      return new Response(JSON.stringify({ 
        success: false,
        message: 'No successful payment found for this booking',
        searched_payments: allPayments.length,
        booking_amount: booking.total_amount,
        booking_status: booking.status
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

  } catch (error) {
    console.error('[MANUAL-VERIFY] Error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: (error as Error).message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
