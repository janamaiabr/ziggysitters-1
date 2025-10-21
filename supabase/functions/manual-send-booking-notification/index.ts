import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const { booking_reference } = await req.json();

    console.log(`[MANUAL-NOTIFICATION] Processing booking: ${booking_reference}`);

    // Get booking details
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select(`
        id,
        booking_reference,
        service_type,
        start_date,
        end_date,
        total_amount,
        owner:profiles!bookings_owner_id_fkey(first_name, last_name),
        sitter:profiles!bookings_sitter_id_fkey(email, first_name, last_name)
      `)
      .eq('booking_reference', booking_reference)
      .maybeSingle();

    if (bookingError) {
      throw new Error(`Database error: ${bookingError.message}`);
    }
    
    if (!booking) {
      throw new Error(`Booking not found: ${booking_reference}`);
    }

    console.log(`[MANUAL-NOTIFICATION] Found booking, sending notification to ${booking.sitter.email}`);

    // Invoke send-booking-notification
    const { data: emailResult, error: emailError } = await supabaseClient.functions.invoke('send-booking-notification', {
      body: {
        booking_id: booking.id,
        sitter_email: booking.sitter.email,
        sitter_name: `${booking.sitter.first_name} ${booking.sitter.last_name}`,
        owner_name: `${booking.owner.first_name} ${booking.owner.last_name}`,
        service_type: booking.service_type,
        start_date: booking.start_date,
        end_date: booking.end_date,
        booking_reference: booking.booking_reference,
        total_amount: booking.total_amount
      }
    });

    if (emailError) {
      console.error(`[MANUAL-NOTIFICATION] Error sending email:`, emailError);
      throw emailError;
    }

    console.log(`[MANUAL-NOTIFICATION] Email sent successfully:`, emailResult);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Notification sent to ${booking.sitter.email}`,
      emailResult 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[MANUAL-NOTIFICATION] Error:`, errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
