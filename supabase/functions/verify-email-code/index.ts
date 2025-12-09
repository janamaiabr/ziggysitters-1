import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyRequest {
  user_id: string;
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, code }: VerifyRequest = await req.json();

    if (!user_id || !code) {
      throw new Error("Missing required fields: user_id and code");
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get profile with verification token
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email_verification_token, email_verification_sent_at")
      .eq("user_id", user_id)
      .single();

    if (profileError || !profile) {
      throw new Error("Profile not found");
    }

    // Check if token matches
    if (profile.email_verification_token !== code) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid verification code" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if token is expired (24 hours)
    const sentAt = new Date(profile.email_verification_sent_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - sentAt.getTime()) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      return new Response(
        JSON.stringify({ success: false, error: "Verification code has expired. Please request a new one." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Mark email as verified
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        email_verified: true,
        email_verification_token: null, // Clear the token
      })
      .eq("id", profile.id);

    if (updateError) {
      console.error("Error updating verification status:", updateError);
      throw new Error("Failed to verify email");
    }

    console.log(`Email verified for user ${user_id}`);

    return new Response(
      JSON.stringify({ success: true, message: "Email verified successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in verify-email-code:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
