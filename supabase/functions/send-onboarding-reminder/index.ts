import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OnboardingReminderRequest {
  user_id?: string; // Optional - if not provided, sends to all incomplete users
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { user_id }: OnboardingReminderRequest = await req.json();

    // Query for users with incomplete onboarding
    let query = supabaseClient
      .from('profiles')
      .select('user_id, email, first_name, last_name, role, id, stripe_account_enabled, stripe_onboarding_completed, id_document_url, blue_card_document_url')
      .eq('onboarding_completed', false)
      .not('email', 'is', null);

    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    const { data: incompleteProfiles, error: profileError } = await query;

    if (profileError) throw profileError;

    if (!incompleteProfiles || incompleteProfiles.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No incomplete profiles found' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const emailResults = [];

    for (const profile of incompleteProfiles) {
      try {
        // Check what's missing for sitters
        let missingItems: string[] = [];
        
        if (profile.role === 'pet_sitter') {
          // Check for services
          const { data: services } = await supabaseClient
            .from('sitter_services')
            .select('id')
            .eq('sitter_id', profile.id)
            .limit(1);

          if (!services || services.length === 0) {
            missingItems.push('service offerings and pricing');
          }

          if (!profile.id_document_url && !profile.blue_card_document_url) {
            missingItems.push('verification documents (ID and/or Police Vet Check)');
          }

          if (!profile.stripe_account_enabled || !profile.stripe_onboarding_completed) {
            missingItems.push('payment account setup (Stripe Connect)');
          }
        }

        const missingItemsText = missingItems.length > 0
          ? `<p><strong>Still needed to complete your profile:</strong></p><ul style="padding-left: 20px;">${missingItems.map(item => `<li>${item}</li>`).join('')}</ul>`
          : '<p>Just a few more steps to complete your profile!</p>';

        const roleSpecificMessage = profile.role === 'pet_sitter'
          ? `<p>Complete your sitter profile to start accepting bookings and earning money! Once your profile is complete and verified, you'll be visible to pet owners in your area.</p>${missingItemsText}`
          : `<p>Complete your profile to start booking trusted sitters for your pets!</p>`;

        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
                .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
                .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">🐾 Complete Your ZiggySitters Profile</h1>
                </div>
                <div class="content">
                  <p>Hi ${profile.first_name || 'there'},</p>
                  
                  <p>We noticed you haven't finished setting up your ZiggySitters profile yet. We'd love to help you complete it!</p>
                  
                  ${roleSpecificMessage}

                  <div class="warning-box">
                    <p style="margin: 0;"><strong>⚠️ Safety Reminder:</strong> Never contact anyone outside of the ZiggySitters platform. All communication should happen through our secure messaging system to protect your safety and security.</p>
                  </div>

                  <div style="text-align: center;">
                    <a href="https://ziggysitters.com/onboarding" class="button">Complete My Profile</a>
                  </div>

                  <p>If you need any help or have questions, feel free to reply to this email or contact our support team.</p>

                  <p>Thanks for choosing ZiggySitters!</p>
                  
                  <p style="margin-top: 30px;">Best regards,<br>The ZiggySitters Team</p>
                </div>
                <div class="footer">
                  <p>© 2025 ZiggySitters. All rights reserved.</p>
                  <p>This is an automated reminder. If you've already completed your profile, please disregard this message.</p>
                </div>
              </div>
            </body>
          </html>
        `;

        const { data: emailData, error: emailError } = await resend.emails.send({
          from: "ZiggySitters <onboarding@ziggysitters.com>",
          to: [profile.email],
          subject: "Complete Your ZiggySitters Profile 🐾",
          html: emailHtml,
        });

        if (emailError) {
          console.error(`Error sending email to ${profile.email}:`, emailError);
          emailResults.push({ email: profile.email, success: false, error: emailError.message });
        } else {
          console.log(`Email sent successfully to ${profile.email}`);
          emailResults.push({ email: profile.email, success: true, emailId: emailData?.id });
        }
      } catch (error: any) {
        console.error(`Error processing profile ${profile.email}:`, error);
        emailResults.push({ email: profile.email, success: false, error: error.message });
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${incompleteProfiles.length} profiles`,
        results: emailResults,
        summary: {
          total: emailResults.length,
          successful: emailResults.filter(r => r.success).length,
          failed: emailResults.filter(r => !r.success).length
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("Error in send-onboarding-reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
