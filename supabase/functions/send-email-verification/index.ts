import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  user_id: string;
  email: string;
  first_name: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, email, first_name }: VerificationRequest = await req.json();

    if (!user_id || !email) {
      throw new Error("Missing required fields: user_id and email");
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate verification token (6 digit code)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Get profile ID from user_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user_id)
      .maybeSingle();

    if (profileError || !profile) {
      throw new Error("Profile not found");
    }

    // Store verification token in database
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        email_verification_token: verificationCode,
        email_verification_sent_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (updateError) {
      console.error("Error storing verification token:", updateError);
      throw new Error("Failed to store verification token");
    }

    // Send verification email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 24px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">
                🐾 ZiggySitters
              </h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 32px 24px;">
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px;">
                Verify Your Email
              </h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Hi ${first_name || "there"}! Please use the code below to verify your email address and complete your account setup.
              </p>
              
              <!-- Verification Code -->
              <div style="background: #f3f4f6; border-radius: 8px; padding: 24px; text-align: center; margin: 0 0 24px 0;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
                  Your Verification Code
                </p>
                <div style="font-size: 36px; font-weight: 700; color: #6366f1; letter-spacing: 8px; font-family: monospace;">
                  ${verificationCode}
                </div>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                This code will expire in 24 hours. If you didn't create an account with ZiggySitters, you can safely ignore this email.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                <a href="https://ziggysitters.com" style="color: #6366f1; text-decoration: none;">ZiggySitters</a> | Auckland's trusted pet sitting platform
              </p>
            </div>
            
          </div>
        </body>
      </html>
    `;

    const { error: emailError } = await resend.emails.send({
      from: "ZiggySitters <hello@ziggysitters.com>",
      to: [email],
      subject: "Verify your email - ZiggySitters",
      html: emailHtml,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      throw new Error("Failed to send verification email");
    }

    console.log(`Verification email sent to ${email}`);

    return new Response(
      JSON.stringify({ success: true, message: "Verification email sent" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-email-verification:", error);
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
