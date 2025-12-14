import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OnboardingReminderRequest {
  sitterEmail: string;
  sitterName: string;
  profileUrl: string;
  reminderType: 'day1' | 'day3' | 'day7';
  missingSteps: string[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sitterEmail, sitterName, profileUrl, reminderType, missingSteps }: OnboardingReminderRequest = await req.json();
    
    console.log(`Sending ${reminderType} onboarding reminder to ${sitterEmail}`);

    let subject = '';
    let urgencyMessage = '';
    let ctaText = '';

    switch (reminderType) {
      case 'day1':
        subject = `${sitterName}, you're almost there! Complete your profile to start earning 💰`;
        urgencyMessage = "You started your profile yesterday - let's finish it today!";
        ctaText = "Finish My Profile";
        break;
      case 'day3':
        subject = `${sitterName}, pet owners are waiting! Complete your profile`;
        urgencyMessage = "Pet owners in your area are looking for sitters right now. Don't miss out on booking opportunities!";
        ctaText = "Complete Profile Now";
        break;
      case 'day7':
        subject = `${sitterName}, we miss you! Your profile is waiting`;
        urgencyMessage = "It's been a week since you signed up. We'd love to help you start earning as a pet sitter.";
        ctaText = "Reactivate My Profile";
        break;
    }

    const missingStepsHtml = missingSteps.length > 0 ? `
      <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
        <h3 style="color: #991b1b; margin: 0 0 10px 0; font-size: 16px;">📋 Still needed to go live:</h3>
        <ul style="color: #991b1b; margin: 0; padding-left: 20px; font-size: 14px;">
          ${missingSteps.map(step => `<li style="margin-bottom: 5px;">${step}</li>`).join('')}
        </ul>
      </div>
    ` : '';

    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <onboarding@resend.dev>",
      to: [sitterEmail],
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 26px;">Don't Miss Out! 🐾</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">${urgencyMessage}</p>
            </div>
            
            <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="font-size: 16px; color: #334155; line-height: 1.6;">Hi ${sitterName},</p>
              
              <p style="font-size: 16px; color: #334155; line-height: 1.6;">
                Your profile is so close to being complete! Once you finish the remaining steps, you'll be visible to pet owners and can start receiving booking requests.
              </p>

              ${missingStepsHtml}

              <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; margin: 25px 0;">
                <h3 style="color: #166534; margin: 0 0 10px 0; font-size: 16px;">💡 Why complete your profile?</h3>
                <ul style="color: #166534; margin: 0; padding-left: 20px; font-size: 14px;">
                  <li style="margin-bottom: 8px;">Get matched with pet owners in your area</li>
                  <li style="margin-bottom: 8px;">Set your own rates and schedule</li>
                  <li style="margin-bottom: 8px;">Earn money doing what you love</li>
                  <li style="margin-bottom: 0;">Build your reputation with reviews</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 35px 0;">
                <a href="${profileUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  ${ctaText} →
                </a>
              </div>

              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 12px; margin: 30px 0;">
                <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">⭐ Pro Tip: Get the Golden Badge</h3>
                <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
                  Sitters with a Golden Badge (police vetted) get <strong>3x more bookings</strong> on average. You can apply for verification after completing your profile!
                </p>
              </div>

              <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 25px;">
                <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin: 0;">
                  Need help? Reply to this email and we'll assist you with your profile setup.
                </p>
              </div>

              <p style="font-size: 16px; color: #334155; margin-top: 25px;">
                Looking forward to seeing you on ZiggySitters! 🐕<br><br>
                The ZiggySitters Team
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="font-size: 12px; color: #94a3b8;">
                © ${new Date().getFullYear()} ZiggySitters. All rights reserved.<br>
                <a href="https://ziggysitters.com" style="color: #94a3b8;">ziggysitters.com</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Onboarding reminder email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending onboarding reminder email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
