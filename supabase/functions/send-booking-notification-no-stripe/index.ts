import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

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
      subject: `🎉 ${firstName}, Your First Booking is Here! 2-Min Setup to Start Earning - ${booking_reference}`,
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
                🎊 This is it! <strong>${owner_name}</strong> wants to book you for pet sitting. They chose <em>you</em> over other sitters because they loved your profile! This is your moment to start earning. 💰
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
            <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-left: 4px solid #16a34a; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="margin: 0 0 12px 0; color: #166534; font-size: 18px; font-weight: 700;">
                ⚡ 2 Minutes to Start Earning NZ$${total_amount.toFixed(2)}
              </h3>
              <p style="margin: 0 0 15px 0; color: #166534; font-size: 16px; line-height: 1.6; font-weight: 600;">
                ${owner_name} is ready to pay you! Just complete a quick one-time setup to receive payments:
              </p>
              <div style="background: white; border-radius: 6px; padding: 15px; margin: 15px 0;">
                <ul style="margin: 0; padding-left: 20px; color: #166534; font-size: 15px; line-height: 2;">
                  <li><strong>Takes 2 minutes</strong> - Basic info only (bank details, ID)</li>
                  <li><strong>Bank-level security</strong> - Powered by Stripe (used by Uber, Amazon)</li>
                  <li><strong>Get paid in 2 days</strong> - Money goes straight to your bank</li>
                  <li><strong>Do it once</strong> - Never need to set up again!</li>
                </ul>
              </div>
              <p style="margin: 15px 0 0 0; color: #166534; font-size: 14px; line-height: 1.6; font-style: italic;">
                💡 Every successful sitter on our platform has completed this. It's safe, fast, and required by law for receiving payments.
              </p>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://ziggysitters.com/profile" 
                 style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; text-decoration: none; padding: 18px 45px; border-radius: 10px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 20px rgba(22, 163, 74, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
                💰 Get My NZ$${total_amount.toFixed(2)} Now →
              </a>
              <p style="margin: 12px 0 0 0; color: #6b7280; font-size: 13px;">
                Click to complete 2-min setup and accept booking
              </p>
            </div>

            <!-- Social proof -->
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
              <p style="margin: 0; color: #92400e; font-size: 15px; line-height: 1.8; font-weight: 600;">
                💪 Join hundreds of pet sitters earning on ZiggySitters. Your first booking is waiting - accept it in the next 24 hours to make a great first impression!
              </p>
            </div>

            <!-- What happens next -->
            <div style="background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h4 style="margin: 0 0 15px 0; color: #374151; font-size: 17px; font-weight: 700; text-align: center;">📍 Your Simple Next Steps</h4>
              <ol style="color: #1f2937; line-height: 2.2; margin: 0; padding-left: 22px; font-size: 15px;">
                <li><strong>Click button above</strong> → Opens your profile page</li>
                <li><strong>Complete payment setup</strong> → 2 mins, one time only</li>
                <li><strong>Accept this booking</strong> → ${owner_name} gets notified instantly</li>
                <li><strong>Provide amazing care</strong> → Do what you do best! 🐾</li>
                <li><strong>Get paid automatically</strong> → Money arrives in 2 business days 💰</li>
              </ol>
            </div>

            <p style="text-align: center; color: #ef4444; font-size: 15px; margin: 25px 0; line-height: 1.6; font-weight: 600;">
              ⏰ <strong>${owner_name}</strong> is waiting for your response! Accept within 24 hours to secure this booking.
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
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});