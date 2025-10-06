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

interface DailyReportReminderRequest {
  bookingId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId }: DailyReportReminderRequest = await req.json();
    console.log("Sending daily report reminder for booking:", bookingId);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch booking details with sitter info
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        sitter:profiles!bookings_sitter_id_fkey(first_name, last_name, email),
        owner:profiles!bookings_owner_id_fkey(first_name, last_name)
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    // Only send reminder if daily reports are required for this booking
    if (!booking.requires_daily_reports) {
      console.log("Daily reports not required for this booking, skipping reminder");
      return new Response(
        JSON.stringify({ message: "Daily reports not required for this booking" }), 
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const sitterEmail = booking.sitter.email;
    const sitterName = `${booking.sitter.first_name}`;
    const ownerName = `${booking.owner.first_name} ${booking.owner.last_name}`;
    const pendingReports = booking.daily_reports_required - booking.daily_reports_completed;

    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <reminders@resend.dev>",
      to: [sitterEmail],
      subject: `📝 Reminder: Daily report for ${ownerName}'s pets`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .reminder-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Daily Report Reminder 📝</h1>
            </div>
            <div class="content">
              <h2>Hi ${sitterName}!</h2>
              <div class="reminder-box">
                <p><strong>Don't forget to submit your daily report!</strong></p>
                <p>You have ${pendingReports} pending report(s) for ${ownerName}'s pets.</p>
              </div>
              <p>Keeping pet owners updated with daily reports helps build trust and ensures they know their furry friends are in good hands.</p>
              <h3>What to include:</h3>
              <ul>
                <li>How the pets are feeling today</li>
                <li>Food and water consumption</li>
                <li>Exercise and playtime activities</li>
                <li>Any notable behaviors or concerns</li>
                <li>Photos if possible!</li>
              </ul>
              <center>
                <a href="https://82b1d4df-49fa-4aed-8283-e8671c38c6b4.lovableproject.com/daily-reports" class="button">
                  Submit Daily Report
                </a>
              </center>
              <p>Thank you for being a great sitter!</p>
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

    console.log("Daily report reminder sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending daily report reminder:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
