import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminBookingNotificationRequest {
  booking_id: string;
  owner_name: string;
  owner_email: string;
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
      booking_id,
      owner_name,
      owner_email,
      sitter_name,
      service_type,
      start_date,
      end_date,
      booking_reference,
      total_amount
    }: AdminBookingNotificationRequest = await req.json();

    const serviceTypeFormatted = service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <onboarding@ziggysitters.com>",
      to: ["janamaia@gmail.com"],
      subject: `New Booking Created - ${booking_reference}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            📋 New Booking Created
          </h1>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1f2937; margin-top: 0;">Booking Details</h2>
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
                <td style="padding: 8px 0; color: #6b7280;">Pet Owner:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${owner_name} (${owner_email})</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Sitter:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${sitter_name}</td>
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
                <td style="padding: 8px 0; color: #6b7280;">Total Amount:</td>
                <td style="padding: 8px 0; color: #16a34a; font-weight: 600; font-size: 18px;">NZ$${total_amount.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Platform Fee (GST incl.):</td>
                <td style="padding: 8px 0; color: #2563eb; font-weight: 600;">NZ$${(total_amount * 0.10).toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://ziggysitters.com/admin/dashboard" 
               style="background-color: #2563eb; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; display: inline-block;">
              View in Admin Dashboard
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Ziggy Sitters Platform
            </p>
          </div>
        </div>
      `,
    });

    console.log("Admin booking notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending admin booking notification email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});