import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CancellationRequest {
  userId: string;
  userEmail: string;
  userName: string;
  reason: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, userEmail, userName, reason }: CancellationRequest = await req.json();

    console.log('Account cancellation request received:', { userId, userEmail, userName });

    // Send notification to admin
    const adminEmailResponse = await resend.emails.send({
      from: "PetBNB <noreply@petbnb.co.nz>",
      to: ["admin@petbnb.co.nz"], // Admin email
      subject: `Account Cancellation Request - ${userName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
              .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
              .label { font-weight: bold; color: #6b7280; }
              .reason-box { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
              .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">⚠️ Account Cancellation Request</h1>
              </div>
              <div class="content">
                <p>A user has requested to cancel their account.</p>
                
                <div class="info-box">
                  <p><span class="label">User Name:</span> ${userName}</p>
                  <p><span class="label">Email:</span> ${userEmail}</p>
                  <p><span class="label">User ID:</span> ${userId}</p>
                  <p><span class="label">Date Requested:</span> ${new Date().toLocaleString()}</p>
                </div>

                <div class="reason-box">
                  <p class="label">Reason for Cancellation:</p>
                  <p style="margin-top: 10px; white-space: pre-wrap;">${reason}</p>
                </div>

                <p><strong>Next Steps:</strong></p>
                <ul>
                  <li>Review the cancellation reason</li>
                  <li>Check for any active bookings or pending payments</li>
                  <li>Contact the user within 24-48 hours to confirm and process the request</li>
                  <li>If approved, delete the user account from the admin dashboard</li>
                </ul>

                <a href="https://petbnb.co.nz/admin-dashboard" class="button">Go to Admin Dashboard</a>

                <div class="footer">
                  <p>PetBNB Admin Notification<br>
                  This is an automated message, please do not reply directly.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('Admin notification email response:', adminEmailResponse);

    // Send confirmation to user
    const userEmailResponse = await resend.emails.send({
      from: "PetBNB <noreply@petbnb.co.nz>",
      to: [userEmail],
      subject: "Account Cancellation Request Received",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
              .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
              .info-box { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">Account Cancellation Request</h1>
              </div>
              <div class="content">
                <p>Hi ${userName},</p>
                
                <p>We've received your request to cancel your PetBNB account. We're sorry to see you go!</p>

                <div class="info-box">
                  <p><strong>What happens next?</strong></p>
                  <ul>
                    <li>Our team will review your request within 24-48 hours</li>
                    <li>We'll check for any active bookings or pending transactions</li>
                    <li>You'll receive an email confirmation once your account is processed</li>
                  </ul>
                </div>

                <p><strong>Changed your mind?</strong></p>
                <p>If you'd like to keep your account, simply reply to this email and let us know. We'd love to help resolve any issues you're experiencing.</p>

                <p>Thank you for being part of the PetBNB community!</p>

                <div class="footer">
                  <p>Best regards,<br>
                  The PetBNB Team<br>
                  <a href="https://petbnb.co.nz">petbnb.co.nz</a></p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('User confirmation email response:', userEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Cancellation request submitted successfully" 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error processing account cancellation request:", error);
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
