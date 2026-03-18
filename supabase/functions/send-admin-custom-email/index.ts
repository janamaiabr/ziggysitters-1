import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CustomEmailRequest {
  recipient_email: string;
  recipient_name: string;
  subject: string;
  message: string;
  admin_name: string;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      recipient_email,
      recipient_name,
      subject,
      message,
      admin_name
    }: CustomEmailRequest = await req.json();

    console.log("Sending custom admin email to:", recipient_email);

    const emailResponse = await resend.emails.send({
      from: "ZiggySitters Admin <onboarding@ziggysitters.com>",
      to: [recipient_email],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">ZiggySitters</h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Hi ${recipient_name},
            </p>
            
            <div style="color: #374151; font-size: 15px; line-height: 1.8; margin-bottom: 30px; white-space: pre-wrap;">
${message}
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
              Best regards,<br>
              <strong>${admin_name}</strong><br>
              ZiggySitters Admin Team
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              <a href="https://ziggysitters.com" style="color: #667eea; text-decoration: none;">ZiggySitters</a> - 
              New Zealand's Trusted Pet Sitting Platform
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
              <a href="https://ziggysitters.com/profile?tab=email-preferences" style="color: #667eea; text-decoration: none;">Manage Email Preferences</a>
            </p>
          </div>
        </div>
      `,
    });

    console.log("Custom admin email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending custom admin email:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
