import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate admin user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Verify admin role
    const { data: roles } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (roles?.role !== "admin") {
      throw new Error("Admin access required");
    }

    // Get all verified sitters
    const { data: sitters, error: sittersError } = await supabaseClient
      .from("profiles")
      .select("id, email, first_name, last_name, stripe_account_id, stripe_account_enabled")
      .eq("role", "pet_sitter")
      .eq("is_verified", true);

    if (sittersError) {
      throw sittersError;
    }

    console.log(`Found ${sitters?.length || 0} verified sitters`);

    // Check which sitters need re-onboarding
    const isLiveMode = Deno.env.get("VITE_STRIPE_PUBLISHABLE_KEY")?.startsWith("pk_live_");
    
    if (!isLiveMode) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "System is not in live mode - no emails sent" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailResults = [];

    for (const sitter of sitters || []) {
      // Send email if sitter needs re-onboarding (not connected or not enabled)
      const needsReonboarding = !sitter.stripe_account_id || !sitter.stripe_account_enabled;

      if (needsReonboarding) {
        try {
          const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #f97316; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background-color: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
                .warning-box { background-color: #fff7ed; border-left: 4px solid #f97316; padding: 15px; margin: 20px 0; }
                .steps { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .steps ol { margin: 10px 0; padding-left: 20px; }
                .steps li { margin: 10px 0; }
                .button { display: inline-block; background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
                .important { font-weight: bold; color: #dc2626; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🚀 Ziggy Sitters is Going LIVE!</h1>
                </div>
                <div class="content">
                  <p>Hi ${sitter.first_name || "there"},</p>
                  
                  <p>Great news! Ziggy Sitters is officially launching with <strong>real payments</strong> starting today.</p>
                  
                  <div class="warning-box">
                    <h3 style="margin-top: 0; color: #f97316;">⚠️ ACTION REQUIRED: Stripe Re-onboarding</h3>
                    <p>To continue accepting bookings and receiving payouts, you must complete Stripe Connect onboarding in <strong>LIVE mode</strong>.</p>
                    <p class="important">Until you complete this step, you cannot accept new bookings.</p>
                  </div>

                  <div class="steps">
                    <h3>What You Need to Do:</h3>
                    <ol>
                      <li><strong>Log into your profile</strong> at Ziggy Sitters</li>
                      <li>You'll see a <strong>red banner</strong> at the top of your profile</li>
                      <li>Click <strong>"Set Up Stripe Now"</strong></li>
                      <li>Complete the Stripe Connect verification process with your bank details</li>
                      <li>Wait <strong>1-2 business days</strong> for Stripe to verify your account</li>
                    </ol>
                  </div>

                  <p style="text-align: center;">
                    <a href="https://www.ziggysitters.com/profile?tab=payments" class="button">Go to Payment Setup</a>
                  </p>

                  <h3>Why This Is Necessary:</h3>
                  <p>Previously, the platform was in test mode with simulated payments. Now that we're processing real money, Stripe requires all sitters to complete their live verification. This is a one-time process that ensures secure payouts to your bank account.</p>

                  <h3>What Happens After Verification:</h3>
                  <ul>
                    <li>✅ You can accept new bookings immediately</li>
                    <li>✅ Receive real payouts directly to your bank account</li>
                    <li>✅ Track all transactions in your profile</li>
                  </ul>

                  <p><strong>Need Help?</strong> If you have any questions or run into issues, please contact our support team.</p>

                  <p>Thank you for being part of Ziggy Sitters!</p>

                  <p>Best regards,<br>
                  <strong>The Ziggy Sitters Team</strong></p>

                  <div class="footer">
                    <p>This is an important account notification from Ziggy Sitters.</p>
                    <p>Please do not reply to this email. For support, contact us through the platform.</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `;

          await resend.emails.send({
            from: "ZiggySitters <onboarding@ziggysitters.com>",
            to: [sitter.email],
            subject: "🚀 ACTION REQUIRED: Complete Stripe Setup for Live Payments",
            headers: {
              'List-Unsubscribe': `<mailto:unsubscribe@ziggysitters.com?subject=Unsubscribe>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            },
            html: emailHtml,
          });

          emailResults.push({
            sitter_id: sitter.id,
            email: sitter.email,
            name: `${sitter.first_name} ${sitter.last_name}`,
            status: "sent",
          });

          console.log(`Email sent to ${sitter.email}`);
        } catch (emailError) {
          console.error(`Failed to send email to ${sitter.email}:`, emailError);
          emailResults.push({
            sitter_id: sitter.id,
            email: sitter.email,
            name: `${sitter.first_name} ${sitter.last_name}`,
            status: "failed",
            error: emailError.message,
          });
        }
      } else {
        emailResults.push({
          sitter_id: sitter.id,
          email: sitter.email,
          name: `${sitter.first_name} ${sitter.last_name}`,
          status: "skipped - already onboarded",
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total_sitters: sitters?.length || 0,
        emails_sent: emailResults.filter(r => r.status === "sent").length,
        results: emailResults,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending re-onboarding notifications:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
