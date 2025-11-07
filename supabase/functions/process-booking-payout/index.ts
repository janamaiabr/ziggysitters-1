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
      .maybeSingle();

    if (bookingError) {
      throw new Error(`Database error: ${bookingError.message}`);
    }
    
    if (!booking) {
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
    let refundId = null;
    
    if (booking.requires_daily_reports && 
        booking.daily_reports_required > 0 && 
        booking.daily_reports_completed < booking.daily_reports_required &&
        !booking.penalty_applied) {
      
      // Calculate PROPORTIONAL penalty: 15% total, divided by missing reports
      const totalPenaltyPercentage = 0.15; // 15% maximum
      const missedReports = booking.daily_reports_required - booking.daily_reports_completed;
      const penaltyPercentage = (totalPenaltyPercentage / booking.daily_reports_required) * missedReports;
      penaltyAmount = Math.round(booking.total_amount * penaltyPercentage * 100) / 100;
      
      logStep("Incomplete reports detected - applying proportional penalty", {
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

        // Check if refunds already exist for this charge to prevent duplicates
        const existingRefunds = await stripe.refunds.list({
          charge: chargeId,
          limit: 10,
        });

        const totalRefunded = existingRefunds.data.reduce((sum, refund) => {
          return sum + (refund.status === 'succeeded' ? refund.amount : 0);
        }, 0) / 100; // Convert from cents to dollars

        logStep("Checking existing refunds", { 
          charge_id: chargeId, 
          total_refunded: totalRefunded,
          refund_count: existingRefunds.data.length 
        });

        if (totalRefunded >= penaltyAmount) {
          logStep("Penalty refund already processed - skipping", { 
            total_refunded: totalRefunded,
            penalty_amount: penaltyAmount 
          });
          penaltyApplied = true;
          refundId = existingRefunds.data[0]?.id || null;
        } else {
          logStep("Creating refund for penalty", { charge_id: chargeId, amount: penaltyAmount });

          // Create a partial refund back to the owner (proportional to missing reports)
          const refund = await stripe.refunds.create({
            charge: chargeId,
            amount: Math.round(penaltyAmount * 100), // Convert to cents
            reason: 'requested_by_customer',
            metadata: {
              booking_id: booking_id,
              reason: 'Proportional penalty for incomplete daily reports',
              reports_completed: booking.daily_reports_completed.toString(),
              reports_required: booking.daily_reports_required.toString(),
              missed_reports: missedReports.toString(),
              penalty_percentage: (penaltyPercentage * 100).toFixed(1) + '%',
            },
          });

          logStep("Refund created successfully", { refund_id: refund.id, amount: penaltyAmount });
          penaltyApplied = true;
          refundId = refund.id;

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

          logStep("Penalty notification email sent to owner");

          // Send notification email to sitter about penalty deduction
          await supabaseClient.functions.invoke('send-sitter-penalty-notification', {
            body: {
              booking_id: booking_id,
              sitter_email: booking.sitter.email,
              sitter_name: `${booking.sitter.first_name} ${booking.sitter.last_name}`,
              owner_name: `${booking.owner.first_name} ${booking.owner.last_name}`,
              penalty_amount: penaltyAmount,
              reports_completed: booking.daily_reports_completed,
              reports_required: booking.daily_reports_required,
              booking_reference: booking.booking_reference,
            }
          });

          logStep("Penalty notification email sent to sitter");
        }

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

    // Calculate Stripe fees (2.9% + $0.30)
    const stripeFeePercentage = 0.029;
    const stripeFeeFixed = 0.30;
    const stripeFee = Math.round((booking.total_amount * stripeFeePercentage + stripeFeeFixed) * 100) / 100;

    // Sitter receives: Total - Platform Fee - Stripe Fee - Penalty
    const sitterReceived = booking.total_amount - booking.platform_fee - stripeFee - penaltyAmount;

    logStep("Payout calculation", {
      total_amount: booking.total_amount,
      platform_fee: booking.platform_fee,
      stripe_fee: stripeFee,
      penalty: penaltyAmount,
      sitter_receives: sitterReceived
    });

    // Create Stripe Transfer to pay the sitter FIRST before updating booking status
    let transferId: string;
    try {
      logStep("Creating Stripe Transfer to sitter", {
        amount: sitterReceived,
        destination: booking.sitter.stripe_account_id
      });

      const transfer = await stripe.transfers.create({
        amount: Math.round(sitterReceived * 100), // Convert to cents
        currency: 'nzd',
        destination: booking.sitter.stripe_account_id,
        description: `Payout for booking ${booking.booking_reference}${penaltyApplied ? ` (penalty: $${penaltyAmount})` : ''}`,
        metadata: {
          booking_id: booking_id,
          booking_reference: booking.booking_reference,
          penalty_applied: penaltyApplied.toString(),
          penalty_amount: penaltyAmount.toString(),
        },
      });

      transferId = transfer.id;
      logStep("Stripe Transfer created successfully", {
        transfer_id: transfer.id,
        amount: sitterReceived
      });

    } catch (transferError) {
      logStep("ERROR creating Stripe Transfer", { error: transferError.message });
      
      // Check if it's the test mode insufficient funds error
      if (transferError.message?.includes('insufficient available funds')) {
        throw new Error(
          `STRIPE TEST MODE ERROR: Your test platform account needs funds before transfers can be made. ` +
          `To fix this in test mode, create a test payment using card 4000000000000077 which adds funds to your available balance. ` +
          `In production, this won't be an issue as real payments add to your balance automatically. ` +
          `Original error: ${transferError.message}`
        );
      }
      
      throw new Error(`Failed to transfer payout to sitter: ${transferError.message}`);
    }

    // ONLY update booking status AFTER successful transfer
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
      logStep("ERROR updating booking after successful transfer", { error: updateError.message });
      // Transfer succeeded but DB update failed - this is critical
      throw new Error(`Transfer succeeded (${transferId}) but database update failed: ${updateError.message}`);
    }

    logStep("Booking status updated successfully after transfer", { transfer_id: transferId });

    // Record payout transaction with transfer ID
    await supabaseClient.from('transactions').insert({
      booking_id: booking_id,
      transaction_type: 'payout',
      amount: -sitterReceived, // Negative for money leaving platform
      gst_amount: 0,
      platform_earnings: 0,
      description: `Payout to sitter for booking ${booking.booking_reference}${penaltyApplied ? ` (with $${penaltyAmount} penalty)` : ''}`,
      stripe_payment_intent_id: booking.stripe_payment_intent_id,
      stripe_transfer_id: transferId,
      metadata: {
        penalty_applied: penaltyApplied,
        penalty_amount: penaltyAmount,
        stripe_fee: stripeFee,
        platform_fee: booking.platform_fee,
        net_payout: sitterReceived,
        transfer_id: transferId
      }
    });

    // Send success email to sitter
    await supabaseClient.functions.invoke('send-payout-success-email', {
      body: {
        sitter_email: booking.sitter.email,
        sitter_name: `${booking.sitter.first_name} ${booking.sitter.last_name}`,
        owner_name: `${booking.owner.first_name} ${booking.owner.last_name}`,
        booking_reference: booking.booking_reference,
        payout_amount: sitterReceived,
        penalty_applied: penaltyApplied,
        penalty_amount: penaltyAmount,
        reports_completed: booking.daily_reports_completed,
        reports_required: booking.daily_reports_required,
      }
    });

    logStep("Payout success email sent to sitter");

    return new Response(
      JSON.stringify({
        success: true,
        message: penaltyApplied 
          ? "Payout processed with 15% penalty for incomplete reports" 
          : "Payout processed successfully",
        sitter_received: sitterReceived,
        platform_fee: booking.platform_fee,
        stripe_fee: stripeFee,
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
