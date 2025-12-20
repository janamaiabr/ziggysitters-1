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

interface WelcomeEmailRequest {
  email: string;
  firstName: string;
  role: string;
  sessionId?: string; // Optional session ID to link events
}

interface UserEvent {
  id: string;
  event_type: string;
  event_name: string;
  page_path: string;
  referrer: string | null;
  session_id: string;
  created_at: string;
  event_data: Record<string, any>;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function getEventIcon(eventType: string, eventName: string): string {
  const icons: Record<string, string> = {
    'page_view': '📄',
    'page_entered': '🚪',
    'page_exit': '🚶',
    'search': '🔍',
    'click': '👆',
    'form_start': '📝',
    'form_submit': '✅',
    'form_abandon': '❌',
    'engagement': '⏱️',
    'onboarding': '🎯',
    'action': '⚡',
  };
  
  if (eventName.includes('idle')) return '💤';
  if (eventName.includes('scroll')) return '📜';
  if (eventName.includes('click')) return '👆';
  if (eventName.includes('search')) return '🔍';
  if (eventName.includes('signup') || eventName.includes('register')) return '✨';
  if (eventName.includes('wizard')) return '🧙';
  
  return icons[eventType] || '•';
}

function formatEventName(eventName: string): string {
  return eventName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

async function buildUserJourneyHtml(profileId: string, sessionId?: string): Promise<{ html: string; summary: Record<string, any> }> {
  console.log("Building user journey for profile:", profileId, "session:", sessionId);
  
  // Get all events for this user OR their session
  let events: UserEvent[] = [];
  
  // First try to get events by user_id
  const { data: userEvents } = await supabase
    .from('user_events')
    .select('*')
    .eq('user_id', profileId)
    .order('created_at', { ascending: true });
  
  if (userEvents && userEvents.length > 0) {
    events = userEvents;
  }
  
  // Also get events by session_id if provided
  if (sessionId) {
    const { data: sessionEvents } = await supabase
      .from('user_events')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    
    if (sessionEvents && sessionEvents.length > 0) {
      // Merge and dedupe by id
      const existingIds = new Set(events.map(e => e.id));
      sessionEvents.forEach(e => {
        if (!existingIds.has(e.id)) {
          events.push(e);
        }
      });
      events.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
  }
  
  // Get FULL search events data including clicked sitters
  let searchEventsData: any[] = [];
  const { data: userSearchEvents } = await supabase
    .from('search_events')
    .select('*')
    .eq('user_id', profileId)
    .order('created_at', { ascending: true });
  
  if (userSearchEvents && userSearchEvents.length > 0) {
    searchEventsData = userSearchEvents;
    // Also get session from first search event to find pre-registration events
    if (userSearchEvents[0].session_id) {
      const { data: sessionSearchEvents } = await supabase
        .from('search_events')
        .select('*')
        .eq('session_id', userSearchEvents[0].session_id)
        .order('created_at', { ascending: true });
      
      if (sessionSearchEvents) {
        const existingIds = new Set(searchEventsData.map(e => e.id));
        sessionSearchEvents.forEach(e => {
          if (!existingIds.has(e.id)) {
            searchEventsData.push(e);
          }
        });
        searchEventsData.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      }
    }
  }
  
  // Also try direct session search if we have sessionId
  if (sessionId) {
    const { data: directSessionSearch } = await supabase
      .from('search_events')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    
    if (directSessionSearch) {
      const existingIds = new Set(searchEventsData.map(e => e.id));
      directSessionSearch.forEach(e => {
        if (!existingIds.has(e.id)) {
          searchEventsData.push(e);
        }
      });
      searchEventsData.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
  }
  
  // Get clicked sitter details
  const allClickedSitterIds = new Set<string>();
  searchEventsData.forEach(se => {
    if (se.clicked_sitter_ids && Array.isArray(se.clicked_sitter_ids)) {
      se.clicked_sitter_ids.forEach((id: string) => allClickedSitterIds.add(id));
    }
  });
  
  let clickedSittersInfo: { id: string; name: string; suburb: string }[] = [];
  if (allClickedSitterIds.size > 0) {
    const { data: sitterProfiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, suburb')
      .in('id', Array.from(allClickedSitterIds));
    
    if (sitterProfiles) {
      clickedSittersInfo = sitterProfiles.map(s => ({
        id: s.id,
        name: `${s.first_name} ${s.last_name}`,
        suburb: s.suburb || 'Unknown'
      }));
    }
  }
  
  // Also merge user_events from search sessions
  const searchSessionIds = new Set(searchEventsData.map(se => se.session_id).filter(Boolean));
  for (const sId of searchSessionIds) {
    const { data: additionalEvents } = await supabase
      .from('user_events')
      .select('*')
      .eq('session_id', sId)
      .order('created_at', { ascending: true });
    
    if (additionalEvents && additionalEvents.length > 0) {
      const existingIds = new Set(events.map(e => e.id));
      additionalEvents.forEach(e => {
        if (!existingIds.has(e.id)) {
          events.push(e);
        }
      });
    }
  }
  events.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  console.log("Found", events.length, "events,", searchEventsData.length, "searches,", clickedSittersInfo.length, "clicked sitters");

  const summary: Record<string, any> = {
    totalEvents: events.length,
    pagesViewed: new Set<string>(),
    referrer: null,
    firstSeen: null,
    lastSeen: null,
    timeOnSite: 0,
    maxScrollDepth: 0,
    searchCount: 0,
    clickCount: 0,
    formStarts: 0,
    formAbandons: 0,
    idleEvents: 0,
  };

  if (events.length === 0) {
    return {
      html: `
        <div style="background: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <h3 style="margin-top: 0; color: #b91c1c;">⚠️ No Journey Data Found</h3>
          <p style="margin: 0; color: #7f1d1d;">
            We couldn't find any tracked events for this user. This could mean:
          </p>
          <ul style="color: #7f1d1d; margin-bottom: 0;">
            <li>They registered very quickly without browsing</li>
            <li>They had ad blockers or tracking protection enabled</li>
            <li>They came from a direct link to the auth page</li>
          </ul>
        </div>
      `,
      summary
    };
  }

  // Process events for summary
  events.forEach(event => {
    if (event.page_path) {
      summary.pagesViewed.add(event.page_path);
    }
    if (event.referrer && !summary.referrer) {
      summary.referrer = event.referrer;
    }
    if (!summary.firstSeen) {
      summary.firstSeen = event.created_at;
    }
    summary.lastSeen = event.created_at;
    
    if (event.event_data?.scroll_depth > summary.maxScrollDepth) {
      summary.maxScrollDepth = event.event_data.scroll_depth;
    }
    if (event.event_type === 'search') summary.searchCount++;
    if (event.event_name.includes('click')) summary.clickCount++;
    if (event.event_name === 'form_start') summary.formStarts++;
    if (event.event_name === 'form_abandon') summary.formAbandons++;
    if (event.event_name === 'user_idle') summary.idleEvents++;
    if (event.event_data?.time_on_page) {
      summary.timeOnSite += event.event_data.time_on_page;
    }
  });

  // Calculate time on site from first to last event
  if (summary.firstSeen && summary.lastSeen) {
    const firstTime = new Date(summary.firstSeen).getTime();
    const lastTime = new Date(summary.lastSeen).getTime();
    summary.timeOnSite = Math.floor((lastTime - firstTime) / 1000);
  }

  summary.pagesViewed = Array.from(summary.pagesViewed);

  // Build summary section
  const summaryHtml = `
    <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #22c55e;">
      <h3 style="margin-top: 0; color: #166534;">📊 Session Summary</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 5px 10px 5px 0;"><strong>🌐 Came From:</strong></td>
          <td style="padding: 5px 0;">${summary.referrer ? `<a href="${summary.referrer}" style="color: #2563eb;">${new URL(summary.referrer).hostname}</a>` : 'Direct / Unknown'}</td>
        </tr>
        <tr>
          <td style="padding: 5px 10px 5px 0;"><strong>⏱️ Time on Site:</strong></td>
          <td style="padding: 5px 0;">${formatDuration(summary.timeOnSite)}</td>
        </tr>
        <tr>
          <td style="padding: 5px 10px 5px 0;"><strong>📄 Pages Viewed:</strong></td>
          <td style="padding: 5px 0;">${summary.pagesViewed.length} page(s)</td>
        </tr>
        <tr>
          <td style="padding: 5px 10px 5px 0;"><strong>🔍 Searches:</strong></td>
          <td style="padding: 5px 0;">${summary.searchCount}</td>
        </tr>
        <tr>
          <td style="padding: 5px 10px 5px 0;"><strong>👆 Clicks:</strong></td>
          <td style="padding: 5px 0;">${summary.clickCount}</td>
        </tr>
        <tr>
          <td style="padding: 5px 10px 5px 0;"><strong>📜 Max Scroll:</strong></td>
          <td style="padding: 5px 0;">${summary.maxScrollDepth}%</td>
        </tr>
        <tr>
          <td style="padding: 5px 10px 5px 0;"><strong>💤 Idle Events:</strong></td>
          <td style="padding: 5px 0;">${summary.idleEvents} (user was inactive)</td>
        </tr>
      </table>
    </div>
  `;

  // Build timeline
  const timelineItems = events.slice(0, 50).map((event, index) => {
    const time = new Date(event.created_at).toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const icon = getEventIcon(event.event_type, event.event_name);
    const name = formatEventName(event.event_name);
    
    let details = '';
    if (event.page_path && event.event_name === 'page_entered') {
      details = ` → ${event.page_path}`;
    }
    if (event.event_data?.scroll_depth) {
      details += ` (${event.event_data.scroll_depth}% scroll)`;
    }
    if (event.event_data?.time_on_page) {
      details += ` (${event.event_data.time_on_page}s on page)`;
    }
    if (event.event_data?.idle_duration_seconds) {
      details = ` (${event.event_data.idle_duration_seconds}s idle)`;
    }
    if (event.event_data?.search_location || event.event_data?.suburb) {
      details = ` for "${event.event_data.search_location || event.event_data.suburb}"`;
    }
    if (event.event_data?.element_text) {
      details = ` on "${event.event_data.element_text}"`;
    }
    if (event.event_data?.step) {
      details = ` - Step ${event.event_data.step}`;
    }
    
    const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
    
    return `
      <tr style="background: ${bgColor};">
        <td style="padding: 8px; font-size: 12px; color: #6b7280; white-space: nowrap;">${time}</td>
        <td style="padding: 8px; font-size: 14px;">${icon} ${name}${details}</td>
      </tr>
    `;
  }).join('');

  const timelineHtml = `
    <div style="background: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #334155;">📋 Full Journey Timeline (${events.length} events)</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background: #e2e8f0;">
            <th style="padding: 8px; text-align: left; font-size: 12px;">TIME</th>
            <th style="padding: 8px; text-align: left; font-size: 12px;">EVENT</th>
          </tr>
        </thead>
        <tbody>
          ${timelineItems}
        </tbody>
      </table>
      ${events.length > 50 ? `<p style="color: #6b7280; font-size: 12px; margin-top: 10px;">Showing first 50 events of ${events.length}</p>` : ''}
    </div>
  `;

  // Build SEARCH ACTIVITY section - critical for understanding intent
  let searchActivityHtml = '';
  if (searchEventsData.length > 0) {
    const searchRows = searchEventsData.map((se, idx) => {
      const time = new Date(se.created_at).toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const resultColor = se.results_count === 0 ? '#ef4444' : se.results_count > 0 ? '#22c55e' : '#6b7280';
      const resultText = se.results_count === 0 ? '🔴 0 results!' : se.results_count > 0 ? `✅ ${se.results_count} results` : '—';
      const serviceLabel = se.service_type || '(no service selected)';
      const clickedCount = se.clicked_sitter_ids?.length || 0;
      
      return `
        <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f9fafb'};">
          <td style="padding: 6px; font-size: 12px; color: #6b7280;">${time}</td>
          <td style="padding: 6px; font-size: 13px;">${se.suburb || 'Unknown'}</td>
          <td style="padding: 6px; font-size: 12px; color: #6b7280;">${serviceLabel}</td>
          <td style="padding: 6px; font-size: 13px; color: ${resultColor}; font-weight: 600;">${resultText}</td>
          <td style="padding: 6px; font-size: 13px;">${clickedCount > 0 ? `👆 ${clickedCount} click(s)` : '—'}</td>
        </tr>
      `;
    }).join('');
    
    const zeroResultSearches = searchEventsData.filter(se => se.results_count === 0).length;
    const totalSearches = searchEventsData.length;
    
    searchActivityHtml = `
      <div style="background: #eff6ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3b82f6;">
        <h3 style="margin-top: 0; color: #1e40af;">🔍 Search Activity (${totalSearches} searches${zeroResultSearches > 0 ? `, <span style="color: #ef4444;">${zeroResultSearches} with 0 results!</span>` : ''})</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background: #dbeafe;">
              <th style="padding: 6px; text-align: left; font-size: 11px;">TIME</th>
              <th style="padding: 6px; text-align: left; font-size: 11px;">LOCATION</th>
              <th style="padding: 6px; text-align: left; font-size: 11px;">SERVICE</th>
              <th style="padding: 6px; text-align: left; font-size: 11px;">RESULTS</th>
              <th style="padding: 6px; text-align: left; font-size: 11px;">CLICKS</th>
            </tr>
          </thead>
          <tbody>
            ${searchRows}
          </tbody>
        </table>
      </div>
    `;
  } else {
    searchActivityHtml = `
      <div style="background: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ef4444;">
        <h3 style="margin-top: 0; color: #b91c1c;">🔍 No Search Activity Recorded</h3>
        <p style="margin: 0; color: #7f1d1d;">User registered but never performed a search. They may have:</p>
        <ul style="color: #7f1d1d; margin-bottom: 0;">
          <li>Just created an account to explore later</li>
          <li>Got confused by the interface</li>
          <li>Had a technical issue</li>
        </ul>
      </div>
    `;
  }

  // Build CLICKED SITTERS section - who did they show interest in?
  let clickedSittersHtml = '';
  if (clickedSittersInfo.length > 0) {
    const sitterRows = clickedSittersInfo.map(s => `
      <tr>
        <td style="padding: 8px; font-size: 14px;"><strong>${s.name}</strong></td>
        <td style="padding: 8px; font-size: 13px; color: #6b7280;">${s.suburb}</td>
        <td style="padding: 8px;"><a href="https://ziggysitters.com/sitter/${s.id}" style="color: #2563eb; text-decoration: none;">View Profile →</a></td>
      </tr>
    `).join('');
    
    clickedSittersHtml = `
      <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #22c55e;">
        <h3 style="margin-top: 0; color: #166534;">💚 Sitters They Were Interested In (${clickedSittersInfo.length})</h3>
        <p style="color: #166534; margin-bottom: 10px;">These are the sitters they clicked on during their session:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #dcfce7;">
              <th style="padding: 8px; text-align: left; font-size: 12px;">SITTER NAME</th>
              <th style="padding: 8px; text-align: left; font-size: 12px;">LOCATION</th>
              <th style="padding: 8px; text-align: left; font-size: 12px;">PROFILE</th>
            </tr>
          </thead>
          <tbody>
            ${sitterRows}
          </tbody>
        </table>
      </div>
    `;
  }

  // Analysis / Drop-off reasons - ENHANCED with search context
  let analysisHtml = '';
  const issues: string[] = [];
  
  // Check for zero result searches - major drop-off indicator!
  const zeroResultSearches = searchEventsData.filter(se => se.results_count === 0);
  if (zeroResultSearches.length > 0) {
    issues.push(`🔴 Got 0 results ${zeroResultSearches.length} time(s) - this is a major frustration point!`);
  }
  
  // Check if they clicked sitters but didn't book
  if (clickedSittersInfo.length > 0) {
    issues.push(`💔 Clicked on ${clickedSittersInfo.length} sitter(s) but didn't book - what stopped them?`);
  }
  
  if (summary.timeOnSite < 30) {
    issues.push('⚡ Very short session - user left quickly');
  }
  if (summary.idleEvents > 2) {
    issues.push('💤 Multiple idle periods - user was distracted or confused');
  }
  if (searchEventsData.length === 0 && summary.pagesViewed.length < 3) {
    issues.push('🔍 No searches performed - may not have found the search feature');
  }
  if (summary.formAbandons > 0) {
    issues.push('❌ Form abandoned - onboarding friction detected');
  }
  if (summary.maxScrollDepth < 30 && summary.maxScrollDepth > 0) {
    issues.push('📜 Low scroll depth - content above the fold didn\'t engage');
  }

  if (issues.length > 0) {
    analysisHtml = `
      <div style="background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <h3 style="margin-top: 0; color: #92400e;">⚠️ Drop-off Analysis</h3>
        <ul style="margin: 0; padding-left: 20px; color: #78350f;">
          ${issues.map(i => `<li style="margin-bottom: 5px;">${i}</li>`).join('')}
        </ul>
      </div>
    `;
  } else {
    analysisHtml = `
      <div style="background: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3b82f6;">
        <h3 style="margin-top: 0; color: #1e40af;">✅ Session Looked Normal</h3>
        <p style="margin: 0; color: #1e3a8a;">No obvious issues detected. User may have just registered to explore later.</p>
      </div>
    `;
  }

  return {
    html: summaryHtml + searchActivityHtml + clickedSittersHtml + analysisHtml + timelineHtml,
    summary
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, role, sessionId }: WelcomeEmailRequest = await req.json();
    console.log("Sending welcome email to:", email, "Role:", role, "SessionId:", sessionId);

    // For SITTERS: Send the comprehensive sitter welcome email instead
    if (role === 'pet_sitter') {
      console.log("Triggering sitter-specific welcome email for:", email);
      
      try {
        const sitterWelcomeResponse = await fetch(`${supabaseUrl}/functions/v1/send-sitter-welcome`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            sitterEmail: email,
            sitterName: firstName || 'there',
            profileUrl: 'https://ziggysitters.com/profile',
          }),
        });

        if (sitterWelcomeResponse.ok) {
          console.log("Sitter welcome email sent successfully");
        } else {
          const errorText = await sitterWelcomeResponse.text();
          console.error("Failed to send sitter welcome email:", errorText);
        }
      } catch (sitterEmailError) {
        console.error("Error calling sitter welcome function:", sitterEmailError);
      }

      // Get sitter profile for journey data
      const { data: sitterProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      let journeyHtml = '<p style="color: #666;">No journey data available</p>';
      if (sitterProfile) {
        const { html } = await buildUserJourneyHtml(sitterProfile.id, sessionId);
        journeyHtml = html;
      }

      // Also notify admin about new sitter signup with journey
      try {
        await resend.emails.send({
          from: "ZiggySitters <hello@ziggysitters.com>",
          to: ["janamaia@gmail.com"],
          subject: `🆕 New Sitter Signup: ${firstName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
              <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #8B5CF6; margin-top: 0;">🆕 New Pet Sitter Registration</h2>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>Name:</strong> ${firstName}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Status:</strong> Just signed up - awaiting profile completion</p>
                </div>

                <h3 style="color: #374151; margin-top: 30px;">📊 User Journey Before Signup</h3>
                ${journeyHtml}

                <p style="color: #64748b; margin-top: 20px;">
                  They will receive automated reminders if they don't complete their profile.
                  You'll receive another notification when they upload verification documents.
                </p>
              </div>
            </div>
          `,
        });
        console.log("Admin notification sent for new sitter");
      } catch (adminError) {
        console.error("Failed to send admin notification:", adminError);
      }

      return new Response(JSON.stringify({ success: true, message: "Sitter welcome email sent" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // For PET OWNERS: Send standard welcome email
    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <hello@ziggysitters.com>",
      to: [email],
      subject: "Welcome to ZiggySitters! 🐾",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .btn { display: inline-block; padding: 12px 24px; background: #6366f1; color: white !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 5px; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">Welcome to ZiggySitters! 🎉</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Your trusted pet care community</p>
              </div>
              
              <div class="content">
                <h2 style="color: #111827;">Hi ${firstName}!</h2>
                <p style="color: #4b5563;">Thank you for joining ZiggySitters! We're excited to help you find the perfect care for your furry friends.</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
                  <p style="margin: 0; color: #4b5563;"><strong>What's next?</strong> Complete your profile and add your pets to start searching for trusted sitters in your area.</p>
                </div>

                <h3 style="color: #111827; margin-top: 30px;">Getting Started:</h3>
                <ul style="color: #4b5563; line-height: 1.8;">
                  <li>📝 <strong>Complete your profile</strong> with your contact details</li>
                  <li>🐾 <strong>Add your pets</strong> so sitters know who they'll be caring for</li>
                  <li>🔍 <strong>Search for sitters</strong> in your area</li>
                  <li>📅 <strong>Book with confidence</strong> - all sitters are verified</li>
                </ul>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://ziggysitters.com/profile" class="btn">Complete My Profile</a>
                </div>
              </div>

              <div class="footer">
                <p style="margin: 5px 0;">Questions? Contact us at hello@ziggysitters.com</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Pet owner welcome email sent successfully:", emailResponse);

    // Send admin notification for pet owners with FULL journey data
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      // Check if user has verified their email via auth.users
      const { data: authUser } = await supabase.auth.admin.getUserById(profile?.user_id);
      const emailConfirmed = authUser?.user?.email_confirmed_at ? true : false;
      const emailConfirmedAt = authUser?.user?.email_confirmed_at 
        ? new Date(authUser.user.email_confirmed_at).toLocaleString() 
        : null;

      // Build the full journey HTML
      let journeyHtml = '<p style="color: #666;">No journey data available</p>';
      let journeySummary: Record<string, any> = {};
      if (profile) {
        const journeyData = await buildUserJourneyHtml(profile.id, sessionId);
        journeyHtml = journeyData.html;
        journeySummary = journeyData.summary;
      }

      const { data: searches } = await supabase
        .from('search_events')
        .select('*')
        .eq('user_id', profile?.id)
        .order('search_timestamp', { ascending: false })
        .limit(5);

      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('owner_id', profile?.id);

      // Collect all clicked sitter IDs from searches
      const allClickedSitterIds: string[] = [];
      searches?.forEach(s => {
        if (s.clicked_sitter_ids?.length) {
          allClickedSitterIds.push(...s.clicked_sitter_ids);
        }
      });
      const uniqueClickedIds = [...new Set(allClickedSitterIds)];

      // Fetch sitter details for clicked sitters
      let clickedSittersHtml = '';
      if (uniqueClickedIds.length > 0) {
        const { data: clickedSitters } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, suburb, city')
          .in('id', uniqueClickedIds);
        
        if (clickedSitters && clickedSitters.length > 0) {
          clickedSittersHtml = `
            <div style="background: #fef9c3; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #eab308;">
              <h3 style="margin-top: 0; color: #854d0e;">👆 Clicked on ${clickedSitters.length} Sitter(s)</h3>
              <ul style="margin: 0; padding-left: 20px;">
                ${clickedSitters.map(s => 
                  `<li><strong>${s.first_name} ${s.last_name}</strong>${s.suburb ? ` - ${s.suburb}` : ''} 
                   <a href="https://ziggysitters.com/sitter/${s.id}" style="color: #2563eb;">[View Profile]</a></li>`
                ).join('')}
              </ul>
            </div>
          `;
        }
      }

      let searchSummary = 'No searches yet';
      if (searches && searches.length > 0) {
        searchSummary = searches.map(s => {
          const parts = [];
          if (s.suburb) parts.push(`📍 ${s.suburb}`);
          if (s.service_type) parts.push(`🛏️ ${s.service_type.replace(/_/g, ' ')}`);
          if (s.pet_species?.length) parts.push(`🐾 ${s.pet_species.join(', ')}`);
          parts.push(`(${new Date(s.search_timestamp).toLocaleString()})`);
          return parts.join(' | ') || 'Generic search';
        }).join('<br>');
      }

      const { data: pets } = await supabase
        .from('pets')
        .select('name, species, size')
        .eq('owner_id', profile?.id);

      let petsInfo = '<p style="color: #666;">🐾 No pets added yet (can add later when booking)</p>';
      if (pets && pets.length > 0) {
        petsInfo = `
          <h3>🐾 Pets Added (${pets.length})</h3>
          <ul>
            ${pets.map(p => `<li>${p.name} - ${p.species}${p.size ? ` (${p.size})` : ''}</li>`).join('')}
          </ul>
        `;
      }

      // Determine if this is a concerning drop-off
      const isConcerning = journeySummary.totalEvents < 5 || 
                          journeySummary.timeOnSite < 60 || 
                          (pets?.length === 0 && searches?.length === 0);

      await resend.emails.send({
        from: "ZiggySitters <hello@ziggysitters.com>",
        to: ["janamaia@gmail.com"],
        subject: `${isConcerning ? '⚠️' : '🏠'} New Pet Owner: ${firstName}${isConcerning ? ' (Quick Drop-off)' : ''}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #667eea; margin-top: 0;">👤 New Pet Owner Registration</h2>
              
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">📋 Basic Information</h3>
                <p style="margin: 5px 0;"><strong>Name:</strong> ${firstName}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 5px 0;"><strong>Email Verified:</strong> ${emailConfirmed 
                  ? `✅ Yes (${emailConfirmedAt})` 
                  : '❌ Not yet verified'}</p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> ${profile?.phone || '❌ Not provided'}</p>
                <p style="margin: 5px 0;"><strong>Location:</strong> ${profile?.suburb ? `${profile.suburb}, ${profile.city}` : '❌ Not provided'}</p>
                <p style="margin: 5px 0;"><strong>Registered:</strong> ${new Date().toLocaleString()}</p>
              </div>

              <h3 style="color: #374151; margin-top: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                📊 COMPLETE USER JOURNEY
              </h3>
              ${journeyHtml}

              ${petsInfo}

              <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">🔍 Search Activity</h3>
                <div style="font-size: 14px; line-height: 1.8;">
                  ${searchSummary}
                </div>
              </div>

              ${clickedSittersHtml}

              <div style="background: #fef3f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">📅 Bookings</h3>
                <p>${bookings && bookings.length > 0 ? `✅ Has ${bookings.length} booking(s)` : '❌ No bookings yet'}</p>
              </div>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center;">
                <a href="https://ziggysitters.com/admin/user-details/${profile?.id}" 
                   style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  View Full Profile
                </a>
                <a href="https://ziggysitters.com/admin/user-behavior" 
                   style="display: inline-block; padding: 12px 24px; background: #6b7280; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-left: 10px;">
                  View Analytics
                </a>
              </div>
            </div>
          </div>
        `,
      });
      console.log("Admin notification sent for new pet owner");
    } catch (adminError) {
      console.error("Failed to send admin notification:", adminError);
    }

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
