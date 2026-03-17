import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("🔵 young-walker-stripe-onboarding: Request received");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user?.email) {
      throw new Error("User not authenticated");
    }

    console.log("🟢 User authenticated:", user.id);

    // Check if user has a young walker registration
    const { data: youngWalker, error: ywError } = await supabaseClient
      .from("young_walkers")
      .select("id, parent_user_id, parent_name, parent_email")
      .eq("parent_user_id", user.id)
      .maybeSingle();

    if (ywError) {
      console.error("🔴 Young walker fetch error:", ywError);
      throw new Error("Failed to verify young walker registration");
    }

    if (!youngWalker) {
      throw new Error("You must first register your child as a young walker");
    }

    console.log("🔵 Young walker found for parent");

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("id, stripe_account_id, first_name, last_name, email")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      throw new Error("Profile not found");
    }

    console.log("🔵 Profile found:", profile.id);

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    let accountId = profile.stripe_account_id;

    // Create Stripe Connect account if none exists
    if (!accountId) {
      console.log("🔵 Creating new Stripe Connect account for parent:", profile.email);
      
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
          product_description: "Young dog walker - supervised dog walking services",
        },
        individual: {
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
        },
        settings: {
          payouts: {
            schedule: {
              interval: "manual",
            },
          },
        },
        metadata: {
          user_id: user.id,
          profile_id: profile.id,
          young_walker_id: youngWalker.id,
          is_young_walker_parent: "true",
        },
      });

      accountId = account.id;
      console.log("🟢 Stripe account created:", accountId);

      // Save account ID to profile
      await supabaseClient
        .from("profiles")
        .update({ 
          stripe_account_id: accountId,
          is_young_walker: true 
        })
        .eq("id", profile.id);

      console.log("🔵 Stripe account ID saved to profile");
    }

    // Create account link for onboarding
    const origin = req.headers.get("origin") || "https://ziggysitters.lovable.app";
    
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/young-walker-dashboard?stripe_refresh=true`,
      return_url: `${origin}/young-walker-dashboard?stripe_success=true`,
      type: "account_onboarding",
      collect: "eventually_due",
    });

    console.log("🟢 Account link created:", accountLink.url);

    return new Response(
      JSON.stringify({ url: accountLink.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("🔴 Error in young-walker-stripe-onboarding:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Stripe onboarding failed" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
