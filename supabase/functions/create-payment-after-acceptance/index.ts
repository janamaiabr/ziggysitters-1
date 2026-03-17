import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[CREATE-PAYMENT-AFTER-ACCEPTANCE] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function invoked');
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep('ERROR: No authorization header');
      return new Response(JSON.stringify({ 
        error: "Authentication required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    const token = authHeader.replace("Bearer ", "");
    logStep('Authenticating user');
    
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError) {
      logStep('ERROR: Auth failed', { error: authError.message });
      return new Response(JSON.stringify({ 
        error: `Authentication failed: ${authError.message}` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    const user = data.user;
    if (!user?.email) {
      logStep('ERROR: No user or email found');
      return new Response(JSON.stringify({ 
        error: "User not authenticated or email not available" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    logStep('User authenticated', { userId: user.id, email: user.email });

    const body = await req.json();
    logStep('Request body received', { body });
    
    // Accept both bookingId and booking_id for flexibility
    const bookingId = body.bookingId || body.booking_id;
    if (!bookingId) {
      logStep('ERROR: No booking ID in request', { body });
      return new Response(JSON.stringify({ 
        error: "Booking ID is required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep('Looking for booking', { bookingId });

    // Get booking details - using separate queries for reliability
    logStep('Fetching booking details', { bookingId });
    
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .maybeSingle();

    if (bookingError) {
      logStep('ERROR: Database error fetching booking', { error: bookingError.message, bookingId });
      throw new Error(`Database error: ${bookingError.message}`);
    }
    
    if (!booking) {
      logStep('ERROR: Booking not found', { bookingId });
      return new Response(JSON.stringify({ 
        error: `Booking not found with ID: ${bookingId}` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    logStep('Booking retrieved', { 
      bookingId: booking.id, 
      status: booking.status,
      ownerId: booking.owner_id,
      sitterId: booking.sitter_id 
    });

    // Get owner profile
    logStep('Fetching owner profile', { ownerId: booking.owner_id });
    const { data: ownerProfile, error: ownerError } = await supabaseClient
      .from('profiles')
      .select('user_id, email, first_name, last_name, phone')
      .eq('id', booking.owner_id)
      .maybeSingle();

    if (ownerError || !ownerProfile) {
      logStep('ERROR: Owner profile not found', { error: ownerError?.message, ownerId: booking.owner_id });
      return new Response(JSON.stringify({ 
        error: "Owner profile not found" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Verify user owns this booking
    if (ownerProfile.user_id !== user.id) {
      logStep('ERROR: Unauthorized access attempt', { 
        bookingOwnerId: ownerProfile.user_id, 
        requestUserId: user.id 
      });
      return new Response(JSON.stringify({ 
        error: "You can only pay for your own bookings" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Get sitter profile
    logStep('Fetching sitter profile', { sitterId: booking.sitter_id });
    const { data: sitterProfile, error: sitterError } = await supabaseClient
      .from('profiles')
      .select('stripe_account_id, stripe_account_enabled, first_name, last_name, city, suburb')
      .eq('id', booking.sitter_id)
      .maybeSingle();

    if (sitterError || !sitterProfile) {
      logStep('ERROR: Sitter profile not found', { error: sitterError?.message, sitterId: booking.sitter_id });
      return new Response(JSON.stringify({ 
        error: "Sitter profile not found" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Verify booking is awaiting payment
    if (booking.status !== 'awaiting_payment') {
      logStep('ERROR: Invalid booking status', { 
        currentStatus: booking.status, 
        expectedStatus: 'awaiting_payment' 
      });
      return new Response(JSON.stringify({ 
        error: `Booking is not awaiting payment. Current status: ${booking.status}. Please refresh the page.` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Verify sitter has Stripe Connect enabled - THIS IS THE KEY FIX
    logStep('Checking Sitter Stripe Status', {
      sitterId: booking.sitter_id,
      sitterName: `${sitterProfile.first_name} ${sitterProfile.last_name}`,
      stripe_account_id: sitterProfile.stripe_account_id,
      stripe_account_enabled: sitterProfile.stripe_account_enabled,
      hasAccountId: !!sitterProfile.stripe_account_id,
      isEnabled: sitterProfile.stripe_account_enabled === true
    });

    if (!sitterProfile.stripe_account_id || !sitterProfile.stripe_account_enabled) {
      const sitterName = `${sitterProfile.first_name} ${sitterProfile.last_name}`;
      logStep('ERROR: Sitter Stripe not configured', { 
        sitterId: booking.sitter_id,
        sitterName,
        stripe_account_id: sitterProfile.stripe_account_id,
        stripe_account_id_length: sitterProfile.stripe_account_id?.length || 0,
        stripe_account_enabled: sitterProfile.stripe_account_enabled,
        stripe_account_enabled_type: typeof sitterProfile.stripe_account_enabled,
        hasAccountId: !!sitterProfile.stripe_account_id,
        isEnabled: sitterProfile.stripe_account_enabled
      });
      // Return 400 (Bad Request) so the error message reaches the frontend properly
      return new Response(JSON.stringify({ 
        error: `${sitterName} hasn't completed their payment setup yet. The booking cannot be paid until they finish setting up their Stripe account. Please contact ${sitterName} or cancel this booking.`,
        error_code: 'SITTER_STRIPE_NOT_ENABLED',
        debug: {
          has_account_id: !!sitterProfile.stripe_account_id,
          account_enabled: sitterProfile.stripe_account_enabled,
          account_enabled_type: typeof sitterProfile.stripe_account_enabled
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep('Sitter Stripe account verified', { accountId: sitterProfile.stripe_account_id });

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep('ERROR: Stripe secret key not configured');
      throw new Error("Stripe is not configured. Please contact support.");
    }
    
    logStep('Initializing Stripe');
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists or create one with phone number
    logStep('Checking for existing Stripe customer', { email: user.email });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep('Existing Stripe customer found', { customerId });
      
      // Update customer with phone number if provided
      if (ownerProfile.phone) {
        await stripe.customers.update(customerId, {
          phone: ownerProfile.phone,
        });
        logStep('Updated customer phone number', { phone: ownerProfile.phone });
      }
    } else if (ownerProfile.phone) {
      // Create customer with phone number
      logStep('Creating new Stripe customer', { email: user.email, phone: ownerProfile.phone });
      const customer = await stripe.customers.create({
        email: user.email,
        phone: ownerProfile.phone,
      });
      customerId = customer.id;
      logStep('Created new Stripe customer', { customerId });
    }

    // Create checkout session with Stripe Connect (escrow via destination charge)
    logStep('Creating Stripe checkout session', {
      customerId,
      totalAmount: booking.total_amount,
      platformFee: booking.platform_fee,
      sitterAccount: sitterProfile.stripe_account_id
    });
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: 'nzd',
            product_data: {
              name: `${booking.service_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} - ${booking.booking_reference}`,
              description: `Pet sitting service from ${booking.start_date} to ${booking.end_date}`,
            },
            unit_amount: Math.round(booking.total_amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_intent_data: {
        application_fee_amount: Math.round(booking.platform_fee * 100),
        transfer_data: {
          destination: sitterProfile.stripe_account_id,
        },
        metadata: {
          booking_id: bookingId,
          booking_reference: booking.booking_reference,
          service_type: booking.service_type,
        },
      },
      success_url: `${req.headers.get("origin")}/booking-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}&booking_ref=${encodeURIComponent(booking.booking_reference)}`,
      cancel_url: `${req.headers.get("origin")}/bookings?payment=cancelled`,
      metadata: {
        booking_id: bookingId,
        booking_reference: booking.booking_reference,
        service_type: booking.service_type,
      },
    });

    logStep('Checkout session created successfully', { 
      sessionId: session.id,
      sessionUrl: session.url 
    });

    // Update booking with Stripe session ID
    const { error: updateError } = await supabaseClient
      .from('bookings')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', bookingId);

    if (updateError) {
      logStep('Failed to update booking with session ID', { error: updateError });
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : '';
    
    logStep('CRITICAL ERROR in payment flow', { 
      message: errorMessage,
      stack: errorStack,
      type: error?.constructor?.name 
    });
    
    // Return a detailed error response
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: 'Check edge function logs for more information',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
