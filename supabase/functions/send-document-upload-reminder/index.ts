import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DocumentReminderRequest {
  sitterEmail: string;
  sitterName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sitterEmail, sitterName }: DocumentReminderRequest = await req.json();

    console.log(`Sending document upload reminder to ${sitterEmail}`);

    const uploadUrl = "https://ziggysitters.lovable.app/onboarding";

    const emailResponse = await resend.emails.send({
      from: "Ziggy Sitters <onboarding@resend.dev>",
      to: [sitterEmail],
      subject: "📄 Action Required: Upload Verification Documents",
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
              .important-box {
                background: #fff7ed;
                border-left: 4px solid #f97316;
                padding: 20px;
                border-radius: 8px;
                margin: 25px 0;
              }
              .important-box h3 {
                margin-top: 0;
                color: #f97316;
                font-size: 18px;
              }
              .important-box p {
                color: #555;
                margin: 10px 0;
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
              .required-docs {
                background: #f8f9ff;
                padding: 25px;
                border-radius: 8px;
                margin: 25px 0;
                border-left: 4px solid #667eea;
              }
              .required-docs h3 {
                margin-top: 0;
                color: #667eea;
                font-size: 18px;
              }
              .required-docs ul {
                margin: 15px 0;
                padding-left: 20px;
              }
              .required-docs li {
                margin: 12px 0;
                color: #555;
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
              <h1>📄 Documents Required</h1>
              <p>Complete your verification to get listed on Ziggy Sitters</p>
            </div>
            
            <div class="content">
              <div class="greeting">Hi ${sitterName}! 👋</div>
              
              <div class="message">
                <p>We're excited to have you join the Ziggy Sitters community! However, we've noticed that your verification documents are still pending.</p>
              </div>

              <div class="important-box">
                <h3>⚠️ Why This Is Important:</h3>
                <p><strong>Your profile will NOT be visible to pet owners until you upload and we verify your documents.</strong></p>
                <p>This means you cannot receive booking requests or start earning as a sitter until verification is complete.</p>
              </div>

              <div class="required-docs">
                <h3>📋 Required Documents:</h3>
                <ul>
                  <li><strong>Valid ID Document</strong> - Driver's license, passport, or government-issued ID</li>
                  <li><strong>NZ Police Vetting Service Check</strong> - For the safety of our pet owners and their furry friends</li>
                </ul>
                <p style="margin-top: 15px;"><em>Note: All documents must be clear, legible, and current.</em></p>
              </div>

              <div class="urgency">
                ⏰ Upload your documents now to complete your verification!
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${uploadUrl}" class="cta-button">
                  Upload Documents Now →
                </a>
              </div>

              <div class="message">
                <h3 style="color: #667eea;">What Happens After Upload:</h3>
                <ol>
                  <li>Our team reviews your documents within 24-48 hours</li>
                  <li>You'll receive an email once your profile is approved</li>
                  <li>Your profile goes live and pet owners can find you</li>
                  <li>You start receiving booking requests! 🎉</li>
                </ol>
              </div>

              <div class="message">
                <p><strong>Need Help Getting Your Police Check?</strong></p>
                <p>Visit the <a href="https://www.police.govt.nz/advice-services/businesses-and-organisations/nz-police-vetting-service/forms-and-guides" style="color: #667eea; text-decoration: none; font-weight: bold;">NZ Police Vetting Service</a> website to get started.</p>
              </div>

              <div class="message">
                <p><strong>Questions?</strong> If you need any assistance with uploading your documents, please don't hesitate to reach out to our support team.</p>
                
                <p>We're looking forward to welcoming you to the Ziggy Sitters family!</p>
                
                <p>Best regards,<br>
                <strong>The Ziggy Sitters Team</strong></p>
              </div>
            </div>

            <div class="footer">
              <p><strong>Ziggy Sitters</strong> - New Zealand's Trusted Pet Sitting Platform</p>
              <p style="margin-top: 15px;">
                <a href="${uploadUrl}">Upload Documents</a> · 
                <a href="mailto:support@ziggysitters.com">Contact Support</a>
              </p>
              <p style="margin-top: 15px; font-size: 12px; color: #999;">
                This email was sent because you registered as a sitter on Ziggy Sitters.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Document upload reminder sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Document reminder sent to ${sitterEmail}`,
      emailResponse 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending document reminder:", error);
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
