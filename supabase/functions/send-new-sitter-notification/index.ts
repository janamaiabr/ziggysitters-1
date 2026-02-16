import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  sitter_id: string;
  suburb: string;
  city?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { sitter_id, suburb, city }: NotificationRequest = await req.json();

    console.log(`Processing new sitter notification for sitter ${sitter_id} in ${suburb}`);

    if (!sitter_id || !suburb) {
      return new Response(
        JSON.stringify({ error: "sitter_id and suburb are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get sitter details
    const { data: sitter, error: sitterError } = await supabase
      .from("profiles")
      .select("first_name, last_name, avatar_url, bio, suburb, city")
      .eq("id", sitter_id)
      .single();

    if (sitterError || !sitter) {
      console.error("Failed to fetch sitter:", sitterError);
      return new Response(
        JSON.stringify({ error: "Sitter not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get sitter's services for pricing info
    const { data: services } = await supabase
      .from("sitter_services")
      .select("service_type, daily_rate, overnight_rate")
      .eq("sitter_id", sitter_id)
      .eq("is_offered", true);

    const lowestRate = services?.reduce((min, s) => {
      const rate = s.daily_rate || s.overnight_rate || 0;
      return rate > 0 && rate < min ? rate : min;
    }, Infinity) || null;

    // Find users who searched this area and haven't been notified recently (1 week rate limit)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Search for matching email captures - match on suburb (case insensitive)
    const { data: emailCaptures, error: captureError } = await supabase
      .from("email_captures")
      .select("id, email, name, search_location, search_service_type")
      .eq("subscribed", true)
      .or(`last_sitter_notification_at.is.null,last_sitter_notification_at.lt.${oneWeekAgo.toISOString()}`);

    if (captureError) {
      console.error("Failed to fetch email captures:", captureError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscribers" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter to matching locations (case insensitive suburb match)
    const matchingCaptures = emailCaptures?.filter(capture => {
      if (!capture.search_location) return false;
      const searchLocation = capture.search_location.toLowerCase();
      const sitterSuburb = suburb.toLowerCase();
      const sitterCity = city?.toLowerCase() || "auckland";
      
      return searchLocation.includes(sitterSuburb) || 
             sitterSuburb.includes(searchLocation) ||
             searchLocation.includes(sitterCity);
    }) || [];

    console.log(`Found ${matchingCaptures.length} matching subscribers for ${suburb}`);

    if (matchingCaptures.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No matching subscribers found",
          emails_sent: 0 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sitterName = `${sitter.first_name} ${sitter.last_name?.charAt(0) || ""}`.trim();
    const sitterLocation = sitter.suburb || suburb;
    let emailsSent = 0;
    const errors: string[] = [];

    for (const capture of matchingCaptures) {
      try {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">Great News! 🎉</h1>
                <p style="color: #666; font-size: 16px; margin-top: 10px;">A new pet sitter just joined in your area</p>
              </div>
              
              <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; padding: 24px; margin: 20px 0;">
                <div style="display: flex; align-items: center; gap: 16px;">
                  ${sitter.avatar_url ? 
                    `<img src="${sitter.avatar_url}" alt="${sitterName}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;">` :
                    `<div style="width: 80px; height: 80px; border-radius: 50%; background: #6366f1; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: bold;">${sitter.first_name?.charAt(0) || "S"}</div>`
                  }
                  <div>
                    <h2 style="margin: 0; color: #1a1a1a; font-size: 20px;">${sitterName}</h2>
                    <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">📍 ${sitterLocation}${city ? `, ${city}` : ""}</p>
                    ${lowestRate && lowestRate !== Infinity ? 
                      `<p style="margin: 4px 0 0 0; color: #059669; font-size: 14px; font-weight: 500;">From $${lowestRate}/day</p>` : 
                      ""
                    }
                  </div>
                </div>
                ${sitter.bio ? 
                  `<p style="margin: 16px 0 0 0; color: #444; font-size: 14px; line-height: 1.5;">"${sitter.bio.substring(0, 150)}${sitter.bio.length > 150 ? "..." : ""}"</p>` : 
                  ""
                }
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://ziggysitters.com/sitter/${sitter_id}" 
                   style="display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  View Profile & Book
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                You're receiving this because you searched for pet sitters in ${capture.search_location || sitterLocation}.<br>
                <a href="https://ziggysitters.com" style="color: #6366f1;">Ziggy Sitters</a> | Auckland's trusted pet sitting platform
              </p>
            </div>
          </body>
          </html>
        `;

        const { error: emailError } = await resend.emails.send({
          from: "Ziggy Sitters <hello@ziggysitters.com>",
          to: [capture.email],
          subject: `🐾 New pet sitter in ${sitterLocation}!`,
          html: emailHtml,
        });

        if (emailError) {
          console.error(`Failed to send email to ${capture.email}:`, emailError);
          errors.push(capture.email);
        } else {
          // Update last notification timestamp
          await supabase
            .from("email_captures")
            .update({ 
              last_sitter_notification_at: new Date().toISOString(),
              email_count: (capture as any).email_count ? (capture as any).email_count + 1 : 1
            })
            .eq("id", capture.id);
          
          emailsSent++;
          console.log(`Successfully sent notification to ${capture.email}`);
        }
      } catch (err) {
        console.error(`Error processing ${capture.email}:`, err);
        errors.push(capture.email);
      }
    }

    console.log(`Notification complete: ${emailsSent} sent, ${errors.length} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emails_sent: emailsSent,
        errors: errors.length > 0 ? errors : undefined
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-new-sitter-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
