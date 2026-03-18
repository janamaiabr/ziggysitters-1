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

    // Get sitters who completed onboarding but haven't set up Stripe
    const { data: sitters, error: sittersError } = await supabaseClient
      .from("profiles")
      .select("id, email, first_name, last_name")
      .eq("role", "pet_sitter")
      .eq("is_test_account", false)
      .eq("onboarding_completed", true)
      .or("stripe_account_enabled.is.null,stripe_account_enabled.eq.false");

    if (sittersError) {
      throw sittersError;
    }

    console.log(`Found ${sitters?.length || 0} sitters needing Stripe setup`);

    const emailResults = [];

    for (const sitter of sitters || []) {
      try {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
              .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
              .urgent-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
              .money-box { background: #f0fdf4; border: 2px solid #22c55e; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
              .button { display: inline-block; background: #f97316; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; }
              .steps { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>⏰ You're Missing Out on Bookings!</h1>
            </div>
            <div class="content">
              <p>Hi ${sitter.first_name},</p>
              
              <div class="urgent-box">
                <h3 style="margin-top: 0; color: #dc2626;">🚨 Your Profile is Incomplete</h3>
                <p><strong>Pet owners can see your profile but can't book you!</strong></p>
                <p>You haven't completed your payment setup, which means you're losing potential bookings right now.</p>
              </div>

              <div class="money-box">
                <h2 style="color: #16a34a; margin: 0;">💰 Start Earning Today</h2>
                <p style="margin: 10px 0 0 0;">Complete your Stripe setup to accept bookings and get paid directly to your bank account.</p>
              </div>

              <div class="steps">
                <h3>Quick 5-Minute Setup:</h3>
                <ol>
                  <li>Log into your Ziggy Sitters account</li>
                  <li>Go to <strong>Profile → Payments</strong></li>
                  <li>Click <strong>"Set Up Stripe"</strong></li>
                  <li>Enter your bank details (Stripe handles everything securely)</li>
                </ol>
              </div>

              <p style="text-align: center; margin: 30px 0;">
                <a href="https://www.ziggysitters.com/profile?tab=payments" class="button">Complete Payment Setup →</a>
              </p>

              <p><strong>Christmas is coming!</strong> Pet owners are actively looking for sitters right now. Don't miss out on these bookings!</p>

              <p>Questions? Just reply to this email.</p>

              <p>Cheers,<br><strong>The Ziggy Sitters Team</strong></p>

              <div class="footer">
                <p>You're receiving this because you signed up as a pet sitter on Ziggy Sitters.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        await resend.emails.send({
          from: "Ziggy Sitters <hello@ziggysitters.com>",
          to: [sitter.email],
          subject: "⏰ You're missing bookings - Complete your payment setup (2 mins)",
          html: emailHtml,
        });

        emailResults.push({
          sitter_id: sitter.id,
          email: sitter.email,
          name: `${sitter.first_name} ${sitter.last_name}`,
          status: "sent",
        });

        console.log(`Reminder sent to ${sitter.email}`);
      } catch (emailError) {
        console.error(`Failed to send to ${sitter.email}:`, emailError);
        emailResults.push({
          sitter_id: sitter.id,
          email: sitter.email,
          name: `${sitter.first_name} ${sitter.last_name}`,
          status: "failed",
          error: (emailError as Error).message,
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
    console.error("Error sending Stripe reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
