import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingAcceptanceRequest {
  bookingId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId }: BookingAcceptanceRequest = await req.json();
    console.log("Sending booking acceptance email for:", bookingId);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch booking details with owner and sitter info
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        owner:profiles!bookings_owner_id_fkey(first_name, last_name, email),
        sitter:profiles!bookings_sitter_id_fkey(first_name, last_name, phone, address, suburb)
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    const ownerEmail = booking.owner.email;
    const ownerName = `${booking.owner.first_name} ${booking.owner.last_name}`;
    const sitterName = `${booking.sitter.first_name} ${booking.sitter.last_name}`;
    const sitterPhone = booking.sitter.phone;
    const sitterAddress = `${booking.sitter.address}, ${booking.sitter.suburb}`;

    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <notifications@resend.dev>",
      to: [ownerEmail],
      subject: `🎉 Your booking has been accepted by ${sitterName}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Great News! 🎉</h1>
            </div>
            <div class="content">
              <h2>Hi ${ownerName}!</h2>
              <p><strong>${sitterName}</strong> has accepted your booking request!</p>
              <div class="booking-details">
                <h3>Booking Details</h3>
                <div class="detail-row">
                  <strong>Booking Reference:</strong>
                  <span>${booking.booking_reference}</span>
                </div>
                <div class="detail-row">
                  <strong>Service Type:</strong>
                  <span>${booking.service_type}</span>
                </div>
                <div class="detail-row">
                  <strong>Dates:</strong>
                  <span>${new Date(booking.start_date).toLocaleDateString()} - ${new Date(booking.end_date).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                  <strong>Total Amount:</strong>
                  <span>$${booking.total_amount}</span>
                </div>
              </div>
              <h3>Sitter Contact Information</h3>
              <div class="booking-details">
                <p><strong>Name:</strong> ${sitterName}</p>
                <p><strong>Phone:</strong> ${sitterPhone}</p>
                <p><strong>Address:</strong> ${sitterAddress}</p>
              </div>
              <p>You can now coordinate directly with your sitter for any specific arrangements.</p>
              <center>
                <a href="https://82b1d4df-49fa-4aed-8283-e8671c38c6b4.lovableproject.com/bookings" class="button">
                  View Booking
                </a>
              </center>
              <p>Best regards,<br>The ZiggySitters Team</p>
            </div>
            <div class="footer">
              <p>© 2025 ZiggySitters. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Booking acceptance email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending booking acceptance email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
