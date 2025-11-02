import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
  requiresDailyReports?: boolean;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-BOOKING] ${step}${detailsStr}`);
};

serve(async (req) => {
  try {
    console.log("[CREATE-BOOKING] === FUNCTION INVOKED ===");
    console.log("[CREATE-BOOKING] Request method:", req.method);
    
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      console.log("[CREATE-BOOKING] Handling OPTIONS request");
      return new Response(null, { headers: corsHeaders });
    }

    // Check environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[CREATE-BOOKING] Missing environment variables", { 
        hasUrl: !!supabaseUrl, 
        hasKey: !!serviceRoleKey 
      });
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    console.log("[CREATE-BOOKING] Environment variables OK");

    // Create Supabase client using the service role key for admin access
    const supabaseClient = createClient(
      supabaseUrl,
      serviceRoleKey,
      { auth: { persistSession: false } }
    );
    
    console.log("[CREATE-BOOKING] Supabase client created");
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
      .maybeSingle();
    
    if (profileError) {
      throw new Error(`Database error fetching profile: ${profileError.message}`);
    }
    
    if (!profile) {
      throw new Error("User profile not found");
    }
    logStep("User profile found", { profileId: profile.id });

    const bookingData: BookingRequest = await req.json();
    logStep("Booking request received", bookingData);

    // ============= CRITICAL VALIDATION: Edge Cases & Boundary Conditions =============
    
    // Validate dates are not in the past
    const startDate = new Date(bookingData.startDate);
    const endDate = new Date(bookingData.endDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset to start of day for comparison
    
    if (startDate < now) {
      throw new Error("Start date cannot be in the past");
    }
    
    if (endDate < startDate) {
      throw new Error("End date must be after start date");
    }
    
    // Validate booking duration (max 90 days)
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
    if (daysDiff > 90) {
      throw new Error("Booking duration cannot exceed 90 days");
    }
    
    // Validate pet count (max 10 pets per booking)
    if (!bookingData.petIds || bookingData.petIds.length === 0) {
      throw new Error("At least one pet must be selected");
    }
    if (bookingData.petIds.length > 10) {
      throw new Error("Maximum 10 pets per booking");
    }
    
    // Validate total amount is positive and reasonable
    if (bookingData.totalAmount <= 0) {
      throw new Error("Total amount must be greater than 0");
    }
    if (bookingData.totalAmount > 100000) {
      throw new Error("Total amount exceeds maximum allowed ($100,000)");
    }
    
    // Validate special instructions length (max 2000 characters)
    if (bookingData.specialInstructions && bookingData.specialInstructions.length > 2000) {
      throw new Error("Special instructions cannot exceed 2000 characters");
    }
    
    // Trim and validate special instructions not empty/spaces-only
    if (bookingData.specialInstructions) {
      bookingData.specialInstructions = bookingData.specialInstructions.trim();
      if (bookingData.specialInstructions.length === 0) {
        bookingData.specialInstructions = undefined; // Convert empty string to undefined
      }
    }
    
    logStep("Edge case validation passed");

    // ============= CRITICAL VALIDATION: Data Integrity - Pet IDs exist =============
    
    // Validate all pet IDs exist and belong to the owner
    const { data: validPets, error: petsError } = await supabaseClient
      .from('pets')
      .select('id')
      .eq('owner_id', profile.id)
      .in('id', bookingData.petIds);
    
    if (petsError || !validPets || validPets.length !== bookingData.petIds.length) {
      throw new Error("One or more pet IDs are invalid or do not belong to you");
    }
    logStep("Pet IDs validated", { petCount: validPets.length });

    // Service type mapping from frontend to database enum
    // ONLY 3 CORE SERVICES (dog walking removed)
    const serviceTypeMapping = {
      'pet_sitting_owners_home': 'pet_sitting_owners_home',
      'pet_sitting_sitters_home': 'pet_sitting_sitters_home',
      'drop_in_visits': 'drop_in_visits'
    };

    // Map frontend service type to database enum
    const dbServiceType = serviceTypeMapping[bookingData.serviceType as keyof typeof serviceTypeMapping] || bookingData.serviceType;
    
    // Validate that the service type exists - ONLY 3 CORE SERVICES
    const validServiceTypes = ['pet_sitting_owners_home', 'pet_sitting_sitters_home', 'drop_in_visits'];
    if (!validServiceTypes.includes(dbServiceType)) {
      throw new Error(`Invalid service type: ${bookingData.serviceType}. Only pet sitting and drop-in visits are available.`);
    }
    
    // Get sitter's service pricing to validate amount
    const { data: sitterService, error: serviceError } = await supabaseClient
      .from('sitter_services')
      .select('hourly_rate, daily_rate, is_offered')
      .eq('sitter_id', bookingData.sitterId)
      .eq('service_type', dbServiceType)
      .maybeSingle();
    
    if (serviceError || !sitterService) {
      throw new Error("Sitter does not offer this service");
    }
    
    if (!sitterService.is_offered) {
      throw new Error("This service is not currently offered by the sitter");
    }
    
    // Calculate expected amount based on NEW pricing model (PER PET)
    let expectedAmount = 0;
    const numDays = daysDiff;
    const numPets = bookingData.petIds.length;
    
    if (dbServiceType === 'pet_sitting_owners_home' || dbServiceType === 'pet_sitting_sitters_home') {
      // Pet sitting: daily_rate PER PET
      if (!sitterService.daily_rate) {
        throw new Error("Sitter has not set up daily rates for pet sitting");
      }
      expectedAmount = Number(sitterService.daily_rate) * numDays * numPets;
    } else if (dbServiceType === 'drop_in_visits') {
      // Drop-in visits: hourly rate (per visit)
      if (!sitterService.hourly_rate) {
        throw new Error("Sitter has not set up visit rates");
      }
      // For drop-in visits, use hourly rate as the per-visit rate
      expectedAmount = Number(sitterService.hourly_rate) * numDays;
    }
    
    // Allow 20% variance for rounding and minor adjustments
    const minExpected = expectedAmount * 0.8;
    const maxExpected = expectedAmount * 1.2;
    
    if (bookingData.totalAmount < minExpected || bookingData.totalAmount > maxExpected) {
      logStep("Amount validation warning", { 
        provided: bookingData.totalAmount, 
        expected: expectedAmount,
        range: `${minExpected}-${maxExpected}`,
        numPets,
        numDays
      });
      throw new Error(`Amount validation failed. Expected around $${expectedAmount.toFixed(2)} but got $${bookingData.totalAmount}`);
    }
    
    logStep("Service pricing validated");

    // ============= CRITICAL VALIDATION: Race Conditions - Check Availability =============
    
    // Check if sitter has any conflicting bookings for the requested dates
    const { data: conflictingBookings, error: conflictError } = await supabaseClient
      .from('bookings')
      .select('id, start_date, end_date, status')
      .eq('sitter_id', bookingData.sitterId)
      .in('status', ['pending', 'awaiting_payment', 'confirmed', 'in_progress'])
      .or(`and(start_date.lte.${bookingData.endDate},end_date.gte.${bookingData.startDate})`);
    
    if (conflictError) {
      logStep("Error checking availability", { error: conflictError });
      throw new Error("Failed to check sitter availability");
    }
    
    if (conflictingBookings && conflictingBookings.length > 0) {
      logStep("Conflicting bookings found", { count: conflictingBookings.length, bookings: conflictingBookings });
      throw new Error("Sitter is not available for the selected dates. Please choose different dates.");
    }
    
    // Check sitter's availability calendar for blocked dates
    const { data: unavailableDates, error: availabilityError } = await supabaseClient
      .from('sitter_availability')
      .select('date, is_available')
      .eq('sitter_id', bookingData.sitterId)
      .eq('is_available', false)
      .gte('date', bookingData.startDate)
      .lte('date', bookingData.endDate);
    
    if (availabilityError) {
      logStep("Error checking availability calendar", { error: availabilityError });
      // Don't fail - calendar is optional
    } else if (unavailableDates && unavailableDates.length > 0) {
      logStep("Unavailable dates found", { dates: unavailableDates });
      throw new Error(`Sitter has marked themselves unavailable on ${unavailableDates.length} day(s) in your selected range`);
    }
    
    logStep("Availability check passed - no conflicts found");
    
    // ============= Get sitter profile for notifications =============
    
    // Get sitter's profile
    const { data: sitterProfile, error: sitterProfileError } = await supabaseClient
      .from('profiles')
      .select('id, first_name, last_name, email, stripe_account_id, stripe_account_enabled, stripe_onboarding_completed')
      .eq('id', bookingData.sitterId)
      .maybeSingle();
    
    if (sitterProfileError || !sitterProfile) {
      throw new Error('Sitter profile not found');
    }
    
    const hasStripeSetup = sitterProfile.stripe_account_id && sitterProfile.stripe_account_enabled;
    logStep("Sitter Stripe status checked", { 
      hasStripeSetup,
      accountId: sitterProfile.stripe_account_id,
      enabled: sitterProfile.stripe_account_enabled 
    });

    // Calculate daily reports required (only if owner explicitly requested them)
    const requiresDailyReports = bookingData.requiresDailyReports === true; // Default to false
    let dailyReportsRequired = 0;
    if (requiresDailyReports) {
      dailyReportsRequired = Math.max(1, daysDiff);
    }

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
        platform_fee: Math.round(bookingData.totalAmount * 0.10 * 100) / 100, // 10% platform fee (GST inclusive)
        status: 'pending',
        payment_status: 'pending',
        requires_daily_reports: requiresDailyReports,
        daily_reports_required: dailyReportsRequired,
        daily_reports_completed: 0
      }])
      .select()
      .maybeSingle();

    if (bookingError) {
      throw new Error(`Database error creating booking: ${bookingError.message}`);
    }
    
    if (!booking) {
      throw new Error('Failed to create booking');
    }
    logStep("Booking created - payment will occur after sitter acceptance", { bookingId: booking.id, reference: booking.booking_reference });

    // Send booking notification email to sitter - different email based on Stripe status
    try {
      const notificationFunction = hasStripeSetup 
        ? 'send-booking-notification' 
        : 'send-booking-notification-no-stripe';
      
      await supabaseClient.functions.invoke(notificationFunction, {
        body: {
          booking_id: booking.id,
          sitter_email: sitterProfile.email,
          sitter_name: `${sitterProfile.first_name} ${sitterProfile.last_name}`,
          owner_name: `${profile.first_name} ${profile.last_name}`,
          service_type: dbServiceType,
          start_date: bookingData.startDate,
          end_date: bookingData.endDate,
          booking_reference: booking.booking_reference,
          total_amount: bookingData.totalAmount
        }
      });
      logStep(`Booking notification email sent to sitter (${notificationFunction})`);
    } catch (emailError) {
      logStep("Failed to send booking notification email", { error: emailError.message });
      // Don't fail the booking if email fails
    }

    // Send notification to admin
    try {
      await supabaseClient.functions.invoke('send-admin-booking-notification', {
        body: {
          booking_id: booking.id,
          owner_name: `${profile.first_name} ${profile.last_name}`,
          owner_email: profile.email,
          sitter_name: `${sitterProfile.first_name} ${sitterProfile.last_name}`,
          service_type: dbServiceType,
          start_date: bookingData.startDate,
          end_date: bookingData.endDate,
          booking_reference: booking.booking_reference,
          total_amount: bookingData.totalAmount
        }
      });
      logStep("Admin notification email sent");
    } catch (emailError) {
      logStep("Failed to send admin notification email", { error: emailError.message });
      // Don't fail the booking if email fails
    }

    return new Response(JSON.stringify({ 
      success: true,
      booking_reference: booking.booking_reference,
      booking_id: booking.id,
      sitter_name: `${sitterProfile.first_name} ${sitterProfile.last_name}`,
      message: 'Booking request sent. Payment will be requested after sitter accepts.'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("[CREATE-BOOKING] === CRITICAL ERROR ===");
    console.error("[CREATE-BOOKING] Error message:", errorMessage);
    console.error("[CREATE-BOOKING] Error stack:", errorStack);
    console.error("[CREATE-BOOKING] Error object:", JSON.stringify(error, null, 2));
    logStep("ERROR in create-booking", { message: errorMessage, stack: errorStack });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});