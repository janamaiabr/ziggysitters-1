import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingPaymentData {
  booking_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { booking_id }: BookingPaymentData = await req.json();

    if (!booking_id) {
      throw new Error("Booking ID is required");
    }

    // Fetch booking details with sitter and owner info
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .select(`
        *,
        sitter:profiles!sitter_id(id, first_name, last_name, email),
        owner:profiles!owner_id(id, first_name, last_name, email)
      `)
      .eq("id", booking_id)
      .single();

    if (bookingError || !booking) {
      console.error("Error fetching booking:", bookingError);
      throw new Error("Booking not found");
    }

    const sitterName = `${booking.sitter.first_name} ${booking.sitter.last_name}`;
    const ownerName = `${booking.owner.first_name} ${booking.owner.last_name}`;
    const startDate = new Date(booking.start_date).toLocaleDateString('en-NZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const endDate = new Date(booking.end_date).toLocaleDateString('en-NZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Send email to sitter
    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <bookings@ziggysitters.com>",
      to: [booking.sitter.email],
      subject: `🎉 Payment Confirmed - Booking with ${ownerName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Payment Confirmed</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; line-height: 1.3;">
                          🎉 Payment Confirmed!
                        </h1>
                        <p style="margin: 10px 0 0; color: #f0f0f0; font-size: 16px;">
                          Your booking is now confirmed
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                          Hi ${sitterName},
                        </p>
                        
                        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                          Great news! ${ownerName} has completed payment for their booking. The booking is now confirmed and you can start preparing for it.
                        </p>

                        <!-- Booking Details Card -->
                        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin: 25px 0;">
                          <h2 style="margin: 0 0 20px; color: #667eea; font-size: 20px; font-weight: 600;">
                            📋 Booking Details
                          </h2>
                          
                          <table width="100%" cellpadding="8" cellspacing="0">
                            <tr>
                              <td style="color: #666666; font-size: 14px; padding-bottom: 8px; font-weight: 600;">Booking Reference:</td>
                              <td style="color: #333333; font-size: 14px; padding-bottom: 8px; text-align: right;">${booking.booking_reference}</td>
                            </tr>
                            <tr>
                              <td style="color: #666666; font-size: 14px; padding-bottom: 8px; font-weight: 600;">Pet Owner:</td>
                              <td style="color: #333333; font-size: 14px; padding-bottom: 8px; text-align: right;">${ownerName}</td>
                            </tr>
                            <tr>
                              <td style="color: #666666; font-size: 14px; padding-bottom: 8px; font-weight: 600;">Service Type:</td>
                              <td style="color: #333333; font-size: 14px; padding-bottom: 8px; text-align: right;">${booking.service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                            </tr>
                            <tr>
                              <td style="color: #666666; font-size: 14px; padding-bottom: 8px; font-weight: 600;">Check-in:</td>
                              <td style="color: #333333; font-size: 14px; padding-bottom: 8px; text-align: right;">${startDate}</td>
                            </tr>
                            <tr>
                              <td style="color: #666666; font-size: 14px; padding-bottom: 8px; font-weight: 600;">Check-out:</td>
                              <td style="color: #333333; font-size: 14px; padding-bottom: 8px; text-align: right;">${endDate}</td>
                            </tr>
                            <tr>
                              <td style="color: #666666; font-size: 14px; font-weight: 600; padding-top: 12px; border-top: 2px solid #e0e0e0;">Total Amount:</td>
                              <td style="color: #667eea; font-size: 18px; font-weight: 700; text-align: right; padding-top: 12px; border-top: 2px solid #e0e0e0;">$${(booking.total_amount / 100).toFixed(2)} NZD</td>
                            </tr>
                          </table>
                        </div>

                        ${booking.daily_reports_required ? `
                          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                            <p style="margin: 0; color: #856404; font-size: 14px; font-weight: 600;">
                              📸 Daily Reports Required
                            </p>
                            <p style="margin: 5px 0 0; color: #856404; font-size: 14px; line-height: 1.5;">
                              This booking includes daily photo updates. Please submit them each day to avoid penalties.
                            </p>
                          </div>
                        ` : ''}

                        <div style="background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0; border-radius: 4px;">
                          <p style="margin: 0; color: #0c5460; font-size: 14px; font-weight: 600;">
                            💰 Your Payout
                          </p>
                          <p style="margin: 5px 0 0; color: #0c5460; font-size: 14px; line-height: 1.5;">
                            Your payout will be processed automatically after the booking is completed.
                          </p>
                        </div>

                        <div style="text-align: center; margin: 30px 0 20px;">
                          <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app') || 'https://ziggysitters.lovable.app'}/bookings" 
                             style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                            View Booking Details
                          </a>
                        </div>

                        <p style="margin: 25px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                          If you have any questions, feel free to contact the pet owner through the messaging system or reach out to us.
                        </p>

                        <p style="margin: 20px 0 0; color: #333333; font-size: 16px;">
                          Happy sitting! 🐾<br>
                          <strong>The ZiggySitters Team</strong>
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
                        <p style="margin: 0 0 10px; color: #666666; font-size: 13px;">
                          © 2025 ZiggySitters. All rights reserved.
                        </p>
                        <p style="margin: 0; color: #999999; font-size: 12px;">
                          Auckland, New Zealand
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    console.log("Payment confirmation email sent to sitter:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payment confirmation email sent to sitter",
        email_id: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-booking-payment-confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
