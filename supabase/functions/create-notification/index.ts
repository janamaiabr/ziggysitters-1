import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id, type, title, message, link, metadata }: NotificationRequest = await req.json();

    if (!user_id || !type || !title || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: user_id, type, title, message" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Creating notification for user ${user_id}: ${type} - ${title}`);

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id,
        type,
        title,
        message,
        link,
        metadata: metadata || {},
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error("Error creating notification:", error);
      throw error;
    }

    console.log("Notification created:", data.id);

    return new Response(
      JSON.stringify({ success: true, notification: data }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in create-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);