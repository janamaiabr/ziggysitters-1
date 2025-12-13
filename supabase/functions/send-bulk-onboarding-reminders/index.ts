import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: adminCheck } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!adminCheck) {
      throw new Error("Admin access required");
    }

    console.log("Admin verified, fetching incomplete sitters...");

    // Get all sitters who haven't completed onboarding
    const { data: incompleteSitters, error: sittersError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, created_at, onboarding_completed, last_onboarding_reminder_at')
      .eq('role', 'pet_sitter')
      .eq('onboarding_completed', false)
      .order('created_at', { ascending: false });

    if (sittersError) {
      throw sittersError;
    }

    console.log(`Found ${incompleteSitters?.length || 0} incomplete sitters`);

    const results: any[] = [];
    const now = new Date();

    for (const sitter of incompleteSitters || []) {
      // Skip if reminded in last 24 hours
      if (sitter.last_onboarding_reminder_at) {
        const lastReminder = new Date(sitter.last_onboarding_reminder_at);
        const hoursSinceReminder = (now.getTime() - lastReminder.getTime()) / (1000 * 60 * 60);
        if (hoursSinceReminder < 24) {
          results.push({
            email: sitter.email,
            status: 'skipped',
            reason: 'Already reminded within 24 hours'
          });
          continue;
        }
      }

      // Determine reminder type based on days since signup
      const createdAt = new Date(sitter.created_at);
      const daysSinceSignup = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      
      let reminderType: 'day1' | 'day3' | 'day7' = 'day1';
      if (daysSinceSignup >= 7) {
        reminderType = 'day7';
      } else if (daysSinceSignup >= 3) {
        reminderType = 'day3';
      }

      // Check what's missing for this sitter
      const missingSteps: string[] = [];
      
      // Check for services
      const { data: services } = await supabase
        .from('sitter_services')
        .select('id')
        .eq('sitter_id', sitter.id);
      
      if (!services || services.length === 0) {
        missingSteps.push('Add at least one service with pricing');
      }

      // Check Stripe
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_account_enabled, id_document_urls')
        .eq('id', sitter.id)
        .single();

      if (!profile?.stripe_account_enabled) {
        missingSteps.push('Connect your bank account via Stripe');
      }

      if (!profile?.id_document_urls || profile.id_document_urls.length === 0) {
        missingSteps.push('Upload ID verification document');
      }

      // Send the reminder email
      try {
        const { error: emailError } = await supabase.functions.invoke('send-sitter-onboarding-reminder', {
          body: {
            sitterEmail: sitter.email,
            sitterName: sitter.first_name,
            profileUrl: `https://ziggysitters.com/onboarding`,
            reminderType,
            missingSteps
          }
        });

        if (emailError) {
          results.push({
            email: sitter.email,
            status: 'error',
            error: emailError.message
          });
        } else {
          // Update last reminder timestamp
          await supabase
            .from('profiles')
            .update({ last_onboarding_reminder_at: now.toISOString() })
            .eq('id', sitter.id);

          results.push({
            email: sitter.email,
            status: 'sent',
            reminderType,
            missingSteps
          });
        }
      } catch (e: any) {
        results.push({
          email: sitter.email,
          status: 'error',
          error: e.message
        });
      }
    }

    const sent = results.filter(r => r.status === 'sent').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    const errors = results.filter(r => r.status === 'error').length;

    console.log(`Bulk reminders complete: ${sent} sent, ${skipped} skipped, ${errors} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        summary: { total: results.length, sent, skipped, errors },
        results
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in bulk onboarding reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
