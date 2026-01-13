import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SignupData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  suburb: string | null;
  city: string | null;
  onboarding_completed: boolean;
  created_at: string;
  search_data?: {
    suburb: string | null;
    service_type: string | null;
    results_count: number | null;
    clicked_sitters: string[];
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get signups from last 24 hours (or custom period)
    const { hours = 24 } = await req.json().catch(() => ({}));
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    console.log(`Fetching signups since ${since}`);

    // Fetch new signups
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, first_name, last_name, role, suburb, city, onboarding_completed, created_at, user_id")
      .gte("created_at", since)
      .order("created_at", { ascending: false });

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    if (!profiles || profiles.length === 0) {
      console.log("No new signups in the period");
      return new Response(JSON.stringify({ message: "No new signups" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${profiles.length} new signups`);

    // Enrich with search data for pet owners
    const enrichedSignups: SignupData[] = await Promise.all(
      profiles.map(async (profile) => {
        const signupData: SignupData = {
          id: profile.id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          role: profile.role,
          suburb: profile.suburb,
          city: profile.city,
          onboarding_completed: profile.onboarding_completed || false,
          created_at: profile.created_at,
        };

        // For pet owners, try to find their pre-signup search activity
        if (profile.role === "pet_owner") {
          // First try user_id linked searches
          const { data: userSearches } = await supabase
            .from("search_events")
            .select("suburb, service_type, results_count, clicked_sitter_ids")
            .eq("user_id", profile.id)
            .order("created_at", { ascending: false })
            .limit(1);

          if (userSearches && userSearches.length > 0) {
            const search = userSearches[0];
            signupData.search_data = {
              suburb: search.suburb,
              service_type: search.service_type,
              results_count: search.results_count,
              clicked_sitters: search.clicked_sitter_ids || [],
            };
          }
        }

        return signupData;
      })
    );

    // Calculate stats
    const stats = {
      total: enrichedSignups.length,
      petOwners: enrichedSignups.filter((s) => s.role === "pet_owner").length,
      sitters: enrichedSignups.filter((s) => s.role === "pet_sitter").length,
      ownersCompleted: enrichedSignups.filter((s) => s.role === "pet_owner" && s.onboarding_completed).length,
      sittersCompleted: enrichedSignups.filter((s) => s.role === "pet_sitter" && s.onboarding_completed).length,
      ownersWithSearches: enrichedSignups.filter((s) => s.role === "pet_owner" && s.search_data).length,
    };

    // Get sitter names for clicked profiles
    const allClickedSitterIds = enrichedSignups
      .filter((s) => s.search_data?.clicked_sitters?.length)
      .flatMap((s) => s.search_data!.clicked_sitters);

    let sitterNames: Record<string, string> = {};
    if (allClickedSitterIds.length > 0) {
      const { data: sitters } = await supabase
        .from("profiles")
        .select("id, first_name, suburb")
        .in("id", [...new Set(allClickedSitterIds)]);

      if (sitters) {
        sitterNames = Object.fromEntries(
          sitters.map((s) => [s.id, `${s.first_name} (${s.suburb || "Unknown"})`])
        );
      }
    }

    // Build email HTML
    const baseUrl = "https://www.ziggysitters.com";
    const adminUrl = `${baseUrl}/admin`;

    const formatTime = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleString("en-NZ", { 
        timeZone: "Pacific/Auckland",
        hour: "numeric",
        minute: "2-digit",
        hour12: true 
      });
    };

    const getRoleEmoji = (role: string) => (role === "pet_owner" ? "🐾" : "👤");
    const getStatusEmoji = (completed: boolean) => (completed ? "✅" : "⏳");

    const petOwnerRows = enrichedSignups
      .filter((s) => s.role === "pet_owner")
      .map((s) => {
        const searchInfo = s.search_data
          ? `Searched: ${s.search_data.suburb || "Any"} (${s.search_data.service_type || "Any service"})`
          : "No search recorded";
        
        const clickedInfo = s.search_data?.clicked_sitters?.length
          ? `Viewed: ${s.search_data.clicked_sitters.map((id) => sitterNames[id] || "Unknown").join(", ")}`
          : "";

        return `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px; vertical-align: top;">
              <strong>${s.first_name} ${s.last_name}</strong><br>
              <span style="color: #6b7280; font-size: 13px;">${s.email}</span>
            </td>
            <td style="padding: 12px; vertical-align: top;">
              <span style="color: #6b7280; font-size: 13px;">${searchInfo}</span>
              ${clickedInfo ? `<br><span style="color: #3b82f6; font-size: 12px;">${clickedInfo}</span>` : ""}
            </td>
            <td style="padding: 12px; text-align: center; vertical-align: top;">
              ${getStatusEmoji(s.onboarding_completed)}
            </td>
            <td style="padding: 12px; vertical-align: top;">
              <a href="${adminUrl}/users/${s.id}" style="color: #3b82f6; text-decoration: none; font-size: 13px;">View</a>
            </td>
          </tr>
        `;
      })
      .join("");

    const sitterRows = enrichedSignups
      .filter((s) => s.role === "pet_sitter")
      .map((s) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px; vertical-align: top;">
            <strong>${s.first_name} ${s.last_name}</strong><br>
            <span style="color: #6b7280; font-size: 13px;">${s.email}</span>
          </td>
          <td style="padding: 12px; vertical-align: top;">
            <span style="color: #374151;">${s.suburb || "Not set"}</span>
          </td>
          <td style="padding: 12px; text-align: center; vertical-align: top;">
            ${getStatusEmoji(s.onboarding_completed)}
          </td>
          <td style="padding: 12px; vertical-align: top;">
            <a href="${adminUrl}/users/${s.id}" style="color: #3b82f6; text-decoration: none; font-size: 13px;">View</a>
          </td>
        </tr>
      `)
      .join("");

    // Calculate conversion insights
    const ownerCompletionRate = stats.petOwners > 0 
      ? Math.round((stats.ownersCompleted / stats.petOwners) * 100) 
      : 0;
    const sitterCompletionRate = stats.sitters > 0 
      ? Math.round((stats.sittersCompleted / stats.sitters) * 100) 
      : 0;
    const ratio = stats.petOwners > 0 
      ? (stats.sitters / stats.petOwners).toFixed(1) 
      : "∞";

    const insights = [];
    if (stats.sitters > stats.petOwners * 2) {
      insights.push("⚠️ <strong>Sitter:Owner ratio is high</strong> - Consider increasing pet owner ad spend");
    }
    if (ownerCompletionRate < 20 && stats.petOwners > 0) {
      insights.push("⚠️ <strong>Low pet owner onboarding</strong> - Most owners are dropping off before completing");
    }
    if (stats.ownersWithSearches < stats.petOwners * 0.5 && stats.petOwners > 2) {
      insights.push("💡 <strong>Many owners didn't search</strong> - They may have signed up directly without exploring");
    }

    const insightsHtml = insights.length > 0 
      ? `
        <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; color: #92400e; font-size: 16px;">📊 Insights</h3>
          ${insights.map((i) => `<p style="margin: 8px 0; color: #78350f; font-size: 14px;">${i}</p>`).join("")}
        </div>
      `
      : "";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f3f4f6;">
        <div style="max-width: 700px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1a9bd7 0%, #0e7490 100%); padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Daily Signup Digest</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">
              Last ${hours} hours • ${new Date().toLocaleDateString("en-NZ", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          
          <!-- Stats -->
          <div style="display: flex; padding: 20px; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
            <div style="flex: 1; text-align: center; border-right: 1px solid #e5e7eb;">
              <div style="font-size: 28px; font-weight: bold; color: #1a9bd7;">${stats.total}</div>
              <div style="font-size: 12px; color: #6b7280; text-transform: uppercase;">Total Signups</div>
            </div>
            <div style="flex: 1; text-align: center; border-right: 1px solid #e5e7eb;">
              <div style="font-size: 28px; font-weight: bold; color: #10b981;">🐾 ${stats.petOwners}</div>
              <div style="font-size: 12px; color: #6b7280;">Pet Owners (${ownerCompletionRate}% completed)</div>
            </div>
            <div style="flex: 1; text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #8b5cf6;">👤 ${stats.sitters}</div>
              <div style="font-size: 12px; color: #6b7280;">Sitters (${sitterCompletionRate}% completed)</div>
            </div>
          </div>

          <div style="padding: 24px;">
            
            <!-- Ratio indicator -->
            <div style="background: #f0f9ff; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between;">
              <span style="color: #0369a1; font-size: 14px;">Sitter:Owner Ratio</span>
              <span style="font-weight: bold; color: ${parseFloat(ratio as string) > 2 ? '#dc2626' : '#059669'}; font-size: 18px;">${ratio}:1</span>
            </div>

            ${insightsHtml}

            ${stats.petOwners > 0 ? `
            <!-- Pet Owners Section -->
            <h2 style="color: #111827; font-size: 18px; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">
              🐾 Pet Owners (${stats.petOwners})
            </h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 14px;">
              <thead>
                <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                  <th style="padding: 12px; text-align: left; color: #6b7280; font-weight: 600;">User</th>
                  <th style="padding: 12px; text-align: left; color: #6b7280; font-weight: 600;">Search Intent</th>
                  <th style="padding: 12px; text-align: center; color: #6b7280; font-weight: 600;">Onboarded</th>
                  <th style="padding: 12px; text-align: left; color: #6b7280; font-weight: 600;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${petOwnerRows}
              </tbody>
            </table>
            ` : ""}

            ${stats.sitters > 0 ? `
            <!-- Sitters Section -->
            <h2 style="color: #111827; font-size: 18px; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">
              👤 Sitters (${stats.sitters})
            </h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                  <th style="padding: 12px; text-align: left; color: #6b7280; font-weight: 600;">User</th>
                  <th style="padding: 12px; text-align: left; color: #6b7280; font-weight: 600;">Service Area</th>
                  <th style="padding: 12px; text-align: center; color: #6b7280; font-weight: 600;">Onboarded</th>
                  <th style="padding: 12px; text-align: left; color: #6b7280; font-weight: 600;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${sitterRows}
              </tbody>
            </table>
            ` : ""}

            <!-- Quick Actions -->
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
              <a href="${adminUrl}/users" style="display: inline-block; background: #1a9bd7; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-right: 12px;">
                View All Users
              </a>
              <a href="${adminUrl}/conversion-funnel" style="display: inline-block; background: #f3f4f6; color: #374151; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Conversion Funnel
              </a>
            </div>

          </div>
          
          <!-- Footer -->
          <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
              ZiggySitters Admin Digest • Sent automatically daily
            </p>
          </div>
          
        </div>
      </body>
      </html>
    `;

    // Send email
    const { error: emailError } = await resend.emails.send({
      from: "ZiggySitters <hello@ziggysitters.com>",
      to: ["janamaia@gmail.com"],
      subject: `📊 Daily Signups: ${stats.petOwners} owners, ${stats.sitters} sitters (${ratio}:1 ratio)`,
      html,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw emailError;
    }

    console.log("Daily digest sent successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        stats,
        message: `Digest sent with ${stats.total} signups` 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-daily-signup-digest:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
