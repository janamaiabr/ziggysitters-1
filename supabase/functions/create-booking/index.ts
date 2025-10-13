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

    // Calculate daily reports required (only if owner explicitly requested them)
    const requiresDailyReports = bookingData.requiresDailyReports === true; // Default to false
    let dailyReportsRequired = 0;
    if (requiresDailyReports) {
      const startDateTime = new Date(bookingData.startDate);
      const endDateTime = new Date(bookingData.endDate);
      const daysDiff = Math.ceil((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 3600 * 24)) + 1;
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
      .single();

    if (bookingError || !booking) {
      throw new Error(`Failed to create booking: ${bookingError?.message}`);
    }
    logStep("Booking created - payment will occur after sitter acceptance", { bookingId: booking.id, reference: booking.booking_reference });

    // Get sitter's profile for notification
    const { data: sitterProfile, error: sitterError } = await supabaseClient
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', bookingData.sitterId)
      .maybeSingle();

    if (sitterError || !sitterProfile) {
      throw new Error('Sitter profile not found');
    }

    // Send booking notification email to sitter
    try {
      await supabaseClient.functions.invoke('send-booking-notification', {
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
      logStep("Booking notification email sent to sitter");
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
    logStep("ERROR in create-booking", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});