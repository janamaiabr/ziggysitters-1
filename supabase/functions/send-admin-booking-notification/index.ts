import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminBookingNotificationRequest {
  booking_id: string;
  owner_name: string;
  owner_email: string;
  sitter_name: string;
  sitter_email?: string;
  service_type: string;
  start_date: string;
  end_date: string;
  booking_reference: string;
  total_amount: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const data: AdminBookingNotificationRequest = await req.json();

    console.log("=== NEW BOOKING - QUEUING FOR WEEKLY DIGEST ===");
    console.log("Reference:", data.booking_reference, "Owner:", data.owner_name, "Sitter:", data.sitter_name);

    // Queue event for weekly digest instead of sending email immediately
    const { error } = await supabase
      .from("admin_event_queue")
      .insert({
        event_type: "new_booking",
        event_data: {
          booking_id: data.booking_id,
          booking_reference: data.booking_reference,
          owner_name: data.owner_name,
          owner_email: data.owner_email,
          sitter_name: data.sitter_name,
          sitter_email: data.sitter_email,
          service_type: data.service_type,
          start_date: data.start_date,
          end_date: data.end_date,
          total_amount: data.total_amount,
          created_at: new Date().toISOString()
        }
      });

    if (error) {
      console.error("Failed to queue booking event:", error);
      throw new Error(`Failed to queue event: ${error.message}`);
    }

    console.log("New booking event queued for weekly digest");

    return new Response(JSON.stringify({ success: true, queued: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error queuing admin booking notification:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
