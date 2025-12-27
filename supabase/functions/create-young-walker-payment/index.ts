import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLATFORM_FEE_PERCENTAGE = 10; // 10% platform fee

serve(async (req) => {
  console.log("🔵 create-young-walker-payment: Request received");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user?.email) {
      throw new Error("User not authenticated");
    }

    console.log("🟢 User authenticated:", user.id);

    // Get request body
    const { bookingId } = await req.json();
    
    if (!bookingId) {
      throw new Error("Booking ID is required");
    }

    console.log("🔵 Processing payment for booking:", bookingId);

    // Get booking details
    const { data: booking, error: bookingError } = await supabaseClient
      .from("young_walker_bookings")
      .select(`
        *,
        young_walker:young_walkers (
          id,
          parent_user_id,
          parent_email,
          child_first_name
        )
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      console.error("🔴 Booking fetch error:", bookingError);
      throw new Error("Booking not found");
    }

    console.log("🔵 Booking found:", booking.booking_reference);

    // Get client profile
    const { data: clientProfile } = await supabaseClient
      .from("profiles")
      .select("id, user_id")
      .eq("user_id", user.id)
      .single();

    if (!clientProfile || clientProfile.id !== booking.client_id) {
      throw new Error("You are not authorized to pay for this booking");
    }

    // Get parent's Stripe account
    const { data: parentProfile, error: parentError } = await supabaseClient
      .from("profiles")
      .select("stripe_account_id, stripe_account_enabled")
      .eq("user_id", booking.young_walker.parent_user_id)
      .single();

    if (parentError || !parentProfile) {
      console.error("🔴 Parent profile fetch error:", parentError);
      throw new Error("Parent profile not found");
    }

    if (!parentProfile.stripe_account_id || !parentProfile.stripe_account_enabled) {
      throw new Error("The young walker's parent has not completed payment setup. Please try again later.");
    }

    console.log("🔵 Parent Stripe account:", parentProfile.stripe_account_id);

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Calculate amounts (in cents)
    const totalAmountCents = Math.round(booking.total_amount * 100);
    const platformFeeCents = Math.round(totalAmountCents * (PLATFORM_FEE_PERCENTAGE / 100));

    console.log("🔵 Payment amounts - Total:", totalAmountCents, "Platform fee:", platformFeeCents);

    // Create Stripe Checkout Session with destination charge
    const origin = req.headers.get("origin") || "https://ziggysitters.lovable.app";
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "nzd",
            product_data: {
              name: `Dog Walk with ${booking.young_walker.child_first_name}`,
              description: `${booking.duration_mins} minute walk on ${booking.walk_date}`,
            },
            unit_amount: totalAmountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/bookings?payment=success&booking=${bookingId}`,
      cancel_url: `${origin}/bookings?payment=cancelled&booking=${bookingId}`,
      customer_email: user.email,
      payment_intent_data: {
        application_fee_amount: platformFeeCents,
        transfer_data: {
          destination: parentProfile.stripe_account_id,
        },
      },
      metadata: {
        booking_id: bookingId,
        booking_reference: booking.booking_reference,
        booking_type: "young_walker",
        client_id: booking.client_id,
        young_walker_id: booking.young_walker_id,
      },
    });

    console.log("🟢 Checkout session created:", session.id);

    // Update booking with checkout session ID
    await supabaseClient
      .from("young_walker_bookings")
      .update({
        payment_status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("🔴 Error in create-young-walker-payment:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Payment creation failed" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
