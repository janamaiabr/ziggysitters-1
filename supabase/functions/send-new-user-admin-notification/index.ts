import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  sessionId?: string;
  role?: string;
  suburb?: string;
  city?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, sessionId, role, suburb, city }: NewUserRequest = await req.json();
    console.log("=== NEW USER - QUEUING FOR WEEKLY DIGEST ===");
    console.log("Email:", email, "Name:", firstName, lastName, "Role:", role, "Location:", suburb, city);

    // Queue event for weekly digest instead of sending email immediately
    const { error } = await supabase
      .from("admin_event_queue")
      .insert({
        event_type: "new_user",
        event_data: {
          email,
          firstName,
          lastName,
          sessionId,
          role,
          suburb,
          city,
          registered_at: new Date().toISOString()
        }
      });

    if (error) {
      console.error("Failed to queue new user event:", error);
      throw new Error(`Failed to queue event: ${error.message}`);
    }

    console.log("New user event queued for weekly digest");

    return new Response(JSON.stringify({ success: true, queued: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error queuing admin notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
