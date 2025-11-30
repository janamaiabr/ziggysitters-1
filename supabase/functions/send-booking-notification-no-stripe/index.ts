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
    const firstName = sitter_name.split(' ')[0];

    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <bookings@ziggysitters.com>",
      to: [sitter_email],
      subject: `🎉 ${firstName}, You've Got a Booking! Quick Setup Required - ${booking_reference}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
              🎉 Congratulations, ${firstName}!
            </h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">
              You've got your first booking request!
            </p>
          </div>
          
          <!-- Main content -->
          <div style="background-color: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            
            <!-- Exciting news -->
            <div style="margin-bottom: 25px;">
              <p style="color: #1f2937; font-size: 18px; line-height: 1.6; margin: 0;">
                Amazing news! <strong>${owner_name}</strong> wants to book you for pet sitting. They chose <em>you</em> because they love what they saw on your profile! 🌟
              </p>
            </div>

            <!-- Booking details -->
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
                  <td style="padding: 10px 0; color: #4b5563; font-size: 15px;">Dates</td>
                  <td style="padding: 10px 0; color: #1f2937; font-weight: 600; font-size: 15px; text-align: right;">${new Date(start_date).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })} - ${new Date(end_date).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })}</td>
                </tr>
                <tr style="border-top: 2px solid #2563eb;">
                  <td style="padding: 15px 0 10px 0; color: #1f2937; font-size: 16px; font-weight: 600;">You'll Earn</td>
                  <td style="padding: 15px 0 10px 0; color: #16a34a; font-weight: 700; font-size: 24px; text-align: right;">NZ$${total_amount.toFixed(2)}</td>
                </tr>
              </table>
            </div>

            <!-- Payment setup required -->
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="margin: 0 0 12px 0; color: #92400e; font-size: 18px; font-weight: 700;">
                ⚡ One Quick Step to Accept
              </h3>
              <p style="margin: 0 0 15px 0; color: #92400e; font-size: 15px; line-height: 1.6;">
                To accept this booking and start earning, complete your <strong>payment setup</strong>. It takes just 2-3 minutes and you only need to do it once!
              </p>
              <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 1.8;">
                <li><strong>Secure:</strong> Powered by Stripe, used by millions worldwide</li>
                <li><strong>Fast:</strong> Payments arrive within 2 business days</li>
                <li><strong>Private:</strong> Your financial details stay completely secure</li>
              </ul>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://ziggysitters.com/profile" 
                 style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);">
                💳 Complete Setup & Accept Booking
              </a>
            </div>

            <!-- How it works -->
            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h4 style="margin: 0 0 12px 0; color: #374151; font-size: 16px; font-weight: 600;">What happens next?</h4>
              <ol style="color: #4b5563; line-height: 2; margin: 0; padding-left: 20px; font-size: 14px;">
                <li>Click the button above → go to your profile</li>
                <li>Complete the 2-minute Stripe payment setup</li>
                <li>Accept or decline the booking</li>
                <li>${owner_name} pays securely through our platform</li>
                <li>You complete the pet care service</li>
                <li>Money arrives in your account automatically! 💰</li>
              </ol>
            </div>

            <p style="text-align: center; color: #6b7280; font-size: 14px; margin: 25px 0; line-height: 1.6;">
              <strong>${owner_name}</strong> is excited to work with you! The faster you respond, the better the experience for both of you. 🚀
            </p>

            <!-- Safety warning -->
            <div style="background-color: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
                <strong>⚠️ Safety Reminder:</strong> All communication and payments must stay within ZiggySitters. Never share personal contact details or arrange payments outside our platform.
              </p>
            </div>

            <!-- Support -->
            <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.6;">
                <strong>💚 Questions?</strong> We're here to help! Email <a href="mailto:support@ziggysitters.com" style="color: #16a34a; text-decoration: none; font-weight: 600;">support@ziggysitters.com</a> and we'll get back to you within 24 hours.
              </p>
            </div>

          </div>

          <!-- Footer -->
          <div style="margin-top: 30px; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
              Cheering you on,<br>
              <strong style="color: #2563eb;">The ZiggySitters Team</strong>
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
              This is an automated notification. For support, please contact us directly.
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