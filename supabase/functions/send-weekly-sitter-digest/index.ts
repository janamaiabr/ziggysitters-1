import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SitterStats {
  searchesInArea: number;
  messagesReceived: number;
  pendingBookings: number;
  completedBookings: number;
  totalEarnings: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting weekly sitter digest...");

    // Get all active sitters with completed onboarding
    const { data: sitters, error: sittersError } = await supabase
      .from("profiles")
      .select("id, email, first_name, last_name, suburb, city")
      .eq("role", "pet_sitter")
      .eq("is_test_account", false);

    if (sittersError) throw sittersError;

    console.log(`Found ${sitters?.length || 0} sitters to send digests to`);

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const results = { sent: 0, skipped: 0, errors: [] as string[] };

    for (const sitter of sitters || []) {
      try {
        // Get searches in sitter's area
        const { data: searches } = await supabase
          .from("search_events")
          .select("id")
          .or(`suburb.ilike.%${sitter.suburb || ''}%,city.ilike.%${sitter.city || 'Auckland'}%`)
          .gte("search_timestamp", oneWeekAgo);

        // Get messages received
        const { count: messageCount } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("recipient_id", sitter.id)
          .gte("created_at", oneWeekAgo);

        // Get booking stats
        const { data: bookings } = await supabase
          .from("bookings")
          .select("status, total_amount")
          .eq("sitter_id", sitter.id)
          .gte("created_at", oneWeekAgo);

        const pendingBookings = bookings?.filter(b => b.status === "pending").length || 0;
        const completedBookings = bookings?.filter(b => b.status === "completed").length || 0;
        const totalEarnings = bookings
          ?.filter(b => b.status === "completed")
          .reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;

        const stats: SitterStats = {
          searchesInArea: searches?.length || 0,
          messagesReceived: messageCount || 0,
          pendingBookings,
          completedBookings,
          totalEarnings,
        };

        // Skip if no activity
        if (stats.searchesInArea === 0 && stats.messagesReceived === 0 && 
            stats.pendingBookings === 0 && stats.completedBookings === 0) {
          console.log(`Skipping ${sitter.email} - no activity`);
          results.skipped++;
          continue;
        }

        // Send digest email
        const emailHtml = generateDigestEmail(sitter.first_name, stats);
        
        const { error: emailError } = await resend.emails.send({
          from: "ZiggySitters <onboarding@resend.dev>",
          to: [sitter.email],
          subject: `📊 Your Weekly Activity Summary - ${stats.searchesInArea} pet owners searching near you!`,
          html: emailHtml,
        });

        if (emailError) {
          console.error(`Error sending to ${sitter.email}:`, emailError);
          results.errors.push(`${sitter.email}: ${emailError.message}`);
        } else {
          console.log(`Sent digest to ${sitter.email}`);
          results.sent++;
        }

      } catch (error) {
        console.error(`Error processing ${sitter.email}:`, error);
        results.errors.push(`${sitter.email}: ${error.message}`);
      }
    }

    console.log("Weekly digest complete:", results);

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in weekly digest:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

function generateDigestEmail(firstName: string, stats: SitterStats): string {
  const hasActivity = stats.searchesInArea > 0 || stats.messagesReceived > 0;
  const hasBookings = stats.pendingBookings > 0 || stats.completedBookings > 0;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Weekly Activity Summary</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <tr>
          <td style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">📊 Weekly Activity Summary</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Here's what happened this week</p>
          </td>
        </tr>
        
        <!-- Greeting -->
        <tr>
          <td style="padding: 30px;">
            <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0;">Hi ${firstName}! 👋</p>
            <p style="color: #4b5563; margin: 0 0 25px 0; line-height: 1.6;">
              Here's a quick look at your activity and what's happening in your area this week.
            </p>
          </td>
        </tr>
        
        <!-- Stats Grid -->
        <tr>
          <td style="padding: 0 30px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="48%" style="background: linear-gradient(135deg, #ede9fe 0%, #f3e8ff 100%); padding: 20px; border-radius: 12px; text-align: center;">
                  <div style="font-size: 32px; font-weight: bold; color: #7c3aed;">${stats.searchesInArea}</div>
                  <div style="font-size: 14px; color: #6b21a8; margin-top: 5px;">Searches Near You</div>
                </td>
                <td width="4%"></td>
                <td width="48%" style="background: linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%); padding: 20px; border-radius: 12px; text-align: center;">
                  <div style="font-size: 32px; font-weight: bold; color: #2563eb;">${stats.messagesReceived}</div>
                  <div style="font-size: 14px; color: #1e40af; margin-top: 5px;">Messages Received</div>
                </td>
              </tr>
              <tr><td colspan="3" style="height: 15px;"></td></tr>
              <tr>
                <td width="48%" style="background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%); padding: 20px; border-radius: 12px; text-align: center;">
                  <div style="font-size: 32px; font-weight: bold; color: #d97706;">${stats.pendingBookings}</div>
                  <div style="font-size: 14px; color: #92400e; margin-top: 5px;">Pending Requests</div>
                </td>
                <td width="4%"></td>
                <td width="48%" style="background: linear-gradient(135deg, #d1fae5 0%, #dcfce7 100%); padding: 20px; border-radius: 12px; text-align: center;">
                  <div style="font-size: 32px; font-weight: bold; color: #059669;">${stats.completedBookings}</div>
                  <div style="font-size: 14px; color: #065f46; margin-top: 5px;">Completed Bookings</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        
        ${stats.totalEarnings > 0 ? `
        <!-- Earnings -->
        <tr>
          <td style="padding: 25px 30px 0 30px;">
            <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #10b981;">
              <div style="font-size: 14px; color: #065f46;">This Week's Earnings</div>
              <div style="font-size: 36px; font-weight: bold; color: #059669; margin-top: 5px;">NZ$${stats.totalEarnings.toFixed(2)}</div>
            </div>
          </td>
        </tr>
        ` : ''}
        
        <!-- Tips Section -->
        <tr>
          <td style="padding: 30px;">
            ${hasActivity && stats.pendingBookings > 0 ? `
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 15px;">
              <p style="margin: 0; color: #92400e; font-weight: 600;">⚡ Action Needed</p>
              <p style="margin: 5px 0 0 0; color: #78350f; font-size: 14px;">
                You have ${stats.pendingBookings} pending booking request${stats.pendingBookings > 1 ? 's' : ''} waiting for your response!
              </p>
            </div>
            ` : ''}
            
            ${stats.searchesInArea > 0 ? `
            <div style="background-color: #ede9fe; border-left: 4px solid #7c3aed; padding: 15px; border-radius: 0 8px 8px 0;">
              <p style="margin: 0; color: #5b21b6; font-weight: 600;">🔍 Pet Owners Are Looking!</p>
              <p style="margin: 5px 0 0 0; color: #6b21a8; font-size: 14px;">
                ${stats.searchesInArea} pet owners searched in your area this week. Make sure your profile is complete and your calendar is up to date!
              </p>
            </div>
            ` : ''}
          </td>
        </tr>
        
        <!-- CTA -->
        <tr>
          <td style="padding: 0 30px 30px 30px; text-align: center;">
            <a href="https://ziggysitters.com/profile" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              View Your Dashboard →
            </a>
          </td>
        </tr>
        
        <!-- Footer -->
        <tr>
          <td style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Keep up the great work! 🐾
            </p>
            <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
              The Ziggysitters Team
            </p>
            <p style="margin: 15px 0 0 0; color: #9ca3af; font-size: 11px;">
              <a href="https://ziggysitters.com" style="color: #7c3aed; text-decoration: none;">ziggysitters.com</a>
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

serve(handler);