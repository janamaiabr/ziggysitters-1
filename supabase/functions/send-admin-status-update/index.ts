import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StatusUpdateRequest {
  booking_reference: string;
  old_status: string;
  new_status: string;
  owner_name: string;
  owner_email: string;
  sitter_name: string;
  sitter_email: string;
  service_type: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  platform_fee: number;
  payment_status?: string;
  additional_info?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const data: StatusUpdateRequest = await req.json();

    console.log("=== BOOKING STATUS UPDATE - QUEUING FOR WEEKLY DIGEST ===");
    console.log("Reference:", data.booking_reference, "Status:", data.old_status, "→", data.new_status);

    // Queue event for weekly digest instead of sending email immediately
    const { error } = await supabase
      .from("admin_event_queue")
      .insert({
        event_type: "booking_status_update",
        event_data: {
          booking_reference: data.booking_reference,
          old_status: data.old_status,
          new_status: data.new_status,
          owner_name: data.owner_name,
          sitter_name: data.sitter_name,
          service_type: data.service_type,
          total_amount: data.total_amount,
          payment_status: data.payment_status,
          additional_info: data.additional_info,
          updated_at: new Date().toISOString()
        }
      });

    if (error) {
      console.error("Failed to queue status update event:", error);
      throw new Error(`Failed to queue event: ${error.message}`);
    }

    console.log("Status update event queued for weekly digest");

    return new Response(JSON.stringify({ success: true, queued: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error queuing admin status update:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
