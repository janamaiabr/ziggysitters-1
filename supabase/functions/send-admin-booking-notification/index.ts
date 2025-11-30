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
  sitter_email?: string;
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
      sitter_email,
      service_type,
      start_date,
      end_date,
      booking_reference,
      total_amount
    }: AdminBookingNotificationRequest = await req.json();

    const serviceTypeFormatted = service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const platformFee = Math.round(total_amount * 0.10 * 100) / 100;
    const sitterEarnings = total_amount - platformFee;

    const emailResponse = await resend.emails.send({
      from: "ZiggySitters Admin <admin@ziggysitters.com>",
      to: ["janamaia@gmail.com"],
      subject: `🎉 NEW BOOKING CREATED! ${booking_reference}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          
          <!-- Exciting Header -->
          <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px 20px; border-radius: 12px 12px 0 0; text-align: center; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);">
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 800;">
              🎉 NEW BOOKING!
            </h1>
            <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 18px; font-weight: 600;">
              ${booking_reference}
            </p>
            <p style="color: #a7f3d0; margin: 5px 0 0 0; font-size: 14px;">
              Created: ${new Date().toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' })} NZDT
            </p>
          </div>
          
          <!-- Main content -->
          <div style="background-color: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            
            <!-- Quick Summary -->
            <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-left: 5px solid #3b82f6; border-radius: 10px; padding: 20px; margin: 0 0 25px 0;">
              <h3 style="color: #1e40af; margin: 0 0 12px 0; font-size: 18px; font-weight: 700;">
                📋 Quick Summary
              </h3>
              <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin: 0;">
                <strong>${owner_name}</strong> has requested <strong>${sitter_name}</strong> for <strong>${serviceTypeFormatted}</strong>
              </p>
            </div>

            <!-- Service & Dates -->
            <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin: 25px 0; border: 2px solid #e2e8f0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; color: #64748b; font-size: 15px; font-weight: 500;">Service Type</td>
                  <td style="padding: 12px 0; color: #1e293b; font-weight: 700; font-size: 16px; text-align: right;">${serviceTypeFormatted}</td>
                </tr>
                <tr style="border-top: 1px solid #e2e8f0;">
                  <td style="padding: 12px 0; color: #64748b; font-size: 15px; font-weight: 500;">Start Date</td>
                  <td style="padding: 12px 0; color: #1e293b; font-weight: 700; font-size: 16px; text-align: right;">${new Date(start_date).toLocaleDateString('en-NZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                </tr>
                <tr style="border-top: 1px solid #e2e8f0;">
                  <td style="padding: 12px 0; color: #64748b; font-size: 15px; font-weight: 500;">End Date</td>
                  <td style="padding: 12px 0; color: #1e293b; font-weight: 700; font-size: 16px; text-align: right;">${new Date(end_date).toLocaleDateString('en-NZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                </tr>
                <tr style="border-top: 1px solid #e2e8f0;">
                  <td style="padding: 12px 0; color: #64748b; font-size: 15px; font-weight: 500;">Duration</td>
                  <td style="padding: 12px 0; color: #1e293b; font-weight: 700; font-size: 16px; text-align: right;">${Math.ceil((new Date(end_date).getTime() - new Date(start_date).getTime()) / (1000 * 60 * 60 * 24))} days</td>
                </tr>
              </table>
            </div>

            <!-- People Information - Side by Side -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0;">
              
              <!-- Pet Owner -->
              <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 10px; padding: 20px; border-left: 4px solid #3b82f6;">
                <h4 style="margin: 0 0 15px 0; color: #1e40af; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                  👤 Pet Owner
                </h4>
                <p style="margin: 0 0 8px 0; color: #1e293b; font-weight: 700; font-size: 18px;">${owner_name}</p>
                <p style="margin: 0; color: #475569; font-size: 14px; word-break: break-all;">${owner_email}</p>
              </div>

              <!-- Pet Sitter -->
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 10px; padding: 20px; border-left: 4px solid #16a34a;">
                <h4 style="margin: 0 0 15px 0; color: #166534; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                  🐾 Pet Sitter
                </h4>
                <p style="margin: 0 0 8px 0; color: #1e293b; font-weight: 700; font-size: 18px;">${sitter_name}</p>
                ${sitter_email ? `<p style="margin: 0; color: #475569; font-size: 14px; word-break: break-all;">${sitter_email}</p>` : ''}
              </div>
            </div>

            <!-- Financial Breakdown -->
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 5px solid #f59e0b; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);">
              <h3 style="margin: 0 0 20px 0; color: #92400e; font-size: 20px; font-weight: 700;">
                💰 Financial Breakdown
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; color: #78350f; font-size: 15px; font-weight: 500;">Total Booking Amount</td>
                  <td style="padding: 12px 0; color: #92400e; font-weight: 700; font-size: 20px; text-align: right;">NZ$${total_amount.toFixed(2)}</td>
                </tr>
                <tr style="border-top: 2px solid #fbbf24;">
                  <td style="padding: 12px 0; color: #78350f; font-size: 15px; font-weight: 500;">Platform Fee (10% GST incl.)</td>
                  <td style="padding: 12px 0; color: #16a34a; font-weight: 700; font-size: 20px; text-align: right;">+NZ$${platformFee.toFixed(2)}</td>
                </tr>
                <tr style="border-top: 2px solid #fbbf24;">
                  <td style="padding: 12px 0; color: #78350f; font-size: 15px; font-weight: 500;">Sitter Earnings</td>
                  <td style="padding: 12px 0; color: #1e293b; font-weight: 700; font-size: 18px; text-align: right;">NZ$${sitterEarnings.toFixed(2)}</td>
                </tr>
              </table>
            </div>

            <!-- Current Status -->
            <div style="background-color: #fef9c3; border: 2px solid #eab308; border-radius: 10px; padding: 20px; margin: 25px 0; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #854d0e; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                Current Status
              </p>
              <p style="margin: 0; color: #92400e; font-size: 24px; font-weight: 800;">
                ⏳ PENDING SITTER ACCEPTANCE
              </p>
            </div>

            <!-- Next Steps -->
            <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h4 style="margin: 0 0 12px 0; color: #166534; font-size: 16px; font-weight: 700;">✅ What happens next?</h4>
              <ol style="color: #166534; line-height: 2; margin: 0; padding-left: 20px; font-size: 14px;">
                <li>Sitter receives email notification</li>
                <li>Sitter accepts or declines the booking</li>
                <li>If accepted → Pet owner pays via Stripe</li>
                <li>Payment confirmed → Booking status = CONFIRMED</li>
                <li>Service completed → Sitter receives automatic payout</li>
              </ol>
            </div>

            <!-- Action Buttons -->
            <div style="text-align: center; margin: 30px 0 20px 0;">
              <a href="https://ziggysitters.com/admin-dashboard" 
                 style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4); margin-right: 10px;">
                📊 View in Dashboard
              </a>
            </div>

          </div>

          <!-- Footer -->
          <div style="margin-top: 30px; padding: 20px; text-align: center; border-top: 2px solid #e5e7eb; background-color: white; border-radius: 10px;">
            <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0; font-weight: 600;">
              ZiggySitters Admin Notification System
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Booking ID: <code style="background-color: #f3f4f6; padding: 2px 6px; border-radius: 3px;">${booking_id}</code>
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