import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingRequest {
  sitterId: string;
  serviceType: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  petIds: string[];
  specialInstructions?: string;
  totalAmount: number;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-BOOKING] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase client using the service role key for admin access
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    // Retrieve authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (profileError || !profile) {
      throw new Error("User profile not found");
    }
    logStep("User profile found", { profileId: profile.id });

    const bookingData: BookingRequest = await req.json();
    logStep("Booking request received", bookingData);

    // Service type mapping from frontend to database enum
    const serviceTypeMapping = {
      // Legacy frontend mappings (for backward compatibility)
      'dog-walking': 'dog_walking',
      'pet-sitting': 'pet_sitting_owners_home',
      'overnight-care': 'pet_sitting_sitters_home',
      'drop-in-visits': 'drop_in_visits',
      'pet-boarding': 'overnight_boarding',
      'grooming': 'grooming',
      
      // Direct database service type mappings (for real service data)
      'dog_walking': 'dog_walking',
      'pet_sitting_owners_home': 'pet_sitting_owners_home',
      'pet_sitting_sitters_home': 'pet_sitting_sitters_home',
      'daycare': 'daycare',
      'overnight_boarding': 'overnight_boarding',
      'pet_care': 'pet_care'
    };

    // Map frontend service type to database enum
    const dbServiceType = serviceTypeMapping[bookingData.serviceType as keyof typeof serviceTypeMapping] || bookingData.serviceType;
    
    // Validate that the service type exists in our price mapping
    const validServiceTypes = ['dog_walking', 'pet_sitting_owners_home', 'pet_sitting_sitters_home', 'drop_in_visits', 'overnight_boarding', 'grooming', 'daycare', 'pet_care'];
    if (!validServiceTypes.includes(dbServiceType)) {
      throw new Error(`Invalid service type: ${bookingData.serviceType} -> ${dbServiceType}`);
    }

    // Service type to price mapping using NZD Stripe prices
    const servicePrices = {
      'dog_walking': 'price_1S7mMpGNy6CMpdXTxdDGnUD7', // Dog Walking - NZ$27.50
      'pet_sitting_owners_home': 'price_1S7mN0GNy6CMpdXTbWNUlUa2', // Pet Sitting - NZ$33.00
      'pet_sitting_sitters_home': 'price_1S7mNHGNy6CMpdXTG5bDwAzp', // Overnight Care - NZ$66.00
      'drop_in_visits': 'price_1S7mMpGNy6CMpdXTxdDGnUD7', // Drop-in Visits - NZ$27.50
      'overnight_boarding': 'price_1S7mNHGNy6CMpdXTG5bDwAzp', // Pet Boarding - NZ$66.00
      'grooming': 'price_1S7mMpGNy6CMpdXTxdDGnUD7', // Grooming - NZ$27.50
      'daycare': 'price_1S7mN0GNy6CMpdXTbWNUlUa2', // Daycare - NZ$33.00
      'pet_care': 'price_1S7mMpGNy6CMpdXTxdDGnUD7', // Pet Care - NZ$27.50
    };

    const priceId = servicePrices[dbServiceType as keyof typeof servicePrices];
    if (!priceId) {
      throw new Error(`No price mapping found for service type: ${bookingData.serviceType} -> ${dbServiceType}`);
    }
    logStep("Price ID determined", { frontendServiceType: bookingData.serviceType, dbServiceType, priceId });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if a Stripe customer record exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing Stripe customer found", { customerId });
    } else {
      logStep("No existing Stripe customer found");
    }

    // Create a booking record in pending state
    logStep("About to create booking", { 
      owner_id: profile.id, 
      sitter_id: bookingData.sitterId,
      service_type: dbServiceType,
      user_id: user.id,
      profile_user_id: profile.user_id 
    });

    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .insert([{
        owner_id: profile.id,
        sitter_id: bookingData.sitterId,
        service_type: dbServiceType,
        start_date: bookingData.startDate,
        end_date: bookingData.endDate,
        start_time: bookingData.startTime,
        end_time: bookingData.endTime,
        pet_ids: bookingData.petIds,
        special_instructions: bookingData.specialInstructions,
        total_amount: bookingData.totalAmount,
        platform_fee: Math.round(bookingData.totalAmount * 0.1 * 100) / 100, // 10% platform fee
        status: 'pending',
        payment_status: 'pending'
      }])
      .select()
      .single();

    if (bookingError || !booking) {
      throw new Error(`Failed to create booking: ${bookingError?.message}`);
    }
    logStep("Booking created", { bookingId: booking.id, reference: booking.booking_reference });

    // Calculate quantity for line item based on service rates
    const getServiceRate = (serviceType: string) => {
      switch (serviceType) {
        case 'pet_sitting_sitters_home': return 75;
        case 'overnight_boarding': return 75;
        case 'pet_sitting_owners_home': return 55;
        case 'daycare': return 55;
        case 'drop_in_visits': return 27.5;
        case 'dog_walking': return 27.5;
        case 'grooming': return 27.5;
        case 'pet_care': return 27.5;
        default: return 27.5;
      }
    };
    
    const rate = getServiceRate(dbServiceType);
    const quantity = Math.max(1, Math.ceil(bookingData.totalAmount / rate));

    // Create a one-time payment session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/booking-success?session_id={CHECKOUT_SESSION_ID}&booking_ref=${booking.booking_reference}`,
      cancel_url: `${req.headers.get("origin")}/sitter/${bookingData.sitterId}?booking_cancelled=true`,
      metadata: {
        booking_id: booking.id,
        booking_reference: booking.booking_reference,
        user_id: user.id,
        sitter_id: bookingData.sitterId,
      }
    });

    logStep("Stripe session created", { sessionId: session.id, url: session.url });

    // Update booking with Stripe session ID
    const { error: updateError } = await supabaseClient
      .from('bookings')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', booking.id);

    if (updateError) {
      logStep("Failed to update booking with session ID", { error: updateError.message });
    }

    return new Response(JSON.stringify({ 
      url: session.url,
      booking_reference: booking.booking_reference 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-booking", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});