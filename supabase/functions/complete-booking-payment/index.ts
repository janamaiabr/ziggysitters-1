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

    const { booking_id } = await req.json();
    if (!booking_id) throw new Error("Booking ID is required");

    console.log('Looking for booking:', booking_id, 'for user:', user.email);

    // Get booking details using service role for admin access
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select(`
        id, 
        total_amount, 
        service_type, 
        start_date, 
        end_date,
        status,
        booking_reference,
        owner_id,
        owner:profiles!owner_id(user_id, email, first_name, last_name)
      `)
      .eq('id', booking_id)
      .maybeSingle();

    console.log('Booking query result:', { booking, bookingError });

    if (bookingError) {
      console.error('Database error:', bookingError);
      throw new Error(`Database error: ${bookingError.message}`);
    }
    
    if (!booking) {
      console.error('Booking not found for ID:', booking_id);
      throw new Error("Booking not found");
    }

    // Verify user owns this booking
    if (booking.owner.user_id !== user.id) {
      throw new Error("Unauthorized: You can only complete payment for your own bookings");
    }

    // Verify booking is pending or awaiting payment
    if (!['pending', 'awaiting_payment'].includes(booking.status)) {
      throw new Error("Booking is not pending payment");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create checkout session with dynamic pricing
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: 'nzd',
            product_data: {
              name: `${booking.service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${booking.booking_reference}`,
              description: `Pet sitting service from ${booking.start_date} to ${booking.end_date}`,
            },
            unit_amount: Math.round(booking.total_amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/bookings?payment=success&session_id={CHECKOUT_SESSION_ID}&booking_id=${booking_id}`,
      cancel_url: `${req.headers.get("origin")}/bookings?payment=cancelled`,
      metadata: {
        booking_id: booking_id,
        service_type: booking.service_type,
      },
    });

    console.log('Checkout session created:', session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Error creating payment session:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});