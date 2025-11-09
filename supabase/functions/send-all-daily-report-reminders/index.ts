import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("📧 Starting daily report reminder batch job...");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date().toISOString().split('T')[0];

    // Find all active bookings that require daily reports and are currently in progress
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select(`
        id,
        start_date,
        end_date,
        daily_reports_required,
        daily_reports_completed,
        sitter:profiles!bookings_sitter_id_fkey(email, first_name)
      `)
      .eq('requires_daily_reports', true)
      .eq('status', 'in_progress')
      .lte('start_date', today)
      .gte('end_date', today);

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      throw bookingsError;
    }

    if (!bookings || bookings.length === 0) {
      console.log("No active bookings requiring daily reports found.");
      return new Response(
        JSON.stringify({ message: "No bookings require reminders today", count: 0 }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Found ${bookings.length} active bookings requiring daily reports`);

    // Check if each booking has submitted today's report
    const remindersToSend = [];
    
    for (const booking of bookings) {
      // Check if today's report has been submitted
      const { data: todayReport } = await supabase
        .from('daily_reports')
        .select('id')
        .eq('booking_id', booking.id)
        .eq('report_date', today)
        .maybeSingle();

      // If no report submitted today, add to reminder list
      if (!todayReport) {
        remindersToSend.push(booking);
        console.log(`📝 Reminder needed for booking ${booking.id} - sitter: ${booking.sitter.email}`);
      } else {
        console.log(`✅ Report already submitted for booking ${booking.id}`);
      }
    }

    console.log(`Sending ${remindersToSend.length} reminder emails...`);

    // Send reminder for each booking that needs one
    const results = [];
    for (const booking of remindersToSend) {
      try {
        const { error: invokeError } = await supabase.functions.invoke('send-daily-report-reminder', {
          body: { bookingId: booking.id }
        });

        if (invokeError) {
          console.error(`Failed to send reminder for booking ${booking.id}:`, invokeError);
          results.push({ bookingId: booking.id, success: false, error: invokeError.message });
        } else {
          console.log(`✅ Reminder sent for booking ${booking.id}`);
          results.push({ bookingId: booking.id, success: true });
        }
      } catch (error: any) {
        console.error(`Error sending reminder for booking ${booking.id}:`, error);
        results.push({ bookingId: booking.id, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`📊 Batch complete: ${successCount} sent, ${failureCount} failed`);

    return new Response(
      JSON.stringify({
        message: "Daily report reminders batch completed",
        totalBookings: bookings.length,
        remindersSent: successCount,
        remindersFailed: failureCount,
        results
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in batch reminder job:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
