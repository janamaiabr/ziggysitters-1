import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    
    console.log("Checking sitter onboarding status at:", now.toISOString());

    // Get all pet sitters who haven't completed onboarding
    // AND haven't received a reminder today
    const { data: incompleteSitters, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email, first_name, created_at, onboarding_completed, avatar_url, bio, id_document_url, stripe_account_id, stripe_onboarding_completed, last_onboarding_reminder_at')
      .eq('role', 'pet_sitter')
      .eq('is_test_account', false)
      .or('onboarding_completed.is.null,onboarding_completed.eq.false')
      .or(`last_onboarding_reminder_at.is.null,last_onboarding_reminder_at.lt.${todayStart}`);

    if (fetchError) {
      console.error("Error fetching incomplete sitters:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${incompleteSitters?.length || 0} sitters eligible for reminders`);

    const results = {
      day1Reminders: 0,
      day3Reminders: 0,
      day7Reminders: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const sitter of incompleteSitters || []) {
      const createdAt = new Date(sitter.created_at);
      const daysSinceSignup = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      
      // Determine which reminder to send based on days since signup
      let reminderType: 'day1' | 'day3' | 'day7' | null = null;
      
      if (daysSinceSignup === 1) {
        reminderType = 'day1';
      } else if (daysSinceSignup === 3) {
        reminderType = 'day3';
      } else if (daysSinceSignup === 7) {
        reminderType = 'day7';
      }

      if (!reminderType) {
        results.skipped++;
        continue; // Skip if not a reminder day
      }

      // Calculate missing steps
      const missingSteps: string[] = [];
      if (!sitter.avatar_url) missingSteps.push("Add a profile photo");
      if (!sitter.bio) missingSteps.push("Write your bio");
      if (!sitter.id_document_url) missingSteps.push("Upload ID for verification");
      if (!sitter.stripe_account_id || !sitter.stripe_onboarding_completed) {
        missingSteps.push("Set up Stripe for payments");
      }

      // Check if sitter has services set up
      const { data: services } = await supabase
        .from('sitter_services')
        .select('id')
        .eq('sitter_id', sitter.id)
        .eq('is_offered', true)
        .limit(1);

      if (!services || services.length === 0) {
        missingSteps.push("Set up your services and rates");
      }

      // Send the reminder email
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/send-sitter-onboarding-reminder`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            sitterEmail: sitter.email,
            sitterName: sitter.first_name || 'there',
            profileUrl: 'https://ziggysitters.co.nz/profile',
            reminderType,
            missingSteps,
          }),
        });

        if (response.ok) {
          // Update last reminder timestamp to prevent duplicates
          await supabase
            .from('profiles')
            .update({ last_onboarding_reminder_at: now.toISOString() })
            .eq('id', sitter.id);

          if (reminderType === 'day1') results.day1Reminders++;
          if (reminderType === 'day3') results.day3Reminders++;
          if (reminderType === 'day7') results.day7Reminders++;
          console.log(`Sent ${reminderType} reminder to ${sitter.email}`);
        } else {
          const errorText = await response.text();
          console.error(`Failed to send reminder to ${sitter.email}:`, errorText);
          results.errors.push(`${sitter.email}: ${errorText}`);
        }
      } catch (emailError: any) {
        console.error(`Error sending reminder to ${sitter.email}:`, emailError);
        results.errors.push(`${sitter.email}: ${emailError.message}`);
      }
    }

    console.log("Onboarding check complete:", results);

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in check-sitter-onboarding-status:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
