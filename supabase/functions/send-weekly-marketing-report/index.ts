import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch sitters by location
    const { data: sitters } = await supabase
      .from("profiles")
      .select("suburb, city")
      .eq("role", "pet_sitter")
      .eq("is_test_account", false)
      .not("suburb", "is", null);

    // Fetch searches (last 90 days)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { data: searches } = await supabase
      .from("search_events")
      .select("suburb, city")
      .gte("created_at", ninetyDaysAgo)
      .not("suburb", "is", null);

    // Aggregate sitter locations
    const sitterMap = new Map<string, { suburb: string; city: string; count: number }>();
    (sitters || []).forEach((s: any) => {
      const key = `${s.suburb?.trim().toLowerCase()}|${s.city?.trim().toLowerCase()}`;
      if (!sitterMap.has(key)) {
        sitterMap.set(key, { suburb: s.suburb || "", city: s.city || "", count: 0 });
      }
      sitterMap.get(key)!.count++;
    });

    // Aggregate search locations
    const searchMap = new Map<string, { suburb: string; city: string; count: number }>();
    (searches || []).forEach((s: any) => {
      const key = `${s.suburb?.trim().toLowerCase()}|${s.city?.trim().toLowerCase()}`;
      if (!searchMap.has(key)) {
        searchMap.set(key, { suburb: s.suburb || "", city: s.city || "", count: 0 });
      }
      searchMap.get(key)!.count++;
    });

    // Find recruitment areas (high demand, low supply)
    const recruitAreas: Array<{ suburb: string; city: string; sitters: number; searches: number }> = [];
    searchMap.forEach((value, key) => {
      const sitterData = sitterMap.get(key);
      const sitterCount = sitterData?.count || 0;
      if (value.count >= 2 && sitterCount < 2) {
        recruitAreas.push({
          suburb: value.suburb,
          city: value.city,
          sitters: sitterCount,
          searches: value.count,
        });
      }
    });
    recruitAreas.sort((a, b) => b.searches - a.searches);

    // Find marketing areas (sitters available, low searches)
    const marketAreas: Array<{ suburb: string; city: string; sitters: number; searches: number }> = [];
    sitterMap.forEach((value, key) => {
      const searchData = searchMap.get(key);
      const searchCount = searchData?.count || 0;
      if (searchCount < 3 && value.count > 0) {
        marketAreas.push({
          suburb: value.suburb,
          city: value.city,
          sitters: value.count,
          searches: searchCount,
        });
      }
    });
    marketAreas.sort((a, b) => b.sitters - a.sitters);

    // Build email HTML
    const today = new Date().toLocaleDateString("en-NZ", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const recruitHTML = recruitAreas.slice(0, 15).map((a) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${a.suburb}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center; color: #dc2626;">${a.sitters}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center; color: #16a34a;">${a.searches}</td>
      </tr>
    `).join("");

    const marketHTML = marketAreas.slice(0, 15).map((a) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${a.suburb}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center; color: #16a34a;">${a.sitters}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center; color: #dc2626;">${a.searches}</td>
      </tr>
    `).join("");

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #8B5CF6; margin: 0;">📊 Weekly Marketing Report</h1>
          <p style="color: #666; margin-top: 5px;">${today}</p>
        </div>

        <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 5px 0; color: #92400e;">📈 Summary</h3>
          <p style="margin: 0; font-size: 14px;">
            <strong>${sitters?.length || 0}</strong> total sitters • 
            <strong>${searches?.length || 0}</strong> searches (90 days) • 
            <strong>${recruitAreas.filter(r => r.sitters === 0).length}</strong> coverage gaps
          </p>
        </div>

        <div style="background: #fee2e2; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; color: #dc2626;">🔥 Recruit Sitters Here</h3>
          <p style="font-size: 13px; color: #666; margin-bottom: 10px;">High search demand but few/no sitters:</p>
          ${recruitAreas.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="background: #fecaca;">
                  <th style="padding: 8px; text-align: left;">Suburb</th>
                  <th style="padding: 8px; text-align: center;">Sitters</th>
                  <th style="padding: 8px; text-align: center;">Searches</th>
                </tr>
              </thead>
              <tbody>${recruitHTML}</tbody>
            </table>
          ` : '<p style="color: #666;">No recruitment opportunities this week</p>'}
        </div>

        <div style="background: #d1fae5; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; color: #059669;">🎯 Market to Pet Owners</h3>
          <p style="font-size: 13px; color: #666; margin-bottom: 10px;">Sitters available but low search volume:</p>
          ${marketAreas.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="background: #a7f3d0;">
                  <th style="padding: 8px; text-align: left;">Suburb</th>
                  <th style="padding: 8px; text-align: center;">Sitters</th>
                  <th style="padding: 8px; text-align: center;">Searches</th>
                </tr>
              </thead>
              <tbody>${marketHTML}</tbody>
            </table>
          ` : '<p style="color: #666;">No marketing opportunities this week</p>'}
        </div>

        <div style="background: #f3f4f6; border-radius: 8px; padding: 15px;">
          <h4 style="margin: 0 0 10px 0;">📋 Action Items</h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
            <li>Run Facebook/Instagram ads for sitter recruitment in critical areas</li>
            <li>Run Google Ads targeting pet owners in suburbs with available sitters</li>
            <li>Consider local community Facebook groups for both recruitment and marketing</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            This is an automated weekly report from Ziggy Sitters.<br>
            <a href="https://ziggysitters.com/admin/marketing-insights" style="color: #8B5CF6;">View full dashboard</a>
          </p>
        </div>
      </body>
      </html>
    `;

    // Send email
    const { error: emailError } = await resend.emails.send({
      from: "Ziggy Sitters <noreply@ziggysitters.com>",
      to: ["hello@ziggysitters.com"],
      subject: `📊 Weekly Marketing Report - ${today}`,
      html: emailHTML,
    });

    if (emailError) {
      console.error("Email send error:", emailError);
      throw emailError;
    }

    console.log("Weekly marketing report sent successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Report sent" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
