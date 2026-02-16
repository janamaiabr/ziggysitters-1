import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingExpiryRequest {
  owner_email: string;
  owner_name: string;
  sitter_name: string;
  service_type: string;
  start_date: string;
  end_date: string;
  booking_reference: string;
  total_amount: number;
  expiry_reason: string;
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
      total_amount,
      expiry_reason
    }: BookingExpiryRequest = await req.json();

    console.log(`[EXPIRY-EMAIL] Sending expiry notification to ${owner_email} for ${booking_reference}`);

    const serviceTypeFormatted = service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <bookings@ziggysitters.com>",
      to: [owner_email],
      subject: `Booking Request Expired - ${booking_reference}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #f59e0b; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            ⏰ Booking Request Expired
          </h1>
          
          <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h2 style="color: #92400e; margin-top: 0;">Hello ${owner_name},</h2>
            <p style="color: #78350f; font-size: 16px;">
              Unfortunately, your booking request with <strong>${sitter_name}</strong> has expired.
            </p>
            <p style="color: #78350f; font-size: 14px;">
              <strong>Reason:</strong> ${expiry_reason}
            </p>
          </div>

          <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Expired Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; width: 40%;">Reference:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${booking_reference}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Service:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${serviceTypeFormatted}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Dates:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${new Date(start_date).toLocaleDateString()} - ${new Date(end_date).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Amount:</td>
                <td style="padding: 8px 0; color: #f59e0b; font-weight: 600; font-size: 18px;">NZ$${total_amount}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Sitter:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${sitter_name}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #0c4a6e; font-size: 14px;">
              <strong>💡 What now?</strong> Don't worry - there are many other qualified sitters available who would love to help! Browse our sitters to find the perfect match for your pet.
            </p>
          </div>

          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>📋 Tip:</strong> Booking requests expire after 3 days if the sitter doesn't respond. We recommend contacting sitters via messaging first to confirm their availability before booking.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://ziggysitters.com/find-sitters" 
               style="background-color: #2563eb; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; display: inline-block;">
              Find Another Sitter
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              We apologize for any inconvenience.<br>
              The ZiggySitters Team
            </p>
          </div>
        </div>
      `,
    });

    console.log("[EXPIRY-EMAIL] Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[EXPIRY-EMAIL] Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
