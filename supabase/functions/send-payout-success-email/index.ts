import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PayoutEmailRequest {
  sitter_email: string;
  sitter_name: string;
  owner_name: string;
  booking_reference: string;
  payout_amount: number;
  penalty_applied: boolean;
  penalty_amount?: number;
  reports_completed?: number;
  reports_required?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      sitter_email,
      sitter_name,
      owner_name,
      booking_reference,
      payout_amount,
      penalty_applied,
      penalty_amount,
      reports_completed,
      reports_required,
    }: PayoutEmailRequest = await req.json();

    console.log('Sending payout success email to:', sitter_email);

    const penaltySection = penalty_applied && penalty_amount ? `
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #92400e; font-weight: 600;">⚠️ Penalty Applied</p>
        <p style="margin: 8px 0 0 0; color: #92400e;">
          A penalty of $${penalty_amount.toFixed(2)} (${((penalty_amount / (payout_amount + penalty_amount)) * 100).toFixed(1)}%) was deducted due to incomplete daily reports.
          <br>Reports submitted: ${reports_completed}/${reports_required}
        </p>
      </div>
    ` : '';

    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <onboarding@resend.dev>",
      to: [sitter_email],
      subject: `💰 Payment Processed - ${booking_reference}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Payment Processed!</h1>
            </div>
            
            <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${sitter_name},</p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                Great news! Your payout for booking <strong>${booking_reference}</strong> with ${owner_name} has been processed.
              </p>

              ${penaltySection}
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                  <span style="color: #6b7280;">Booking Reference:</span>
                  <strong>${booking_reference}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                  <span style="color: #6b7280;">Pet Owner:</span>
                  <strong>${owner_name}</strong>
                </div>
                <hr style="border: none; border-top: 1px solid #d1d5db; margin: 16px 0;">
                <div style="display: flex; justify-content: space-between; font-size: 20px;">
                  <span style="color: #059669; font-weight: 600;">Net Payout:</span>
                  <strong style="color: #059669;">$${payout_amount.toFixed(2)}</strong>
                </div>
              </div>

              <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
                💳 The funds have been transferred to your Stripe account and should arrive within 2-7 business days, depending on your bank.
              </p>

              ${penalty_applied ? `
              <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  <strong>📝 Reminder:</strong> Daily reports are required for house sitting bookings. 
                  Missing reports result in proportional penalties to ensure quality service for pet owners.
                </p>
              </div>
              ` : `
              <div style="background-color: #d1fae5; padding: 16px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 0; font-size: 14px; color: #065f46;">
                  <strong>⭐ Well done!</strong> You submitted all required daily reports. 
                  Thank you for providing excellent service!
                </p>
              </div>
              `}

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="font-size: 14px; color: #6b7280; margin: 0;">
                  Questions about your payout? Contact us at 
                  <a href="mailto:support@ziggysitters.com" style="color: #667eea; text-decoration: none;">support@ziggysitters.com</a>
                </p>
              </div>
            </div>

            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>Ziggy Sitters - Quality Pet Care Services</p>
              <p>© ${new Date().getFullYear()} Ziggy Sitters. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Payout success email sent:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending payout success email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
