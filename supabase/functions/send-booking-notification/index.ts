import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
    const firstName = sitter_name.split(' ')[0];

    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <bookings@ziggysitters.com>",
      to: [sitter_email],
      subject: `🎉 Exciting News ${firstName}! New Booking Request - ${booking_reference}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <!-- Header with brand color -->
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
              🐾 Exciting News, ${firstName}!
            </h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">
              You've got a new booking request waiting
            </p>
          </div>
          
          <!-- Main content -->
          <div style="background-color: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            
            <!-- Personal greeting -->
            <div style="margin-bottom: 25px;">
              <p style="color: #1f2937; font-size: 18px; line-height: 1.6; margin: 0;">
                Great news! <strong>${owner_name}</strong> would love to book you for pet sitting. They chose you because of your amazing profile and the care you provide! 💕
              </p>
            </div>

            <!-- Booking details card -->
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #2563eb; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                📋 Booking Details
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #4b5563; font-size: 15px;">Service</td>
                  <td style="padding: 10px 0; color: #1f2937; font-weight: 600; font-size: 15px; text-align: right;">${serviceTypeFormatted}</td>
                </tr>
                <tr style="border-top: 1px solid #bfdbfe;">
                  <td style="padding: 10px 0; color: #4b5563; font-size: 15px;">Reference</td>
                  <td style="padding: 10px 0; color: #1f2937; font-weight: 600; font-size: 15px; text-align: right;">${booking_reference}</td>
                </tr>
                <tr style="border-top: 1px solid #bfdbfe;">
                  <td style="padding: 10px 0; color: #4b5563; font-size: 15px;">Start Date</td>
                  <td style="padding: 10px 0; color: #1f2937; font-weight: 600; font-size: 15px; text-align: right;">${new Date(start_date).toLocaleDateString('en-NZ', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</td>
                </tr>
                <tr style="border-top: 1px solid #bfdbfe;">
                  <td style="padding: 10px 0; color: #4b5563; font-size: 15px;">End Date</td>
                  <td style="padding: 10px 0; color: #1f2937; font-weight: 600; font-size: 15px; text-align: right;">${new Date(end_date).toLocaleDateString('en-NZ', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</td>
                </tr>
                <tr style="border-top: 2px solid #2563eb;">
                  <td style="padding: 15px 0 10px 0; color: #1f2937; font-size: 16px; font-weight: 600;">You'll Earn</td>
                  <td style="padding: 15px 0 10px 0; color: #16a34a; font-weight: 700; font-size: 24px; text-align: right;">NZ$${total_amount.toFixed(2)}</td>
                </tr>
              </table>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 35px 0 25px 0;">
              <a href="https://ziggysitters.com/bookings" 
                 style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3); transition: transform 0.2s;">
                ✅ Accept This Booking
              </a>
            </div>

            <p style="text-align: center; color: #6b7280; font-size: 14px; margin: 20px 0;">
              <strong>${owner_name}</strong> is waiting to hear from you! The sooner you respond, the better the experience for everyone. 🎉
            </p>

            <!-- Warning box -->
            <div style="background-color: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; margin: 25px 0;">
              <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
                <strong>⚠️ Safety First:</strong> For your security, please keep all communication within the ZiggySitters platform. Never share personal contact information or arrange payments outside our secure system.
              </p>
            </div>

            <!-- Support -->
            <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.6;">
                <strong>💚 Need Help?</strong> Our support team is here for you! Email us at <a href="mailto:support@ziggysitters.com" style="color: #16a34a; text-decoration: none; font-weight: 600;">support@ziggysitters.com</a> and we'll respond within 24 hours.
              </p>
            </div>

          </div>

          <!-- Footer -->
          <div style="margin-top: 30px; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
              With gratitude,<br>
              <strong style="color: #2563eb;">The ZiggySitters Team</strong>
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
              This is an automated notification. For questions, please contact support.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Booking notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending booking notification email:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});