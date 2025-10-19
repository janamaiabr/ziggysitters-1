import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingNotificationRequest {
  booking_id: string;
  sitter_email: string;
  sitter_name: string;
  owner_name: string;
  service_type: string;
  start_date: string;
  end_date: string;
  booking_reference: string;
  total_amount: number;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      booking_id,
      sitter_email,
      sitter_name,
      owner_name,
      service_type,
      start_date,
      end_date,
      booking_reference,
      total_amount
    }: BookingNotificationRequest = await req.json();

    const serviceTypeFormatted = service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <onboarding@ziggysitters.com>",
      to: [sitter_email],
      subject: `🎉 New Booking Request - Action Required - ${booking_reference}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            🐾 New Booking Request
          </h1>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1f2937; margin-top: 0;">Hello ${sitter_name}!</h2>
            <p style="color: #4b5563; font-size: 16px;">
              You have received a new booking request from <strong>${owner_name}</strong>.
            </p>
          </div>

          <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; width: 40%;">Service:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${serviceTypeFormatted}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Reference:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${booking_reference}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Start Date:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${new Date(start_date).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">End Date:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${new Date(end_date).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Amount:</td>
                <td style="padding: 8px 0; color: #16a34a; font-weight: 600; font-size: 18px;">NZ$${total_amount}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #92400e;">
              ⚡ Payment Setup Required
            </h3>
            <p style="margin: 10px 0; color: #92400e; font-size: 15px; line-height: 1.6;">
              To accept this booking and start earning, you need to complete your <strong>Stripe payment setup</strong>. This is a one-time process that takes just 2-3 minutes and allows you to receive payments securely.
            </p>
            <p style="margin: 10px 0; color: #92400e; font-size: 15px; line-height: 1.6;">
              <strong>Why Stripe?</strong> We use Stripe to ensure secure, fast payments directly to your bank account. Your financial information is never shared with us or pet owners.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://ziggysitters.com/profile" 
               style="background-color: #16a34a; color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 16px;">
              Complete Payment Setup & Accept Booking
            </a>
          </div>

          <div style="background-color: #f3f4f6; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #374151;">What happens next?</h4>
            <ol style="color: #4b5563; line-height: 1.8; margin: 10px 0; padding-left: 20px;">
              <li>Click the button above to go to your profile</li>
              <li>Complete the quick Stripe payment setup (2-3 minutes)</li>
              <li>Accept or decline the booking request</li>
              <li>The pet owner will complete payment once you accept</li>
              <li>You'll receive payment after completing the service</li>
            </ol>
          </div>

          <div style="background-color: #fee2e2; border: 1px solid #dc2626; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #991b1b; font-size: 14px;">
              <strong>⚠️ SAFETY WARNING:</strong> For your protection, please do not contact pet owners outside of the ZiggySitters platform. All communication should occur through our secure messaging system.
            </p>
          </div>

          <div style="background-color: #dbeafe; border: 1px solid #3b82f6; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af; font-size: 14px;">
              <strong>💡 Need Help?</strong> If you have questions about payment setup or accepting bookings, contact our support team at support@ziggysitters.com
            </p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Best regards,<br>
              The Ziggy Sitters Team
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 15px;">
              This is an automated notification. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Booking notification (no Stripe) email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending booking notification (no Stripe) email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
