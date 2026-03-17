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

  try {
    console.log("[CHECK-MISSING-DOCS] Starting document check...");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Find sitters who:
    // 1. Are pet_sitters
    // 2. Have completed onboarding
    // 3. Are not yet verified
    // 4. Don't have ID document uploaded (police vet is optional)
    const { data: sittersWithoutDocs, error } = await supabaseClient
      .from('profiles')
      .select('id, first_name, last_name, email, id_document_url, blue_card_document_url, verification_documents_uploaded_at')
      .eq('role', 'pet_sitter')
      .eq('onboarding_completed', true)
      .eq('is_verified', false)
      .is('id_document_url', null); // Only check for missing ID, police vet is optional

    if (error) {
      console.error("[CHECK-MISSING-DOCS] Error fetching sitters:", error);
      throw error;
    }

    console.log(`[CHECK-MISSING-DOCS] Found ${sittersWithoutDocs?.length || 0} sitters without complete documents`);

    const results = [];

    for (const sitter of sittersWithoutDocs || []) {
      try {
        // Since we're only querying for sitters missing ID, we send the reminder
        // (No need to skip - they need to upload ID to get verified)

        // Send reminder email
        const { error: emailError } = await supabaseClient.functions.invoke('send-document-upload-reminder', {
          body: {
            sitterEmail: sitter.email,
            sitterName: sitter.first_name
          }
        });

        if (emailError) {
          console.error(`[CHECK-MISSING-DOCS] Error sending email to ${sitter.email}:`, emailError);
          results.push({
            sitter_id: sitter.id,
            email: sitter.email,
            status: 'failed',
            error: emailError.message
          });
        } else {
          console.log(`[CHECK-MISSING-DOCS] Reminder sent to ${sitter.email}`);
          results.push({
            sitter_id: sitter.id,
            email: sitter.email,
            status: 'sent'
          });
        }
      } catch (emailError) {
        console.error(`[CHECK-MISSING-DOCS] Failed to process sitter ${sitter.email}:`, emailError);
        results.push({
          sitter_id: sitter.id,
          email: sitter.email,
          status: 'error',
          error: (emailError as Error).message
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total_checked: sittersWithoutDocs?.length || 0,
        emails_sent: results.filter(r => r.status === 'sent').length,
        results
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[CHECK-MISSING-DOCS] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
