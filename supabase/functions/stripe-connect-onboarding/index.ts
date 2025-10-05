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
    console.log("Starting Stripe Connect onboarding process");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    
    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    console.log("User authenticated:", user.id);

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("id, stripe_account_id, role, first_name, last_name, email")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Profile not found");
    }

    if (profile.role !== "pet_sitter") {
      throw new Error("Only pet sitters can connect Stripe accounts");
    }

    console.log("Profile found:", profile.id);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    let accountId = profile.stripe_account_id;

    // Create or retrieve Stripe Connect account
    if (!accountId) {
      console.log("Creating new Stripe Connect account");
      const account = await stripe.accounts.create({
        type: "express",
        country: "NZ",
        email: profile.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
        individual: {
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
        },
      });

      accountId = account.id;

      // Save account ID to profile
      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({ stripe_account_id: accountId })
        .eq("id", profile.id);

      if (updateError) {
        console.error("Error saving Stripe account ID:", updateError);
        throw updateError;
      }

      console.log("Stripe account created:", accountId);
    }

    // Create account link for onboarding
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/profile?stripe_refresh=true`,
      return_url: `${origin}/profile?stripe_success=true`,
      type: "account_onboarding",
    });

    console.log("Account link created");

    return new Response(
      JSON.stringify({ url: accountLink.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in stripe-connect-onboarding:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
