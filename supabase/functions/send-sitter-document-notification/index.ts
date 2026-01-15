import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DocumentNotificationRequest {
  sitter_id: string;
  document_type: 'id_verification' | 'vet_check';
  sitter_name: string;
  sitter_email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sitter_id, document_type, sitter_name, sitter_email }: DocumentNotificationRequest = await req.json();

    console.log('=== DOCUMENT SUBMITTED - QUEUING FOR WEEKLY DIGEST ===');
    console.log('Sitter:', sitter_name, 'Document:', document_type);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get sitter profile details for the event
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('first_name, last_name, suburb, city')
      .eq('id', sitter_id)
      .single();

    const documentTypeLabel = document_type === 'id_verification' ? 'ID Verification' : 'Police Vet Check';

    // Queue event for weekly digest instead of sending email immediately
    const { error } = await supabaseClient
      .from("admin_event_queue")
      .insert({
        event_type: "document_submitted",
        event_data: {
          sitter_id,
          sitter_name: profile ? `${profile.first_name} ${profile.last_name}` : sitter_name,
          sitter_email,
          document_type: documentTypeLabel,
          location: profile ? `${profile.suburb || ''}, ${profile.city || 'Auckland'}` : 'Unknown',
          submitted_at: new Date().toISOString()
        }
      });

    if (error) {
      console.error("Failed to queue document event:", error);
      throw new Error(`Failed to queue event: ${error.message}`);
    }

    console.log('Document submission event queued for weekly digest');

    return new Response(
      JSON.stringify({ success: true, queued: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error queuing document notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
