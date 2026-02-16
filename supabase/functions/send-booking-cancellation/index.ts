import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingCancellationRequest {
  recipient_email: string;
  recipient_name: string;
  cancelled_by_name: string;
  cancelled_by_type: 'owner' | 'sitter';
  service_type: string;
  start_date: string;
  end_date: string;
  booking_reference: string;
  total_amount: number;
  cancellation_reason?: string;
  refund_amount?: number;
  refund_percentage?: number;
  platform_fee_retained?: number;
  was_paid?: boolean;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      recipient_email,
      recipient_name,
      cancelled_by_name,
      cancelled_by_type,
      service_type,
      start_date,
      end_date,
      booking_reference,
      total_amount,
      cancellation_reason,
      refund_amount = 0,
      refund_percentage = 0,
      platform_fee_retained = 0,
      was_paid = false
    }: BookingCancellationRequest = await req.json();

    const serviceTypeFormatted = service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const cancelledByTitle = cancelled_by_type === 'owner' ? 'Pet Owner' : 'Pet Sitter';

    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <bookings@ziggysitters.com>",
      to: [recipient_email],
      subject: `Booking Cancelled - ${booking_reference}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #dc2626; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            🚫 Booking Cancellation Notice
          </h1>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h2 style="color: #991b1b; margin-top: 0;">Hello ${recipient_name},</h2>
            <p style="color: #7f1d1d; font-size: 16px;">
              We're writing to inform you that your booking has been cancelled by the ${cancelledByTitle.toLowerCase()}, <strong>${cancelled_by_name}</strong>.
            </p>
          </div>

          <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Cancelled Booking Details</h3>
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
                <td style="padding: 8px 0; color: #dc2626; font-weight: 600; font-size: 18px;">NZ$${total_amount}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Cancelled By:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${cancelled_by_name} (${cancelledByTitle})</td>
              </tr>
            </table>
          </div>

          ${cancellation_reason ? `
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">Cancellation Reason:</h3>
              <p style="color: #4b5563; font-size: 16px; margin: 0;">
                "${cancellation_reason}"
              </p>
            </div>
          ` : ''}

          <div style="background-color: #fee2e2; border: 1px solid #dc2626; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #991b1b; font-size: 14px;">
              <strong>⚠️ SAFETY REMINDER:</strong> For your protection, please do not contact other users outside of the ZiggySitters platform. All communication should occur through our secure messaging system.
            </p>
          </div>

          ${was_paid ? `
            <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <h3 style="color: #0c4a6e; margin-top: 0;">Refund Information</h3>
              ${refund_percentage > 0 ? `
                <p style="margin: 0; color: #0c4a6e; font-size: 14px;">
                  <strong>Refund Amount:</strong> ${refund_percentage}% of service fee = NZ$${refund_amount.toFixed(2)}<br>
                  <strong>Platform Fee:</strong> NZ$${platform_fee_retained.toFixed(2)} (non-refundable)<br>
                  <strong>Processing Time:</strong> Refunds will appear in your account within 5-10 business days.
                </p>
              ` : `
                <p style="margin: 0; color: #dc2626; font-size: 14px;">
                  <strong>No Refund:</strong> Cancellation occurred within 24 hours of the booking start time or after the service began. Per our cancellation policy, no refund will be issued.
                </p>
              `}
            </div>
          ` : `
            <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #0c4a6e; font-size: 14px;">
                <strong>Payment Status:</strong> This booking was cancelled before payment was processed. No charges were made.
              </p>
            </div>
          `}

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://ziggysitters.com/find-sitters" 
               style="background-color: #2563eb; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; display: inline-block;">
              ${cancelled_by_type === 'sitter' ? 'Find Another Sitter' : 'Browse Available Services'}
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              We apologize for any inconvenience this may cause.<br>
              The Ziggy Sitters Team
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 15px;">
              If you have any questions about this cancellation, please contact our support team.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Booking cancellation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending booking cancellation email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});