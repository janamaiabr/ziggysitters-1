import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
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
    console.log("Checking Stripe Connect account status");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("id, stripe_account_id, stripe_account_enabled, stripe_onboarding_completed")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Profile not found");
    }

    if (!profile.stripe_account_id) {
      return new Response(
        JSON.stringify({ 
          connected: false,
          enabled: false,
          onboarding_completed: false 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const account = await stripe.accounts.retrieve(profile.stripe_account_id);
    
    const enabled = account.charges_enabled && account.payouts_enabled;
    const onboardingCompleted = account.details_submitted;
    const payoutReady = account.requirements?.currently_due?.length === 0;

    console.log("Account status:", { 
      enabled, 
      onboardingCompleted, 
      payoutReady,
      currentlyDue: account.requirements?.currently_due 
    });

    // Update profile if status changed
    if (enabled !== profile.stripe_account_enabled || 
        onboardingCompleted !== profile.stripe_onboarding_completed) {
      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({
          stripe_account_enabled: enabled,
          stripe_onboarding_completed: onboardingCompleted,
        })
        .eq("id", profile.id);

      if (updateError) {
        console.error("Error updating profile:", updateError);
      }
    }

    return new Response(
      JSON.stringify({
        connected: true,
        enabled,
        onboarding_completed: onboardingCompleted,
        payout_ready: payoutReady,
        requirements_due: account.requirements?.currently_due || [],
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in stripe-connect-account-status:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
