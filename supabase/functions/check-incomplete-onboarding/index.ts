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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log('[CHECK-INCOMPLETE] Starting check for incomplete onboarding profiles...');

    // Find profiles with incomplete onboarding
    // Updated at least 24 hours ago (to avoid spamming recent signups)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: incompleteProfiles, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, user_id, email, first_name, last_name, role, updated_at, avatar_url, bio, id_document_url, stripe_account_id, stripe_onboarding_completed')
      .eq('onboarding_completed', false)
      .not('email', 'is', null)
      .lt('updated_at', yesterday.toISOString());

    if (profileError) throw profileError;

    if (!incompleteProfiles || incompleteProfiles.length === 0) {
      console.log('[CHECK-INCOMPLETE] No incomplete profiles found');
      return new Response(
        JSON.stringify({ message: 'No incomplete profiles found', count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    console.log(`[CHECK-INCOMPLETE] Found ${incompleteProfiles.length} incomplete profiles`);

    // Send reminder emails for each incomplete profile
    const reminderPromises = incompleteProfiles.map(async (profile) => {
      try {
        // Calculate missing steps for the profile
        const missingSteps: string[] = [];
        if (!profile.avatar_url) missingSteps.push("Add a profile photo");
        if (!profile.bio) missingSteps.push("Write your bio");
        if (!profile.id_document_url) missingSteps.push("Upload ID for verification");
        if (!profile.stripe_account_id || !profile.stripe_onboarding_completed) {
          missingSteps.push("Set up Stripe for payments");
        }

        // Check if sitter has services set up
        const { data: services } = await supabaseClient
          .from('sitter_services')
          .select('id')
          .eq('sitter_id', profile.id)
          .eq('is_offered', true)
          .limit(1);

        if (!services || services.length === 0) {
          missingSteps.push("Set up your services and rates");
        }

        // Call send-onboarding-reminder with correct parameters
        const { error: emailError } = await supabaseClient.functions.invoke('send-onboarding-reminder', {
          body: {
            sitterEmail: profile.email,
            sitterName: profile.first_name || 'there',
            onboardingUrl: 'https://ziggysitters.com/onboarding'
          }
        });

        if (emailError) {
          console.error(`[CHECK-INCOMPLETE] Error sending reminder to ${profile.email}:`, emailError);
          return { email: profile.email, success: false, error: emailError.message };
        }

        console.log(`[CHECK-INCOMPLETE] Sent reminder to ${profile.email}`);
        return { email: profile.email, success: true };
      } catch (error: any) {
        console.error(`[CHECK-INCOMPLETE] Error processing ${profile.email}:`, error);
        return { email: profile.email, success: false, error: error.message };
      }
    });

    const results = await Promise.all(reminderPromises);

    const summary = {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };

    console.log('[CHECK-INCOMPLETE] Summary:', summary);

    return new Response(
      JSON.stringify({
        message: 'Reminder emails processed',
        summary,
        results
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("[CHECK-INCOMPLETE] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
