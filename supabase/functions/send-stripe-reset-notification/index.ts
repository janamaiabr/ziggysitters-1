import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Sitter {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sitters }: { sitters: Sitter[] } = await req.json();

    console.log(`Sending notification emails to ${sitters.length} sitters`);

    const emailPromises = sitters.map(async (sitter) => {
      const emailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .warning {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .steps {
              background: white;
              padding: 20px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .step {
              margin: 15px 0;
              padding-left: 30px;
              position: relative;
            }
            .step::before {
              content: "→";
              position: absolute;
              left: 0;
              color: #667eea;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔄 Important: Payment Setup Update Required</h1>
          </div>
          <div class="content">
            <p>Hi ${sitter.first_name},</p>
            
            <div class="warning">
              <strong>⚠️ Action Required</strong>
              <p>We've recently upgraded our payment platform to provide you with better service and security. As part of this upgrade, you'll need to reconnect your bank account.</p>
            </div>

            <h2>What Happened?</h2>
            <p>We migrated to a new Stripe Connect platform to improve our payment processing. Unfortunately, this means existing payment connections from the old platform are no longer valid.</p>

            <h2>What You Need to Do:</h2>
            <div class="steps">
              <div class="step">
                <strong>Log in to your ZiggySitters account</strong>
              </div>
              <div class="step">
                <strong>Go to your Profile page</strong>
              </div>
              <div class="step">
                <strong>Click on the "Payments" tab</strong>
              </div>
              <div class="step">
                <strong>Click "Connect with Stripe"</strong> - This will open a new tab
              </div>
              <div class="step">
                <strong>Complete the Stripe setup</strong> - You'll need to provide your bank details again
              </div>
              <div class="step">
                <strong>Return to your profile</strong> - Your payment setup will be complete!
              </div>
            </div>

            <p style="text-align: center;">
              <a href="https://ziggysitters.com/profile?tab=payments" class="button">
                Complete Payment Setup Now
              </a>
            </p>

            <h3>Why is this necessary?</h3>
            <p>The new Stripe platform offers:</p>
            <ul>
              <li>✅ Enhanced security for your bank information</li>
              <li>✅ Faster payment processing</li>
              <li>✅ Better fraud protection</li>
              <li>✅ Improved dashboard and reporting</li>
            </ul>

            <p><strong>Note:</strong> Until you complete this step, you won't be able to:</p>
            <ul>
              <li>Accept new bookings</li>
              <li>Add or edit services</li>
              <li>Receive payments</li>
            </ul>

            <h3>Need Help?</h3>
            <p>If you encounter any issues during the setup process:</p>
            <ul>
              <li>Try refreshing the page after completing Stripe setup</li>
              <li>Make sure you complete all required fields in the Stripe form</li>
              <li>Contact us at <a href="mailto:support@ziggysitters.com">support@ziggysitters.com</a> if you need assistance</li>
            </ul>

            <p>We apologize for this inconvenience and appreciate your patience as we improve our platform!</p>

            <p>Best regards,<br>
            <strong>The ZiggySitters Team</strong></p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #6b7280; text-align: center;">
              This is an important notification about your ZiggySitters account.<br>
              If you have questions, reply to this email or contact support@ziggysitters.com
            </p>
          </div>
        </body>
        </html>
      `;

      return resend.emails.send({
        from: "ZiggySitters <onboarding@resend.dev>",
        to: [sitter.email],
        subject: "🔄 Action Required: Reconnect Your Payment Account",
        html: emailContent,
      });
    });

    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Email results: ${successful} sent, ${failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: successful,
        failed: failed,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-stripe-reset-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
