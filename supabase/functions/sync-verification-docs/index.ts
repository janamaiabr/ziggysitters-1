import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[SYNC-VERIFICATION-DOCS] Starting sync check...");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Find profiles with document URLs
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email, id_document_url, blue_card_document_url")
      .or("id_document_url.neq.,blue_card_document_url.neq.")
      .not("id_document_url", "is", null);

    const { data: profiles2 } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email, id_document_url, blue_card_document_url")
      .not("blue_card_document_url", "is", null);

    if (error) throw error;

    // Merge both queries (profiles with id_document_url OR blue_card_document_url)
    const allProfiles = new Map();
    for (const p of [...(profiles || []), ...(profiles2 || [])]) {
      allProfiles.set(p.id, p);
    }

    const results: { id: string; name: string; field: string; url: string; status: string }[] = [];

    for (const profile of allProfiles.values()) {
      // Check id_document_url
      if (profile.id_document_url) {
        const exists = await checkFileExists(supabase, profile.id_document_url);
        if (!exists) {
          console.log(`[SYNC] Broken id_document_url for ${profile.first_name} ${profile.last_name}`);
          await supabase
            .from("profiles")
            .update({
              id_document_url: null,
              verification_documents_uploaded_at: null,
              verification_status: "pending",
            })
            .eq("id", profile.id);

          results.push({
            id: profile.id,
            name: `${profile.first_name} ${profile.last_name}`,
            field: "id_document_url",
            url: profile.id_document_url,
            status: "cleared",
          });
        }
      }

      // Check blue_card_document_url
      if (profile.blue_card_document_url) {
        const exists = await checkFileExists(supabase, profile.blue_card_document_url);
        if (!exists) {
          console.log(`[SYNC] Broken blue_card_document_url for ${profile.first_name} ${profile.last_name}`);
          await supabase
            .from("profiles")
            .update({ blue_card_document_url: null })
            .eq("id", profile.id);

          results.push({
            id: profile.id,
            name: `${profile.first_name} ${profile.last_name}`,
            field: "blue_card_document_url",
            url: profile.blue_card_document_url,
            status: "cleared",
          });
        }
      }
    }

    console.log(`[SYNC] Done. Fixed ${results.length} broken references.`);

    return new Response(
      JSON.stringify({
        success: true,
        profiles_checked: allProfiles.size,
        broken_references_fixed: results.length,
        details: results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[SYNC-VERIFICATION-DOCS] Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function checkFileExists(supabase: any, url: string): Promise<boolean> {
  try {
    // Extract file path from full URL
    const bucketName = "verification-docs";
    const parts = url.split(`/storage/v1/object/public/${bucketName}/`);
    if (parts.length < 2) return true; // Can't parse, assume exists

    const filePath = decodeURIComponent(parts[1]);

    // Try to get file metadata via download (head-like check)
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (error) {
      console.log(`[SYNC] File not found: ${filePath} - ${error.message}`);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
