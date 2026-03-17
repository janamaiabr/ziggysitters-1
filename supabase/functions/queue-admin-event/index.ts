import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QueueEventRequest {
  event_type: string;
  event_data: Record<string, any>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event_type, event_data }: QueueEventRequest = await req.json();

    if (!event_type || !event_data) {
      throw new Error("event_type and event_data are required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert event into queue
    const { data, error } = await supabase
      .from("admin_event_queue")
      .insert({
        event_type,
        event_data,
      })
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to queue event: ${error.message}`);
    }

    console.log(`Queued admin event: ${event_type}`, event_data);

    return new Response(
      JSON.stringify({ success: true, eventId: data.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error queuing admin event:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
