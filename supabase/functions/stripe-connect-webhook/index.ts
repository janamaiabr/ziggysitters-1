import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  
  if (!signature) {
    return new Response(
      JSON.stringify({ error: "No signature provided" }),
      { status: 400 }
    );
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret || ""
    );

    console.log(`[STRIPE-WEBHOOK] Received event: ${event.type}`);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Handle account.updated event
    if (event.type === "account.updated") {
      const account = event.data.object as Stripe.Account;
      console.log(`[STRIPE-WEBHOOK] Account updated: ${account.id}`);

      const enabled = account.charges_enabled && account.payouts_enabled;
      const onboardingCompleted = account.details_submitted;
      const payoutReady = (account.requirements?.currently_due?.length || 0) === 0;

      console.log(`[STRIPE-WEBHOOK] Status - enabled: ${enabled}, onboarding: ${onboardingCompleted}, payout_ready: ${payoutReady}`);

      // Update the profile with the new status
      // If onboarding is completed, also mark profile onboarding as done IF all other requirements are met
      const updateData: any = {
        stripe_account_enabled: enabled,
        stripe_onboarding_completed: onboardingCompleted,
      };
      
      // Check if we should also complete profile onboarding
      if (onboardingCompleted) {
        // Fetch the profile to check other requirements
        const { data: profile, error: profileError } = await supabaseClient
          .from('profiles')
          .select('id, first_name, last_name, phone, address, suburb, id_document_url, blue_card_document_url, onboarding_completed')
          .eq('stripe_account_id', account.id)
          .maybeSingle();
        
        if (profileError) {
          console.error("[STRIPE-WEBHOOK] Error fetching profile:", profileError);
        }
          
        if (profile && !profile.onboarding_completed) {
          const hasBasicInfo = profile.first_name && profile.last_name && profile.phone && profile.address && profile.suburb;
          const hasDocuments = profile.id_document_url && profile.blue_card_document_url;
          
          // Check if sitter has services
          const { data: services } = await supabaseClient
            .from('sitter_services')
            .select('id')
            .eq('sitter_id', profile.id)
            .limit(1);
          
          const hasServices = services && services.length > 0;
          
          if (hasBasicInfo && hasDocuments && hasServices) {
            console.log('[STRIPE-WEBHOOK] All requirements met - completing onboarding');
            updateData.onboarding_completed = true;
          }
        }
      }

      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update(updateData)
        .eq("stripe_account_id", account.id);

      if (updateError) {
        console.error("[STRIPE-WEBHOOK] Error updating profile:", updateError);
      } else {
        console.log("[STRIPE-WEBHOOK] Profile updated successfully");
      }
    }

    // Handle account.external_account.created
    if (event.type === "account.external_account.created") {
      const account = event.account;
      console.log(`[STRIPE-WEBHOOK] External account created for: ${account}`);
    }

    // Handle account.application.authorized
    if (event.type === "account.application.authorized") {
      const account = event.account;
      console.log(`[STRIPE-WEBHOOK] Account application authorized: ${account}`);
    }

    // Handle account.application.deauthorized
    if (event.type === "account.application.deauthorized") {
      const account = event.account;
      console.log(`[STRIPE-WEBHOOK] Account application deauthorized: ${account}`);
      
      // Optionally disable the account in your database
      if (account) {
        const { error: updateError } = await supabaseClient
          .from("profiles")
          .update({
            stripe_account_enabled: false,
            stripe_onboarding_completed: false,
          })
          .eq("stripe_account_id", account);

        if (updateError) {
          console.error("[STRIPE-WEBHOOK] Error disabling account:", updateError);
        }
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200 }
    );
  } catch (error) {
    console.error("[STRIPE-WEBHOOK] Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 400 }
    );
  }
});
