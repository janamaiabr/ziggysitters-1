import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OnboardingReminderRequest {
  sitterEmail: string;
  sitterName: string;
  onboardingUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Onboarding reminder function started');
    
    const { sitterEmail, sitterName, onboardingUrl }: OnboardingReminderRequest = await req.json();
    
    console.log('Sending reminder to:', sitterEmail);

    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <onboarding@ziggysitters.com>",
      to: [sitterEmail],
      subject: "🐾 Your Pet Sitting Journey Awaits - Complete Your Profile!",
      headers: {
        'List-Unsubscribe': `<mailto:unsubscribe@ziggysitters.com?subject=Unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      html: `
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
                transition: transform 0.2s;
              }
              .cta-button:hover {
                transform: translateY(-2px);
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
              }
              .step-content {
                flex: 1;
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
              .footer a {
                color: #667eea;
                text-decoration: none;
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
              <div class="greeting">Hi ${sitterName}! 👋</div>
              
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
                <a href="${onboardingUrl}" class="cta-button">
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
              <p style="margin-top: 15px;">
                <a href="${onboardingUrl}">Complete Onboarding</a> · 
                <a href="mailto:support@ziggysitters.com">Contact Support</a>
              </p>
              <p style="margin-top: 15px; font-size: 12px; color: #999;">
                This email was sent because you started the sitter registration process on Ziggy Sitters.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Onboarding reminder sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending onboarding reminder:", error);
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
