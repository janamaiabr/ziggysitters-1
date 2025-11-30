import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StatusUpdateRequest {
  booking_reference: string;
  old_status: string;
  new_status: string;
  owner_name: string;
  owner_email: string;
  sitter_name: string;
  sitter_email: string;
  service_type: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  platform_fee: number;
  payment_status?: string;
  additional_info?: string;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const getStatusEmoji = (status: string): string => {
  const emojiMap: Record<string, string> = {
    'pending': '⏳',
    'awaiting_payment': '💳',
    'confirmed': '✅',
    'in_progress': '🔄',
    'completed': '🎉',
    'cancelled': '❌',
    'declined': '⛔'
  };
  return emojiMap[status] || '📋';
};

const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'pending': '#f59e0b',
    'awaiting_payment': '#3b82f6',
    'confirmed': '#16a34a',
    'in_progress': '#8b5cf6',
    'completed': '#059669',
    'cancelled': '#dc2626',
    'declined': '#991b1b'
  };
  return colorMap[status] || '#6b7280';
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: StatusUpdateRequest = await req.json();

    const {
      booking_reference,
      old_status,
      new_status,
      owner_name,
      owner_email,
      sitter_name,
      sitter_email,
      service_type,
      start_date,
      end_date,
      total_amount,
      platform_fee,
      payment_status,
      additional_info
    } = data;

    const serviceTypeFormatted = service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const newStatusFormatted = new_status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const oldStatusFormatted = old_status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const emailResponse = await resend.emails.send({
      from: "ZiggySitters Admin <admin@ziggysitters.com>",
      to: ["janamaia@gmail.com"],
      subject: `${getStatusEmoji(new_status)} Booking Status Update: ${booking_reference} → ${newStatusFormatted}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 25px 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">
              ${getStatusEmoji(new_status)} Booking Status Changed
            </h1>
            <p style="color: #cbd5e1; margin: 8px 0 0 0; font-size: 14px;">
              ${booking_reference}
            </p>
          </div>
          
          <!-- Main content -->
          <div style="background-color: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            
            <!-- Status change indicator -->
            <div style="text-align: center; margin: 0 0 30px 0;">
              <div style="display: inline-flex; align-items: center; gap: 15px; padding: 15px 25px; background-color: #f1f5f9; border-radius: 50px;">
                <span style="padding: 8px 16px; background-color: ${getStatusColor(old_status)}; color: white; border-radius: 20px; font-size: 13px; font-weight: 600;">
                  ${oldStatusFormatted}
                </span>
                <span style="color: #64748b; font-size: 18px;">→</span>
                <span style="padding: 8px 16px; background-color: ${getStatusColor(new_status)}; color: white; border-radius: 20px; font-size: 13px; font-weight: 600;">
                  ${newStatusFormatted}
                </span>
              </div>
            </div>

            <!-- Booking Information -->
            <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h3 style="color: #1e293b; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">
                📋 Booking Information
              </h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #64748b; font-size: 14px; width: 40%;">Reference</td>
                  <td style="padding: 10px 0; color: #1e293b; font-weight: 600; font-size: 14px;"><code style="background-color: #e2e8f0; padding: 4px 8px; border-radius: 4px;">${booking_reference}</code></td>
                </tr>
                <tr style="border-top: 1px solid #e2e8f0;">
                  <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Service</td>
                  <td style="padding: 10px 0; color: #1e293b; font-weight: 600; font-size: 14px;">${serviceTypeFormatted}</td>
                </tr>
                <tr style="border-top: 1px solid #e2e8f0;">
                  <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Dates</td>
                  <td style="padding: 10px 0; color: #1e293b; font-weight: 600; font-size: 14px;">${new Date(start_date).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric', year: 'numeric' })} - ${new Date(end_date).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                </tr>
              </table>
            </div>

            <!-- People involved -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0;">
              
              <!-- Pet Owner -->
              <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 10px; padding: 20px; border-left: 4px solid #3b82f6;">
                <h4 style="margin: 0 0 12px 0; color: #1e40af; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  👤 Pet Owner
                </h4>
                <p style="margin: 0 0 6px 0; color: #1e293b; font-weight: 600; font-size: 15px;">${owner_name}</p>
                <p style="margin: 0; color: #475569; font-size: 13px;">${owner_email}</p>
              </div>

              <!-- Sitter -->
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 10px; padding: 20px; border-left: 4px solid #16a34a;">
                <h4 style="margin: 0 0 12px 0; color: #166534; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  🐾 Pet Sitter
                </h4>
                <p style="margin: 0 0 6px 0; color: #1e293b; font-weight: 600; font-size: 15px;">${sitter_name}</p>
                <p style="margin: 0; color: #475569; font-size: 13px;">${sitter_email}</p>
              </div>
            </div>

            <!-- Financial Information -->
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 10px; padding: 20px; margin: 25px 0; border-left: 4px solid #f59e0b;">
              <h4 style="margin: 0 0 15px 0; color: #92400e; font-size: 16px; font-weight: 600;">
                💰 Financial Summary
              </h4>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #78350f; font-size: 14px;">Total Booking Amount</td>
                  <td style="padding: 8px 0; color: #92400e; font-weight: 700; font-size: 16px; text-align: right;">NZ$${total_amount.toFixed(2)}</td>
                </tr>
                <tr style="border-top: 1px solid #fbbf24;">
                  <td style="padding: 8px 0; color: #78350f; font-size: 14px;">Platform Fee (10% GST incl.)</td>
                  <td style="padding: 8px 0; color: #16a34a; font-weight: 700; font-size: 16px; text-align: right;">NZ$${platform_fee.toFixed(2)}</td>
                </tr>
                <tr style="border-top: 1px solid #fbbf24;">
                  <td style="padding: 8px 0; color: #78350f; font-size: 14px;">Sitter Earnings</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 700; font-size: 16px; text-align: right;">NZ$${(total_amount - platform_fee).toFixed(2)}</td>
                </tr>
                ${payment_status ? `
                <tr style="border-top: 2px solid #f59e0b;">
                  <td style="padding: 12px 0 8px 0; color: #78350f; font-size: 14px; font-weight: 600;">Payment Status</td>
                  <td style="padding: 12px 0 8px 0; text-align: right;">
                    <span style="padding: 6px 12px; background-color: ${payment_status === 'paid' ? '#16a34a' : '#f59e0b'}; color: white; border-radius: 15px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                      ${payment_status}
                    </span>
                  </td>
                </tr>
                ` : ''}
              </table>
            </div>

            ${additional_info ? `
            <!-- Additional Information -->
            <div style="background-color: #f1f5f9; border-radius: 10px; padding: 20px; margin: 25px 0;">
              <h4 style="margin: 0 0 10px 0; color: #475569; font-size: 14px; font-weight: 600;">ℹ️ Additional Information</h4>
              <p style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.6;">${additional_info}</p>
            </div>
            ` : ''}

            <!-- View in Dashboard Button -->
            <div style="text-align: center; margin: 30px 0 20px 0;">
              <a href="https://ziggysitters.com/admin-dashboard" 
                 style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                📊 View in Admin Dashboard
              </a>
            </div>

          </div>

          <!-- Footer -->
          <div style="margin-top: 25px; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 13px; margin: 0;">
              <strong>ZiggySitters Admin Notification System</strong><br>
              <span style="color: #9ca3af; font-size: 12px;">Timestamp: ${new Date().toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' })} NZDT</span>
            </p>
          </div>
        </div>
      `,
    });

    console.log("Admin status update email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending admin status update email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});