import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  sessionId?: string;
  role?: string;
  suburb?: string;
  city?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, sessionId, role, suburb, city }: NewUserRequest = await req.json();
    console.log("=== NEW USER ADMIN NOTIFICATION ===");
    console.log("Email:", email, "Name:", firstName, lastName, "Role:", role, "Location:", suburb, city, "Session:", sessionId);

    // Get referrer and search info from session
    let referrer = 'Direct / Unknown';
    let searchInfo = '';
    let clickedSitters: { name: string; suburb: string; id: string }[] = [];
    let searchCount = 0;
    let zeroResultSearches = 0;
    
    if (sessionId) {
      // Check for search events to understand how they found us
      const { data: searches } = await supabase
        .from('search_events')
        .select('suburb, service_type, results_count, referrer, clicked_sitter_ids')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (searches && searches.length > 0) {
        searchCount = searches.length;
        zeroResultSearches = searches.filter(s => s.results_count === 0).length;
        
        searchInfo = searches.slice(0, 3).map(s => 
          `📍 ${s.suburb || 'No location'} - ${s.service_type || 'any service'} (${s.results_count || 0} results)`
        ).join('<br>');
        
        // Get referrer from first search
        const firstSearch = searches.find(s => s.referrer);
        if (firstSearch?.referrer) {
          try {
            referrer = new URL(firstSearch.referrer).hostname;
          } catch {
            referrer = firstSearch.referrer;
          }
        }
        
        // Collect all clicked sitter IDs
        const allClickedIds = searches
          .filter(s => s.clicked_sitter_ids?.length)
          .flatMap(s => s.clicked_sitter_ids)
          .filter((id, i, arr) => arr.indexOf(id) === i); // Unique
        
        if (allClickedIds.length > 0) {
          const { data: sitters } = await supabase
            .from('profiles')
            .select('id, first_name, suburb')
            .in('id', allClickedIds)
            .limit(5);
          
          if (sitters) {
            clickedSitters = sitters.map(s => ({
              name: s.first_name,
              suburb: s.suburb || 'Unknown',
              id: s.id
            }));
          }
        }
      }

      // Also check user_events for referrer
      const { data: events } = await supabase
        .from('user_events')
        .select('referrer')
        .eq('session_id', sessionId)
        .not('referrer', 'is', null)
        .limit(1);
      
      if (events && events.length > 0 && events[0].referrer) {
        try {
          referrer = new URL(events[0].referrer).hostname;
        } catch {
          referrer = events[0].referrer;
        }
      }
    }

    // Determine role styling
    const isPetOwner = role === 'pet_owner';
    const roleEmoji = isPetOwner ? '🐾' : (role === 'pet_sitter' ? '👤' : '❓');
    const roleLabel = isPetOwner ? 'Pet Owner' : (role === 'pet_sitter' ? 'Sitter' : 'Unknown Role');
    const roleColor = isPetOwner ? '#10b981' : '#8b5cf6';
    const roleBgColor = isPetOwner ? '#ecfdf5' : '#f5f3ff';
    
    // Create actionable subject line
    const subjectAction = isPetOwner 
      ? (searchCount > 0 ? `Searched ${searchCount}x` : 'Needs follow-up')
      : (suburb ? `in ${suburb}` : 'New area');
    
    // Build clicked sitters HTML
    const clickedSittersHtml = clickedSitters.length > 0
      ? `<div style="margin-top: 10px;">
          <strong>👀 Viewed Sitters:</strong><br>
          ${clickedSitters.map(s => 
            `<a href="https://ziggysitters.com/sitter/${s.id}" style="color: #3b82f6;">${s.name}</a> (${s.suburb})`
          ).join(', ')}
        </div>`
      : '';
    
    // Build search insights for pet owners
    const searchInsightsHtml = isPetOwner && searchCount > 0
      ? `<div style="background: ${zeroResultSearches > 0 ? '#fef2f2' : '#eff6ff'}; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid ${zeroResultSearches > 0 ? '#ef4444' : '#3b82f6'};">
          <h3 style="margin-top: 0; color: ${zeroResultSearches > 0 ? '#dc2626' : '#1e40af'}; font-size: 14px;">🔍 Search Behavior</h3>
          <p style="margin: 5px 0; font-size: 14px;"><strong>${searchCount}</strong> searches performed</p>
          ${zeroResultSearches > 0 ? `<p style="margin: 5px 0; color: #dc2626; font-size: 14px;">⚠️ <strong>${zeroResultSearches}</strong> searches with ZERO results!</p>` : ''}
          <div style="margin-top: 10px; font-size: 13px; color: #374151;">
            ${searchInfo || 'No specific searches recorded'}
          </div>
          ${clickedSittersHtml}
        </div>`
      : '';
    
    // Build action items
    const actionItems = [];
    if (isPetOwner) {
      if (zeroResultSearches > 0) {
        actionItems.push('🚨 Had zero results - consider reaching out to offer alternatives');
      }
      if (clickedSitters.length > 0) {
        actionItems.push(`💡 Viewed ${clickedSitters.length} sitter(s) - high intent, may need gentle nudge`);
      } else if (searchCount > 0) {
        actionItems.push('⚠️ Searched but didn\'t click any sitters - may need help finding right match');
      }
      if (searchCount === 0) {
        actionItems.push('❓ No search activity yet - send welcome email with search tips');
      }
    } else if (role === 'pet_sitter') {
      actionItems.push(`📍 Service area: ${suburb || 'Not set'}, ${city || 'Auckland'}`);
      actionItems.push('⏳ Will need to complete onboarding + Stripe setup');
    }
    
    const actionItemsHtml = actionItems.length > 0
      ? `<div style="background: #fef3c7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #f59e0b;">
          <h3 style="margin-top: 0; color: #92400e; font-size: 14px;">📋 Action Items</h3>
          ${actionItems.map(item => `<p style="margin: 5px 0; font-size: 13px; color: #78350f;">${item}</p>`).join('')}
        </div>`
      : '';

    // Send admin notification immediately on signup
    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <hello@ziggysitters.com>",
      to: ["janamaia@gmail.com"],
      subject: `${roleEmoji} ${roleLabel}: ${firstName} ${lastName} - ${subjectAction}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            
            <!-- Role Banner -->
            <div style="background: ${roleBgColor}; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px; display: flex; align-items: center;">
              <span style="font-size: 24px; margin-right: 10px;">${roleEmoji}</span>
              <div>
                <span style="font-weight: bold; color: ${roleColor}; font-size: 18px;">${roleLabel}</span>
                ${suburb ? `<span style="color: #6b7280; margin-left: 8px;">📍 ${suburb}</span>` : ''}
              </div>
            </div>
            
            <div style="background: #f9fafb; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>👤 Name:</strong> ${firstName} ${lastName}</p>
              <p style="margin: 5px 0;"><strong>📧 Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p style="margin: 5px 0;"><strong>🌐 Came from:</strong> ${referrer}</p>
              <p style="margin: 5px 0;"><strong>📅 Registered:</strong> ${new Date().toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' })}</p>
            </div>

            ${searchInsightsHtml}
            ${actionItemsHtml}

            <div style="text-align: center; margin-top: 20px;">
              <a href="https://ziggysitters.com/admin-dashboard" style="display: inline-block; background: #1a9bd7; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                View in Admin Dashboard
              </a>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Admin notification sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending admin notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
