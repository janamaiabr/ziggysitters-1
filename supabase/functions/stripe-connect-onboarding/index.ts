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
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    console.log("Environment check - SUPABASE_URL exists:", !!supabaseUrl);
    console.log("Environment check - SERVICE_ROLE_KEY exists:", !!serviceRoleKey);
    
    const supabaseClient = createClient(
      supabaseUrl ?? "",
      serviceRoleKey ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    console.log("Auth header exists:", !!authHeader);
    
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }
    
    const token = authHeader.replace("Bearer ", "");
    console.log("Attempting to get user with token...");
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError) {
      console.error("Auth error:", authError);
      throw new Error(`Authentication failed: ${authError.message}`);
    }
    
    if (!user?.email) {
      console.error("User not found or no email");
      throw new Error("User not authenticated or email not available");
    }

    console.log("User authenticated:", user.id, "Email:", user.email);

    // Get user profile
    console.log("Fetching profile for user_id:", user.id);
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("id, stripe_account_id, role, first_name, last_name, email")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      console.error("Profile error:", profileError);
      throw new Error(`Profile fetch failed: ${profileError.message}`);
    }
    
    if (!profile) {
      console.error("No profile found for user");
      throw new Error("Profile not found");
    }

    console.log("Profile found:", profile.id, "Role:", profile.role);

    if (profile.role !== "pet_sitter") {
      console.error("User is not a pet sitter, role:", profile.role);
      throw new Error("Only pet sitters can connect Stripe accounts");
    }

    console.log("Profile validation passed");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    console.log("Stripe key exists:", !!stripeKey);
    
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    let accountId = profile.stripe_account_id;
    console.log("Existing Stripe account ID:", accountId || "None");

    // Create or retrieve Stripe Connect account
    if (!accountId) {
      console.log("Creating new Stripe Connect account for:", profile.email);
      try {
      const account = await stripe.accounts.create({
        type: "express",
        country: "NZ",
        email: profile.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
        business_profile: {
          mcc: "7299", // Pet care services
          product_description: "Pet sitting and care services",
        },
        individual: {
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
        },
        settings: {
          payouts: {
            schedule: {
              interval: "manual", // Manual payouts for better control
            },
          },
        },
      });

        accountId = account.id;
        console.log("Stripe account created successfully:", accountId);

        // Save account ID to profile
        console.log("Saving Stripe account ID to profile...");
        const { error: updateError } = await supabaseClient
          .from("profiles")
          .update({ stripe_account_id: accountId })
          .eq("id", profile.id);

        if (updateError) {
          console.error("Error saving Stripe account ID:", updateError);
          throw new Error(`Failed to save Stripe account: ${updateError.message}`);
        }

        console.log("Stripe account ID saved to profile");
      } catch (stripeError: any) {
        console.error("Stripe account creation error:", stripeError);
        throw new Error(`Stripe account creation failed: ${stripeError.message || JSON.stringify(stripeError)}`);
      }
    }

    // Create account link for onboarding
    const origin = req.headers.get("origin") || "http://localhost:3000";
    console.log("Creating account link with origin:", origin);
    
    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${origin}/onboarding?stripe_refresh=true`,
        return_url: `${origin}/onboarding?stripe_success=true`,
        type: "account_onboarding",
        collect: "eventually_due", // Collect all required information upfront
      });

      console.log("Account link created successfully:", accountLink.url);

      return new Response(
        JSON.stringify({ url: accountLink.url }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (linkError: any) {
      console.error("Account link creation error:", linkError);
      throw new Error(`Failed to create account link: ${linkError.message || JSON.stringify(linkError)}`);
    }
  } catch (error: any) {
    console.error("Error in stripe-connect-onboarding:", error);
    const errorMessage = error.message || "Unknown error occurred";
    console.error("Returning error to client:", errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
