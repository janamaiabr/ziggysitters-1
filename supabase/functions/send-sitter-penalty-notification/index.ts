import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SitterPenaltyNotificationRequest {
  booking_id: string;
  sitter_email: string;
  sitter_name: string;
  owner_name: string;
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
    const {
      booking_id,
      sitter_email,
      sitter_name,
      owner_name,
      penalty_amount,
      reports_completed,
      reports_required,
      booking_reference,
    }: SitterPenaltyNotificationRequest = await req.json();

    console.log(`Sending penalty notification to sitter: ${sitter_email}`);

    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <onboarding@resend.dev>",
      to: [sitter_email],
      subject: `Important: Payment Adjustment for Booking ${booking_reference}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Adjustment Notice</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Payment Adjustment Notice</h1>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px;">Dear ${sitter_name},</p>
            
            <p>This is to notify you about a payment adjustment for booking <strong>${booking_reference}</strong> with ${owner_name}.</p>
            
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #856404;">Incomplete Daily Reports</h3>
              <p style="margin-bottom: 10px;">We noticed that not all required daily reports were submitted for this booking:</p>
              <ul style="margin: 10px 0;">
                <li><strong>Reports Submitted:</strong> ${reports_completed} out of ${reports_required}</li>
                <li><strong>Penalty Applied:</strong> $${penalty_amount.toFixed(2)} NZD (15% of booking total)</li>
              </ul>
            </div>

            <div style="background-color: #e8f4f8; padding: 15px; margin: 20px 0; border-radius: 4px; border-left: 4px solid #0066cc;">
              <h3 style="margin-top: 0; color: #004080;">What This Means</h3>
              <p style="margin-bottom: 5px;">• The penalty amount has been deducted from your payout</p>
              <p style="margin-bottom: 5px;">• This amount has been refunded to the pet owner</p>
              <p style="margin-bottom: 5px;">• Your final payout will reflect this adjustment</p>
            </div>

            <div style="background-color: #d1ecf1; padding: 15px; margin: 20px 0; border-radius: 4px; border-left: 4px solid #0c5460;">
              <h3 style="margin-top: 0; color: #0c5460;">Why Daily Reports Matter</h3>
              <p>Daily reports are essential for:</p>
              <ul style="margin: 10px 0;">
                <li>Keeping pet owners informed about their pet's well-being</li>
                <li>Building trust and maintaining professional standards</li>
                <li>Ensuring quality service for all ZiggySitters clients</li>
              </ul>
            </div>

            <div style="background-color: #d4edda; padding: 15px; margin: 20px 0; border-radius: 4px; border-left: 4px solid #28a745;">
              <h3 style="margin-top: 0; color: #155724;">Moving Forward</h3>
              <p>To avoid penalties in future bookings:</p>
              <ul style="margin: 10px 0;">
                <li>Submit daily reports promptly during each booking</li>
                <li>Include photos and detailed updates about the pet's day</li>
                <li>Set reminders to ensure you don't miss any reports</li>
              </ul>
            </div>

            <p style="margin-top: 30px;">If you have any questions about this adjustment or need clarification, please don't hesitate to contact us.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #666; font-size: 14px; margin: 5px 0;">
                <strong>ZiggySitters Support</strong><br>
                Email: support@ziggysitters.com<br>
                We're here to help you succeed!
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`Penalty notification sent successfully to ${sitter_email}:`, emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-sitter-penalty-notification function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
