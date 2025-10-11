import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-PAYOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Processing booking payout");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { booking_id } = await req.json();
    
    if (!booking_id) {
      throw new Error("Booking ID is required");
    }

    logStep("Processing payout for booking", { booking_id });

    // Get booking details with owner and sitter info
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .select(`
        id,
        status,
        payment_status,
        stripe_payment_intent_id,
        total_amount,
        platform_fee,
        sitter_id,
        owner_id,
        requires_daily_reports,
        daily_reports_required,
        daily_reports_completed,
        penalty_applied,
        booking_reference,
        owner:profiles!bookings_owner_id_fkey(email, first_name, last_name),
        sitter:profiles!bookings_sitter_id_fkey(email, first_name, last_name, stripe_account_id, stripe_account_enabled)
      `)
      .eq("id", booking_id)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    logStep("Booking retrieved", { 
      status: booking.status, 
      requires_reports: booking.requires_daily_reports,
      reports_completed: booking.daily_reports_completed,
      reports_required: booking.daily_reports_required 
    });

    // Verify booking is completed
    if (booking.status !== "completed") {
      throw new Error("Booking must be completed before processing payout");
    }

    // Verify payment was successful
    if (booking.payment_status !== "paid") {
      throw new Error("Booking payment not confirmed");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Verify sitter's Stripe account
    if (!booking.sitter.stripe_account_id || !booking.sitter.stripe_account_enabled) {
      throw new Error("Sitter Stripe account not found or not enabled");
    }

    logStep("Sitter Stripe account verified", { account_id: booking.sitter.stripe_account_id });

    // Check if penalty needs to be applied
    let penaltyAmount = 0;
    let penaltyApplied = false;
    
    if (booking.requires_daily_reports && 
        booking.daily_reports_required > 0 && 
        booking.daily_reports_completed < booking.daily_reports_required &&
        !booking.penalty_applied) {
      
      // Calculate 15% penalty
      penaltyAmount = Math.round(booking.total_amount * 0.15 * 100) / 100;
      logStep("Incomplete reports detected - applying 15% penalty", { 
        penalty_amount: penaltyAmount,
        reports_completed: booking.daily_reports_completed,
        reports_required: booking.daily_reports_required 
      });

      try {
        // Retrieve the payment intent to get charge ID
        const paymentIntent = await stripe.paymentIntents.retrieve(booking.stripe_payment_intent_id);
        
        if (!paymentIntent.latest_charge) {
          throw new Error("No charge found for payment intent");
        }

        const chargeId = typeof paymentIntent.latest_charge === 'string' 
          ? paymentIntent.latest_charge 
          : paymentIntent.latest_charge.id;

        logStep("Creating refund for penalty", { charge_id: chargeId, amount: penaltyAmount });

        // Create a refund for 15% back to the owner
        // This also reverses the transfer to the sitter automatically
        const refund = await stripe.refunds.create({
          charge: chargeId,
          amount: Math.round(penaltyAmount * 100), // Convert to cents
          reason: 'requested_by_customer',
          metadata: {
            booking_id: booking_id,
            reason: 'Incomplete daily reports',
            reports_completed: booking.daily_reports_completed.toString(),
            reports_required: booking.daily_reports_required.toString(),
          },
          reverse_transfer: true, // This reverses the transfer from sitter's account
        });

        logStep("Refund created successfully", { refund_id: refund.id, amount: penaltyAmount });
        penaltyApplied = true;

        // Send notification email to owner about refund
        await supabaseClient.functions.invoke('send-penalty-notification', {
          body: {
            booking_id: booking_id,
            owner_email: booking.owner.email,
            owner_name: `${booking.owner.first_name} ${booking.owner.last_name}`,
            sitter_name: `${booking.sitter.first_name} ${booking.sitter.last_name}`,
            penalty_amount: penaltyAmount,
            reports_completed: booking.daily_reports_completed,
            reports_required: booking.daily_reports_required,
            booking_reference: booking.booking_reference,
          }
        });

        logStep("Penalty notification email sent");

      } catch (refundError) {
        logStep("ERROR creating refund", { error: refundError.message });
        throw new Error(`Failed to process penalty refund: ${refundError.message}`);
      }
    } else {
      logStep("No penalty required", { 
        requires_reports: booking.requires_daily_reports,
        reports_match: booking.daily_reports_completed >= booking.daily_reports_required,
        already_applied: booking.penalty_applied 
      });
    }

    // Update booking with payout status and penalty info
    const { error: updateError } = await supabaseClient
      .from("bookings")
      .update({
        payment_status: "paid_out",
        penalty_applied: penaltyApplied,
        penalty_amount: penaltyAmount,
        penalty_applied_at: penaltyApplied ? new Date().toISOString() : null,
        penalty_reason: penaltyApplied ? `Incomplete daily reports: ${booking.daily_reports_completed}/${booking.daily_reports_required} submitted` : null,
      })
      .eq("id", booking_id);

    if (updateError) {
      logStep("ERROR updating booking", { error: updateError.message });
      throw updateError;
    }

    logStep("Payout processed successfully", { penalty_applied: penaltyApplied });

    const sitterReceived = booking.total_amount - booking.platform_fee - penaltyAmount;

    return new Response(
      JSON.stringify({
        success: true,
        message: penaltyApplied 
          ? "Payout processed with 15% penalty for incomplete reports" 
          : "Payout processed successfully",
        sitter_received: sitterReceived,
        platform_fee: booking.platform_fee,
        penalty_applied: penaltyApplied,
        penalty_amount: penaltyAmount,
        owner_refunded: penaltyAmount,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    logStep("ERROR in process-booking-payout", { error: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
