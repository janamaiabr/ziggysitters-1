import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, emailType } = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    console.log(`[TEST-SITTER-EMAIL] Sending ${emailType} email to:`, email);

    let emailHtml = "";
    let subject = "";

    switch (emailType) {
      case "stripe-reonboarding":
        subject = "🚀 ACTION REQUIRED: Complete Stripe Setup for Live Payments";
        emailHtml = `
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
                <p>Hi there,</p>
                
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
        break;

      case "onboarding-reminder":
        subject = "🐾 Your Pet Sitting Journey Awaits - Complete Your Profile!";
        emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 40px 30px;
                  border-radius: 10px 10px 0 0;
                  text-align: center;
                }
                .header h1 {
                  margin: 0;
                  font-size: 28px;
                  font-weight: 700;
                }
                .header p {
                  margin: 10px 0 0 0;
                  opacity: 0.95;
                  font-size: 16px;
                }
                .content {
                  background: #ffffff;
                  padding: 40px 30px;
                  border-left: 1px solid #e0e0e0;
                  border-right: 1px solid #e0e0e0;
                }
                .greeting {
                  font-size: 18px;
                  margin-bottom: 20px;
                  color: #667eea;
                  font-weight: 600;
                }
                .message {
                  margin-bottom: 25px;
                  color: #555;
                }
                .benefits {
                  background: #f8f9ff;
                  padding: 25px;
                  border-radius: 8px;
                  margin: 25px 0;
                  border-left: 4px solid #667eea;
                }
                .benefits h3 {
                  margin-top: 0;
                  color: #667eea;
                  font-size: 18px;
                }
                .benefits ul {
                  margin: 15px 0;
                  padding-left: 20px;
                }
                .benefits li {
                  margin: 8px 0;
                  color: #555;
                }
                .cta-button {
                  display: inline-block;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 16px 40px;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: 600;
                  font-size: 16px;
                  margin: 20px 0;
                  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }
                .steps {
                  background: #fff;
                  padding: 20px;
                  border-radius: 8px;
                  margin: 20px 0;
                }
                .step {
                  display: flex;
                  align-items: start;
                  margin: 15px 0;
                }
                .step-number {
                  background: #667eea;
                  color: white;
                  width: 30px;
                  height: 30px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: bold;
                  margin-right: 15px;
                  flex-shrink: 0;
                  padding-top: 2px;
                }
                .footer {
                  background: #f8f9fa;
                  padding: 30px;
                  text-align: center;
                  color: #666;
                  font-size: 14px;
                  border-radius: 0 0 10px 10px;
                  border: 1px solid #e0e0e0;
                }
                .urgency {
                  background: #fff3cd;
                  border: 1px solid #ffc107;
                  padding: 15px;
                  border-radius: 6px;
                  margin: 20px 0;
                  text-align: center;
                  font-weight: 600;
                  color: #856404;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>🐾 Welcome to Ziggy Sitters!</h1>
                <p>You're just a few steps away from joining New Zealand's trusted pet sitting community</p>
              </div>
              
              <div class="content">
                <div class="greeting">Hi there! 👋</div>
                
                <div class="message">
                  <p>Thank you for starting your journey with Ziggy Sitters! We noticed your profile is almost complete, and we're excited to help you get started.</p>
                  
                  <p>Pet owners across New Zealand are looking for caring, reliable sitters like you right now. Complete your profile and start earning while doing what you love - caring for pets!</p>
                </div>

                <div class="benefits">
                  <h3>✨ What You'll Gain:</h3>
                  <ul>
                    <li><strong>Flexible Schedule:</strong> Work when you want, where you want</li>
                    <li><strong>Secure Payments:</strong> Get paid directly to your bank account</li>
                    <li><strong>Trusted Platform:</strong> Verified bookings with real pet owners</li>
                    <li><strong>Growing Demand:</strong> Join during our launch phase and build your client base</li>
                    <li><strong>Make a Difference:</strong> Give pet owners peace of mind while they're away</li>
                  </ul>
                </div>

                <div class="urgency">
                  ⏰ Complete your profile today to be ready for our platform launch!
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://www.ziggysitters.com/onboarding" class="cta-button">
                    Complete My Profile Now →
                  </a>
                </div>

                <div class="steps">
                  <h3 style="color: #667eea; margin-top: 0;">Quick Setup - Just 3 Steps:</h3>
                  
                  <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                      <strong>Upload Documents</strong><br>
                      Police check and identification (we verify everything securely)
                    </div>
                  </div>
                  
                  <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                      <strong>Set Your Services</strong><br>
                      Tell us what services you offer and your rates
                    </div>
                  </div>
                  
                  <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                      <strong>Connect Payment</strong><br>
                      Quick Stripe setup to receive your earnings
                    </div>
                  </div>
                </div>

                <div class="message">
                  <p><strong>Need help?</strong> If you have any questions or run into any issues, just reply to this email. Our team is here to support you every step of the way!</p>
                  
                  <p>We can't wait to welcome you to the Ziggy Sitters family and help you start your pet sitting journey! 🎉</p>
                  
                  <p>Warm regards,<br>
                  <strong>The Ziggy Sitters Team</strong></p>
                </div>
              </div>

              <div class="footer">
                <p><strong>Ziggy Sitters</strong> - New Zealand's Trusted Pet Sitting Platform</p>
                <p style="margin-top: 15px; font-size: 12px; color: #999;">
                  This is a TEST email preview.
                </p>
              </div>
            </body>
          </html>
        `;
        break;

      case "police-vet-reminder":
        subject = "Reminder: Complete Your Police Vetting Check";
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333;">Hi there,</h1>
            
            <p style="color: #666; line-height: 1.6;">
              This is a friendly reminder to complete your NZ Police Vetting Service check as part of your sitter verification process.
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              To get started with your police vet check, visit:
            </p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <a href="https://www.police.govt.nz/advice-services/businesses-and-organisations/nz-police-vetting-service/forms-and-guides" 
                 style="color: #2563eb; text-decoration: none; font-weight: bold;">
                NZ Police Vetting Service - Forms and Guides
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              Once you've received your police vet check document, please upload it to your profile to complete the verification process.
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              If you have any questions, feel free to reach out to our support team.
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              Best regards,<br>
              The ZiggySitters Team
            </p>
          </div>
        `;
        break;

      default:
        throw new Error("Invalid email type. Use: stripe-reonboarding, onboarding-reminder, or police-vet-reminder");
    }

    const emailResponse = await resend.emails.send({
      from: "Ziggy Sitters <onboarding@resend.dev>",
      to: [email],
      subject: `[TEST PREVIEW] ${subject}`,
      html: emailHtml,
    });

    console.log(`[TEST-SITTER-EMAIL] ${emailType} email sent successfully to ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Test ${emailType} email sent to ${email}`,
        emailResponse 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("[TEST-SITTER-EMAIL] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
