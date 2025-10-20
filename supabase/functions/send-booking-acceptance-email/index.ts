import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingAcceptanceRequest {
  owner_email: string;
  owner_name: string;
  sitter_name: string;
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
      owner_email,
      owner_name,
      sitter_name,
      service_type,
      start_date,
      end_date,
      booking_reference,
      total_amount
    }: BookingAcceptanceRequest = await req.json();

    const serviceTypeFormatted = service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <bookings@ziggysitters.com>",
      to: [owner_email],
      subject: `Booking Accepted - ${booking_reference}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #16a34a; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            ✅ Booking Accepted!
          </h1>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <h2 style="color: #1f2937; margin-top: 0;">Great News, ${owner_name}!</h2>
            <p style="color: #4b5563; font-size: 16px;">
              <strong>${sitter_name}</strong> has accepted your booking request.
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

          <div style="background-color: #fee2e2; border: 1px solid #dc2626; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #991b1b; font-size: 14px;">
              <strong>⚠️ SAFETY WARNING:</strong> For your protection, please do not contact sitters outside of the ZiggySitters platform. All communication should occur through our secure messaging system.
            </p>
          </div>

          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>⏰ Next Step:</strong> Please complete your payment to confirm the booking. Once payment is received, your booking will be fully confirmed.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://ziggysitters.com/bookings" 
               style="background-color: #16a34a; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; display: inline-block;">
              Complete Payment
            </a>
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

    console.log("Booking acceptance email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending booking acceptance email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
