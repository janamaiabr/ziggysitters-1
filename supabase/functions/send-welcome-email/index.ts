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
  sessionId?: string;
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

interface SearchEvent {
  id: string;
  session_id: string;
  user_id: string | null;
  suburb: string | null;
  city: string | null;
  service_type: string | null;
  pet_species: string[] | null;
  pet_size: string[] | null;
  results_count: number | null;
  clicked_sitter_ids: string[] | null;
  created_at: string;
  search_timestamp: string;
  referrer: string | null;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function formatServiceType(serviceType: string | null): string {
  if (!serviceType) return 'Not specified';
  return serviceType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
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
  if (eventName.includes('sitter')) return '👤';
  if (eventName.includes('booking')) return '📅';
  
  return icons[eventType] || '•';
}

function formatEventName(eventName: string): string {
  return eventName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

async function buildUserJourneyHtml(profileId: string, sessionId?: string, role?: string): Promise<{ html: string; summary: Record<string, any> }> {
  const isSitter = role === 'pet_sitter';
  console.log("Building user journey for profile:", profileId, "session:", sessionId);
  
  // Collect all session IDs we need to check
  const sessionIdsToCheck = new Set<string>();
  if (sessionId) {
    sessionIdsToCheck.add(sessionId);
  }
  
  // STEP 1: Get ALL search events - by session first (this captures pre-registration searches)
  let searchEventsData: SearchEvent[] = [];
  
  // Get searches by session_id FIRST (most important - captures anonymous searches)
  if (sessionId) {
    console.log("Fetching search events by session_id:", sessionId);
    const { data: sessionSearches, error: sessionSearchError } = await supabase
      .from('search_events')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    
    if (sessionSearchError) {
      console.error("Error fetching session searches:", sessionSearchError);
    }
    if (sessionSearches && sessionSearches.length > 0) {
      console.log("Found", sessionSearches.length, "searches by session_id");
      searchEventsData = sessionSearches;
    }
  }
  
  // Also get by user_id (in case they made searches while logged in)
  const { data: userSearches, error: userSearchError } = await supabase
    .from('search_events')
    .select('*')
    .eq('user_id', profileId)
    .order('created_at', { ascending: true });
  
  if (userSearchError) {
    console.error("Error fetching user searches:", userSearchError);
  }
  if (userSearches && userSearches.length > 0) {
    console.log("Found", userSearches.length, "searches by user_id");
    const existingIds = new Set(searchEventsData.map(e => e.id));
    userSearches.forEach(e => {
      if (!existingIds.has(e.id)) {
        searchEventsData.push(e);
        if (e.session_id) sessionIdsToCheck.add(e.session_id);
      }
    });
  }
  
  // Add session IDs from search events to our check list
  searchEventsData.forEach(se => {
    if (se.session_id) sessionIdsToCheck.add(se.session_id);
  });
  
  console.log("Total session IDs to check:", Array.from(sessionIdsToCheck));
  console.log("Total search events found:", searchEventsData.length);
  
  // Sort searches by timestamp
  searchEventsData.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  
  // STEP 2: Get ALL clicked sitter details with FULL info
  const allClickedSitterIds = new Set<string>();
  searchEventsData.forEach(se => {
    if (se.clicked_sitter_ids && Array.isArray(se.clicked_sitter_ids)) {
      se.clicked_sitter_ids.forEach((id: string) => allClickedSitterIds.add(id));
    }
  });
  
  console.log("All clicked sitter IDs:", Array.from(allClickedSitterIds));
  
  let clickedSittersInfo: { id: string; name: string; suburb: string; city: string; rating: number | null }[] = [];
  if (allClickedSitterIds.size > 0) {
    const { data: sitterProfiles, error: sitterError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, suburb, city, rating')
      .in('id', Array.from(allClickedSitterIds));
    
    if (sitterError) {
      console.error("Error fetching sitter profiles:", sitterError);
    }
    if (sitterProfiles) {
      clickedSittersInfo = sitterProfiles.map(s => ({
        id: s.id,
        name: `${s.first_name} ${s.last_name}`,
        suburb: s.suburb || 'Unknown',
        city: s.city || '',
        rating: s.rating
      }));
      console.log("Found sitter profiles:", clickedSittersInfo.length);
    }
  }
  
  // STEP 3: Get all user events from all relevant sessions
  let events: UserEvent[] = [];
  
  // Get events by user_id first
  const { data: userEvents } = await supabase
    .from('user_events')
    .select('*')
    .eq('user_id', profileId)
    .order('created_at', { ascending: true });
  
  if (userEvents && userEvents.length > 0) {
    events = userEvents;
  }
  
  // Get events from ALL session IDs we've collected
  for (const sId of sessionIdsToCheck) {
    const { data: sessionEvents } = await supabase
      .from('user_events')
      .select('*')
      .eq('session_id', sId)
      .order('created_at', { ascending: true });
    
    if (sessionEvents && sessionEvents.length > 0) {
      const existingIds = new Set(events.map(e => e.id));
      sessionEvents.forEach(e => {
        if (!existingIds.has(e.id)) {
          events.push(e);
        }
      });
    }
  }
  
  // Sort all events by time
  events.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  
  console.log("Total user_events found:", events.length);

  const summary: Record<string, any> = {
    totalEvents: events.length,
    totalSearches: searchEventsData.length,
    pagesViewed: new Set<string>(),
    referrer: null,
    firstSeen: null,
    lastSeen: null,
    timeOnSite: 0,
    maxScrollDepth: 0,
    searchCount: searchEventsData.length,
    clickCount: 0,
    formStarts: 0,
    formAbandons: 0,
    idleEvents: 0,
    clickedSitters: clickedSittersInfo.length,
  };

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

  // If no events and no searches, show appropriate message
  if (events.length === 0 && searchEventsData.length === 0) {
    return {
      html: `
        <div style="background: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <h3 style="margin-top: 0; color: #b91c1c;">⚠️ No Journey Data Found</h3>
          <p style="margin: 0; color: #7f1d1d;">
            Session ID received: ${sessionId || 'NONE - this is the problem!'}<br>
            We couldn't find any tracked events. This could mean:
          </p>
          <ul style="color: #7f1d1d; margin-bottom: 0;">
            <li>Session ID wasn't passed correctly from frontend</li>
            <li>They had ad blockers or tracking protection enabled</li>
            <li>They came from a direct link and registered very quickly</li>
          </ul>
        </div>
      `,
      summary
    };
  }

  // Build summary section
  const summaryHtml = `
    <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #22c55e;">
      <h3 style="margin-top: 0; color: #166534;">📊 Session Summary</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 5px 10px 5px 0;"><strong>🌐 Came From:</strong></td>
          <td style="padding: 5px 0;">${summary.referrer ? `<a href="${summary.referrer}" style="color: #2563eb;">${(() => { try { return new URL(summary.referrer).hostname; } catch { return summary.referrer; } })()}</a>` : 'Direct / Unknown'}</td>
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
          <td style="padding: 5px 0; font-weight: bold; color: ${searchEventsData.length > 0 ? '#16a34a' : '#dc2626'};">${searchEventsData.length}</td>
        </tr>
        <tr>
          <td style="padding: 5px 10px 5px 0;"><strong>👆 Sitters Clicked:</strong></td>
          <td style="padding: 5px 0; font-weight: bold; color: ${clickedSittersInfo.length > 0 ? '#16a34a' : '#6b7280'};">${clickedSittersInfo.length}</td>
        </tr>
        <tr>
          <td style="padding: 5px 10px 5px 0;"><strong>📜 Max Scroll:</strong></td>
          <td style="padding: 5px 0;">${summary.maxScrollDepth}%</td>
        </tr>
      </table>
    </div>
  `;

  // Build DETAILED SEARCH ACTIVITY section (skip for sitters - they don't search)
  let searchActivityHtml = '';
  if (isSitter) {
    // Sitters don't search - show a positive note instead
    searchActivityHtml = `
      <div style="background: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3b82f6;">
        <h3 style="margin-top: 0; color: #1e40af;">🐕 Pet Sitter Registration</h3>
        <p style="margin: 0; color: #1e3a8a;">
          This user registered as a pet sitter. Search activity is not relevant for sitter registrations.
          <br><br>
          <strong>Next steps for this sitter:</strong> Complete profile, upload ID, set up services & Stripe.
        </p>
      </div>
    `;
  } else if (searchEventsData.length > 0) {
    const searchRows = searchEventsData.map((se, idx) => {
      const time = new Date(se.search_timestamp || se.created_at).toLocaleTimeString('en-NZ', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      });
      const resultColor = se.results_count === 0 ? '#ef4444' : se.results_count && se.results_count > 0 ? '#22c55e' : '#6b7280';
      const resultText = se.results_count === 0 ? '🔴 0 results!' : se.results_count && se.results_count > 0 ? `✅ ${se.results_count} found` : '—';
      const clickedCount = se.clicked_sitter_ids?.length || 0;
      
      // Build detailed search params
      const params: string[] = [];
      if (se.suburb) params.push(`📍 ${se.suburb}`);
      if (se.service_type) params.push(`🛏️ ${formatServiceType(se.service_type)}`);
      if (se.pet_species && se.pet_species.length > 0) {
        params.push(`🐾 ${se.pet_species.join(', ')}`);
      }
      if (se.pet_size && se.pet_size.length > 0) {
        params.push(`📏 ${se.pet_size.join(', ')}`);
      }
      
      return `
        <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f9fafb'}; vertical-align: top;">
          <td style="padding: 8px; font-size: 12px; color: #6b7280; white-space: nowrap;">${time}</td>
          <td style="padding: 8px; font-size: 13px;">
            <div style="margin-bottom: 4px;">${params.length > 0 ? params.join(' • ') : '<em style="color: #9ca3af;">No filters</em>'}</div>
          </td>
          <td style="padding: 8px; font-size: 13px; color: ${resultColor}; font-weight: 600; text-align: center;">${resultText}</td>
          <td style="padding: 8px; font-size: 13px; text-align: center;">${clickedCount > 0 ? `<span style="color: #16a34a; font-weight: bold;">👆 ${clickedCount}</span>` : '<span style="color: #9ca3af;">—</span>'}</td>
        </tr>
      `;
    }).join('');
    
    const zeroResultSearches = searchEventsData.filter(se => se.results_count === 0).length;
    
    searchActivityHtml = `
      <div style="background: #eff6ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3b82f6;">
        <h3 style="margin-top: 0; color: #1e40af;">🔍 Search Activity (${searchEventsData.length} searches${zeroResultSearches > 0 ? ` - <span style="color: #ef4444;">${zeroResultSearches} with 0 results!</span>` : ''})</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background: #dbeafe;">
              <th style="padding: 8px; text-align: left; font-size: 11px; width: 80px;">TIME</th>
              <th style="padding: 8px; text-align: left; font-size: 11px;">SEARCH PARAMETERS</th>
              <th style="padding: 8px; text-align: center; font-size: 11px; width: 90px;">RESULTS</th>
              <th style="padding: 8px; text-align: center; font-size: 11px; width: 70px;">CLICKED</th>
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
        <h3 style="margin-top: 0; color: #b91c1c;">🔍 No Search Activity Found</h3>
        <p style="margin: 0; color: #7f1d1d;">
          <strong>Debug info:</strong> Session ID = ${sessionId || 'NOT PROVIDED'}<br><br>
          User registered but no searches were linked. They may have:
        </p>
        <ul style="color: #7f1d1d; margin-bottom: 0;">
          <li>Just created an account to explore later</li>
          <li>Used a different session/browser before registering</li>
          <li>Had tracking blocked</li>
        </ul>
      </div>
    `;
  }

  // Build CLICKED SITTERS section with more detail
  let clickedSittersHtml = '';
  if (clickedSittersInfo.length > 0) {
    const sitterRows = clickedSittersInfo.map(s => {
      const ratingDisplay = s.rating ? `⭐ ${s.rating.toFixed(1)}` : '<span style="color: #9ca3af;">New</span>';
      return `
        <tr>
          <td style="padding: 10px; font-size: 14px;"><strong>${s.name}</strong></td>
          <td style="padding: 10px; font-size: 13px; color: #6b7280;">${s.suburb}${s.city ? `, ${s.city}` : ''}</td>
          <td style="padding: 10px; font-size: 13px;">${ratingDisplay}</td>
          <td style="padding: 10px;"><a href="https://ziggysitters.com/sitter/${s.id}" style="color: #2563eb; text-decoration: none; font-weight: 500;">View Profile →</a></td>
        </tr>
      `;
    }).join('');
    
    clickedSittersHtml = `
      <div style="background: #fef9c3; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #eab308;">
        <h3 style="margin-top: 0; color: #854d0e;">💛 Sitters They Clicked (${clickedSittersInfo.length})</h3>
        <p style="color: #854d0e; margin-bottom: 10px; font-size: 14px;">These are the sitters they showed interest in - they may want to book with one of them!</p>
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 5px;">
          <thead>
            <tr style="background: #fef08a;">
              <th style="padding: 10px; text-align: left; font-size: 12px;">SITTER NAME</th>
              <th style="padding: 10px; text-align: left; font-size: 12px;">LOCATION</th>
              <th style="padding: 10px; text-align: left; font-size: 12px;">RATING</th>
              <th style="padding: 10px; text-align: left; font-size: 12px;">PROFILE</th>
            </tr>
          </thead>
          <tbody>
            ${sitterRows}
          </tbody>
        </table>
      </div>
    `;
  }

  // Analysis / Drop-off reasons
  let analysisHtml = '';
  const issues: string[] = [];
  
  const zeroResultSearches = searchEventsData.filter(se => se.results_count === 0);
  // Skip search-related issues for sitters (they don't search)
  if (!isSitter) {
    if (zeroResultSearches.length > 0) {
      const locations = [...new Set(zeroResultSearches.map(s => s.suburb).filter(Boolean))];
      issues.push(`🔴 Got 0 results ${zeroResultSearches.length} time(s)${locations.length > 0 ? ` searching in: ${locations.join(', ')}` : ''}`);
    }
    
    if (clickedSittersInfo.length > 0) {
      issues.push(`💔 Clicked ${clickedSittersInfo.length} sitter(s) but didn't complete a booking - what stopped them?`);
    }
    
    if (searchEventsData.length === 0) {
      issues.push('🔍 No searches performed at all');
    }
  }
  
  if (summary.timeOnSite < 30) {
    issues.push('⚡ Very short session (<30 seconds)');
  }
  if (summary.idleEvents > 2) {
    issues.push('💤 Multiple idle periods - user seemed confused or distracted');
  }
  if (summary.formAbandons > 0) {
    issues.push('❌ Abandoned a form - friction in onboarding');
  }

  if (issues.length > 0) {
    analysisHtml = `
      <div style="background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <h3 style="margin-top: 0; color: #92400e;">⚠️ Potential Issues Detected</h3>
        <ul style="margin: 0; padding-left: 20px; color: #78350f;">
          ${issues.map(i => `<li style="margin-bottom: 5px;">${i}</li>`).join('')}
        </ul>
      </div>
    `;
  } else if (searchEventsData.length > 0 || events.length > 10) {
    analysisHtml = `
      <div style="background: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3b82f6;">
        <h3 style="margin-top: 0; color: #1e40af;">✅ Engaged User</h3>
        <p style="margin: 0; color: #1e3a8a;">This user showed good engagement with the platform.</p>
      </div>
    `;
  }

  // Build timeline (only key events, condensed)
  const keyEvents = events.filter(e => 
    e.event_name.includes('page') ||
    e.event_name.includes('search') ||
    e.event_name.includes('click') ||
    e.event_name.includes('sitter') ||
    e.event_name.includes('onboarding') ||
    e.event_name.includes('booking') ||
    e.event_name.includes('form') ||
    e.event_type === 'action'
  ).slice(0, 30);

  let timelineHtml = '';
  if (keyEvents.length > 0) {
    const timelineItems = keyEvents.map((event, index) => {
      const time = new Date(event.created_at).toLocaleTimeString('en-NZ', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      });
      const icon = getEventIcon(event.event_type, event.event_name);
      const name = formatEventName(event.event_name);
      
      let details = '';
      if (event.page_path && (event.event_name === 'page_entered' || event.event_name === 'page_view')) {
        details = ` → <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 12px;">${event.page_path}</code>`;
      }
      if (event.event_data?.sitter_name) {
        details = ` → <strong>${event.event_data.sitter_name}</strong>`;
      }
      if (event.event_data?.search_location || event.event_data?.suburb) {
        details = ` for "${event.event_data.search_location || event.event_data.suburb}"`;
      }
      if (event.event_data?.step) {
        details = ` - Step ${event.event_data.step}`;
      }
      
      const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
      
      return `
        <tr style="background: ${bgColor};">
          <td style="padding: 6px 10px; font-size: 11px; color: #6b7280; white-space: nowrap;">${time}</td>
          <td style="padding: 6px 10px; font-size: 13px;">${icon} ${name}${details}</td>
        </tr>
      `;
    }).join('');

    timelineHtml = `
      <div style="background: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #334155;">📋 Key Events Timeline</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tbody>
            ${timelineItems}
          </tbody>
        </table>
        ${events.length > keyEvents.length ? `<p style="color: #6b7280; font-size: 12px; margin: 10px 0 0 0;">Showing ${keyEvents.length} key events of ${events.length} total</p>` : ''}
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
    console.log("=== WELCOME EMAIL ===");
    console.log("Email:", email, "Role:", role, "SessionId:", sessionId);

    // For SITTERS: Send the comprehensive sitter welcome email
    if (role === 'pet_sitter') {
      console.log("Triggering sitter-specific welcome email");
      
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

        if (!sitterWelcomeResponse.ok) {
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
        const { html } = await buildUserJourneyHtml(sitterProfile.id, sessionId, 'pet_sitter');
        journeyHtml = html;
      }

      // Notify admin about new sitter
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
                </div>

                <h3 style="color: #374151; margin-top: 30px;">📊 User Journey</h3>
                ${journeyHtml}
              </div>
            </div>
          `,
        });
      } catch (adminError) {
        console.error("Failed to send admin notification:", adminError);
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // For PET OWNERS: Send welcome email
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
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">Welcome to ZiggySitters! 🎉</h1>
              </div>
              <div class="content">
                <h2 style="color: #111827;">Hi ${firstName}!</h2>
                <p>Thank you for joining! We're excited to help you find the perfect care for your furry friends.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://ziggysitters.com/find-sitters" class="btn">Find Sitters</a>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Pet owner welcome email sent");

    // Send detailed admin notification
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      // Build journey with session ID
      let journeyHtml = '<p style="color: #666;">No journey data available</p>';
      if (profile) {
        const journeyData = await buildUserJourneyHtml(profile.id, sessionId, role);
        journeyHtml = journeyData.html;
      }

      // Get pets
      const { data: pets } = await supabase
        .from('pets')
        .select('name, species, size')
        .eq('owner_id', profile?.id);

      let petsInfo = '<p style="color: #666;">🐾 No pets added yet</p>';
      if (pets && pets.length > 0) {
        petsInfo = `
          <h4 style="margin-bottom: 10px;">🐾 Pets Added (${pets.length})</h4>
          <ul style="margin: 0; padding-left: 20px;">
            ${pets.map(p => `<li>${p.name} - ${p.species}${p.size ? ` (${p.size})` : ''}</li>`).join('')}
          </ul>
        `;
      }

      await resend.emails.send({
        from: "ZiggySitters <hello@ziggysitters.com>",
        to: ["janamaia@gmail.com"],
        subject: `🏠 New Pet Owner: ${firstName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #667eea; margin-top: 0;">👤 New Pet Owner Registration</h2>
              
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Name:</strong> ${firstName}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 5px 0;"><strong>Location:</strong> ${profile?.suburb ? `${profile.suburb}, ${profile.city}` : 'Not provided'}</p>
                <p style="margin: 5px 0;"><strong>Session ID:</strong> <code>${sessionId || 'NOT PROVIDED'}</code></p>
              </div>

              <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                ${petsInfo}
              </div>

              <h3 style="color: #374151; margin-top: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                📊 COMPLETE USER JOURNEY
              </h3>
              ${journeyHtml}

              <div style="margin-top: 30px; text-align: center;">
                <a href="https://ziggysitters.com/admin/user-details/${profile?.id}" 
                   style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  View Full Profile
                </a>
              </div>
            </div>
          </div>
        `,
      });
      console.log("Admin notification sent");
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
