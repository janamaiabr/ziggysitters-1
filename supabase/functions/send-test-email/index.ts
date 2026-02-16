import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  to: string;
  subject?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject = "ZiggySitters Email Deliverability Test" }: TestEmailRequest = await req.json();

    console.log(`[TEST-EMAIL] Sending test email to: ${to}`);

    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <noreply@ziggysitters.com>",
      to: [to],
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">ZiggySitters</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Email Deliverability Test</p>
          </div>
          
          <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">Test Email from ZiggySitters</h2>
            
            <p style="color: #4b5563; margin: 20px 0;">
              This is a test email to verify email deliverability and spam scoring for ZiggySitters platform.
            </p>
            
            <div style="background: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0;">
              <h3 style="margin-top: 0; color: #374151; font-size: 16px;">Email Configuration Details:</h3>
              <ul style="color: #6b7280; padding-left: 20px;">
                <li>From: noreply@ziggysitters.com</li>
                <li>Service: Resend Email API</li>
                <li>Platform: ZiggySitters Pet Care Platform</li>
                <li>Purpose: Deliverability Testing</li>
              </ul>
            </div>
            
            <p style="color: #4b5563; margin: 20px 0;">
              If you're seeing this email, it means our email infrastructure is working correctly. This test helps us ensure reliable communication with pet owners and sitters.
            </p>
            
            <div style="text-align: center; margin: 40px 0 20px 0;">
              <a href="https://ziggysitters.com" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Visit ZiggySitters
              </a>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 14px;">
            <p style="margin: 5px 0;">ZiggySitters - Trusted Pet Care in New Zealand</p>
            <p style="margin: 5px 0;">
              <a href="https://ziggysitters.com" style="color: #667eea; text-decoration: none;">www.ziggysitters.com</a>
            </p>
            <p style="margin: 15px 0 5px 0; font-size: 12px;">
              This is a test email. If you received this in error, please disregard.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("[TEST-EMAIL] Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Test email sent to ${to}`,
        messageId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("[TEST-EMAIL] Error sending test email:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
