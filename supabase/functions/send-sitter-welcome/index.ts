import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SitterWelcomeRequest {
  sitterEmail: string;
  sitterName: string;
  profileUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sitterEmail, sitterName, profileUrl }: SitterWelcomeRequest = await req.json();
    
    console.log(`Sending sitter welcome email to ${sitterEmail}`);

    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <hello@ziggysitters.com>",
      to: [sitterEmail],
      subject: `Welcome to ZiggySitters, ${sitterName}! 🐾 Let's get you started`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ZiggySitters! 🎉</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">We're thrilled to have you join our community of pet lovers</p>
            </div>
            
            <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="font-size: 16px; color: #334155; line-height: 1.6;">Hi ${sitterName},</p>
              
              <p style="font-size: 16px; color: #334155; line-height: 1.6;">
                Thank you for signing up to become a pet sitter with ZiggySitters! We connect trusted pet lovers like you with families who need reliable care for their furry friends.
              </p>

              <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <h3 style="color: #166534; margin: 0 0 10px 0; font-size: 16px;">📋 Complete Your Profile to Start Earning</h3>
                <p style="color: #166534; margin: 0; font-size: 14px;">
                  To start receiving booking requests, you'll need to complete a few quick steps.
                </p>
              </div>

              <h3 style="color: #1e293b; font-size: 18px; margin: 30px 0 15px 0;">Your Getting Started Checklist:</h3>
              
              <div style="margin: 20px 0;">
                <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
                  <span style="background: #8B5CF6; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0;">1</span>
                  <div>
                    <strong style="color: #1e293b;">Add a friendly profile photo</strong>
                    <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Pet owners love seeing who'll be caring for their pets!</p>
                  </div>
                </div>
                
                <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
                  <span style="background: #8B5CF6; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0;">2</span>
                  <div>
                    <strong style="color: #1e293b;">Write your bio</strong>
                    <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Tell pet owners about your experience and love for animals.</p>
                  </div>
                </div>
                
                <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
                  <span style="background: #8B5CF6; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0;">3</span>
                  <div>
                    <strong style="color: #1e293b;">Set your services & rates</strong>
                    <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Choose what services you offer and set competitive rates.</p>
                  </div>
                </div>
                
                <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
                  <span style="background: #8B5CF6; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0;">4</span>
                  <div>
                    <strong style="color: #1e293b;">Upload your ID for verification</strong>
                    <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">This helps build trust with pet owners. Your ID is kept secure.</p>
                  </div>
                </div>
                
                <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
                  <span style="background: #8B5CF6; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0;">5</span>
                  <div>
                    <strong style="color: #1e293b;">Set up Stripe for payments (optional for now)</strong>
                    <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">
                      Connect your bank account to receive payments. <strong>You can skip this step</strong> and complete it later when you receive your first booking request.
                    </p>
                  </div>
                </div>
              </div>

              <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid #93c5fd;">
                <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">🔐 About Stripe - Bank-Level Security</h3>
                <p style="color: #1e3a8a; margin: 0; font-size: 14px; line-height: 1.6;">
                  We use <strong>Stripe</strong> for all payments - the same secure payment processor trusted by Uber, Shopify, and Amazon. 
                  Your bank details are encrypted and stored by Stripe directly - <strong>ZiggySitters never sees your banking information</strong>. 
                  Stripe is PCI DSS Level 1 certified, the highest level of security certification.
                </p>
              </div>

              <div style="text-align: center; margin: 35px 0;">
                <a href="${profileUrl}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Complete My Profile →
                </a>
              </div>

              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 12px; margin: 30px 0;">
                <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">⭐ Unlock the Golden Badge</h3>
                <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
                  Top sitters can earn our <strong>Golden Badge</strong> by completing a police vetting check. Golden Badge sitters get more bookings and can charge higher rates!
                </p>
              </div>

              <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 25px;">
                <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin: 0;">
                  <strong>Questions?</strong> Simply reply to this email or contact us at hello@ziggysitters.com
                </p>
              </div>

              <p style="font-size: 16px; color: #334155; margin-top: 25px;">
                We can't wait to see you caring for pets! 🐕🐈<br><br>
                Warm regards,<br>
                <strong>The ZiggySitters Team</strong>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="font-size: 12px; color: #94a3b8;">
                © ${new Date().getFullYear()} ZiggySitters. All rights reserved.<br>
                Auckland, New Zealand
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Sitter welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending sitter welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
