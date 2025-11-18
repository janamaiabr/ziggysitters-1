import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PenaltyNotificationRequest {
  booking_id: string;
  owner_email: string;
  owner_name: string;
  sitter_name: string;
  penalty_amount: number;
  reports_completed: number;
  reports_required: number;
  booking_reference: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const { 
      owner_email, 
      owner_name, 
      sitter_name, 
      penalty_amount,
      reports_completed,
      reports_required,
      booking_reference 
    }: PenaltyNotificationRequest = await req.json();

    console.log("Sending penalty notification to:", owner_email);

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Refund Notification</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">💰 Refund Processed</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
          Booking ${booking_reference}
        </p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e1e1e1; border-top: none; border-radius: 0 0 10px 10px;">
        <div style="margin-bottom: 25px;">
          <h2 style="color: #16a34a; margin-bottom: 10px;">Hello ${owner_name},</h2>
          <p>We're writing to inform you that a partial refund has been processed for your booking with ${sitter_name}.</p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a; margin-bottom: 25px;">
          <h3 style="color: #16a34a; margin-top: 0; margin-bottom: 15px;">Refund Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Refund Amount:</td>
              <td style="padding: 8px 0; color: #16a34a; font-weight: 600; font-size: 18px;">NZ$${penalty_amount.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Reason:</td>
              <td style="padding: 8px 0; font-weight: 600;">Incomplete Daily Reports</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Reports Submitted:</td>
              <td style="padding: 8px 0; font-weight: 600;">${reports_completed} of ${reports_required}</td>
            </tr>
          </table>
        </div>

        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #2563eb; margin-top: 0; margin-bottom: 10px;">📋 What Happened?</h3>
          <p style="margin: 0; font-size: 14px;">
            You requested daily photo updates for this booking. Our policy ensures accountability by applying a 15% refund when sitters don't provide the requested reports. 
            Your sitter submitted ${reports_completed} of ${reports_required} required reports.
          </p>
        </div>

        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #dc2626; margin-top: 0; margin-bottom: 10px;">💳 Refund Processing</h3>
          <p style="margin: 0; font-size: 14px;">
            The refund of <strong>NZ$${penalty_amount.toFixed(2)}</strong> (15% of your booking total) has been issued to your original payment method. 
            It may take 5-10 business days to appear in your account, depending on your bank.
          </p>
        </div>

        <div style="border-top: 2px solid #e1e1e1; padding-top: 20px; text-align: center;">
          <p style="color: #666; margin: 0; font-size: 14px;">
            This refund was automatically processed according to our daily reports policy.
          </p>
          <p style="color: #667eea; margin: 10px 0 0 0; font-weight: bold;">
            ZiggySitters - Transparent Pet Care You Can Trust
          </p>
          <p style="color: #999; margin: 10px 0 0 0; font-size: 12px;">
            Questions? Contact us at support@ziggysitters.com
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <bookings@ziggysitters.com>",
      to: [owner_email],
      subject: `Refund Processed - Booking ${booking_reference}`,
      html: emailHtml,
    });

    console.log("Penalty notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-penalty-notification function:", error);
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