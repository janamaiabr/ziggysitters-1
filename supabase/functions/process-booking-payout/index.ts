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
    console.log("Processing booking payout");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { booking_id } = await req.json();
    
    if (!booking_id) {
      throw new Error("Booking ID is required");
    }

    console.log("Processing payout for booking:", booking_id);

    // Get booking details
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
        requires_daily_reports,
        daily_reports_required,
        daily_reports_completed
      `)
      .eq("id", booking_id)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    // Verify booking is completed
    if (booking.status !== "completed") {
      throw new Error("Booking must be completed before processing payout");
    }

    // Verify payment was successful
    if (booking.payment_status !== "paid") {
      throw new Error("Booking payment not confirmed");
    }

    // Check if all daily reports are submitted (only if reports were required)
    if (booking.requires_daily_reports && 
        booking.daily_reports_required > 0 && 
        booking.daily_reports_completed < booking.daily_reports_required) {
      throw new Error("All daily reports must be submitted before payout");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Get sitter profile
    const { data: sitter, error: sitterError } = await supabaseClient
      .from("profiles")
      .select("stripe_account_id, stripe_account_enabled")
      .eq("id", booking.sitter_id)
      .single();

    if (sitterError || !sitter?.stripe_account_id || !sitter.stripe_account_enabled) {
      throw new Error("Sitter Stripe account not found or not enabled");
    }

    console.log("Sitter account verified:", sitter.stripe_account_id);

    // The payment has already been made to the sitter through Connect destination charge
    // This function is mainly for verification and logging
    // We can add a payout_processed flag if needed

    const { error: updateError } = await supabaseClient
      .from("bookings")
      .update({
        payment_status: "paid_out",
      })
      .eq("id", booking_id);

    if (updateError) {
      console.error("Error updating booking:", updateError);
      throw updateError;
    }

    console.log("Payout processed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payout processed successfully",
        sitter_received: booking.total_amount - booking.platform_fee,
        platform_fee: booking.platform_fee,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in process-booking-payout:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
