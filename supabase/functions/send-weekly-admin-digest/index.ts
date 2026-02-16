import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QueuedEvent {
  id: string;
  event_type: string;
  event_data: Record<string, any>;
  created_at: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all pending events from the queue
    const { data: events, error: fetchError } = await supabase
      .from("admin_event_queue")
      .select("*")
      .is("included_in_digest_at", null)
      .order("created_at", { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch events: ${fetchError.message}`);
    }

    if (!events || events.length === 0) {
      console.log("No events to include in digest");
      return new Response(
        JSON.stringify({ success: true, message: "No events to digest" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Group events by type
    const eventsByType: Record<string, QueuedEvent[]> = {};
    for (const event of events) {
      if (!eventsByType[event.event_type]) {
        eventsByType[event.event_type] = [];
      }
      eventsByType[event.event_type].push(event);
    }

    // Generate HTML sections for each event type
    const sections: string[] = [];

    // New Users Section
    if (eventsByType["new_user"]) {
      const users = eventsByType["new_user"];
      const petOwners = users.filter(e => e.event_data.role === "pet_owner");
      const sitters = users.filter(e => e.event_data.role === "pet_sitter");
      
      sections.push(`
        <div style="margin-bottom: 30px; padding: 20px; background: #f0fdf4; border-radius: 12px; border-left: 4px solid #22c55e;">
          <h2 style="margin: 0 0 15px 0; color: #166534; font-size: 18px;">👤 New Signups (${users.length})</h2>
          <p style="margin: 5px 0; color: #15803d;"><strong>Pet Owners:</strong> ${petOwners.length} | <strong>Sitters:</strong> ${sitters.length}</p>
          <div style="margin-top: 15px; max-height: 300px; overflow-y: auto;">
            ${users.slice(0, 20).map(u => `
              <div style="padding: 8px; background: white; border-radius: 6px; margin-bottom: 8px;">
                <strong>${u.event_data.firstName} ${u.event_data.lastName}</strong>
                <span style="color: #6b7280; font-size: 12px;"> (${u.event_data.role === 'pet_sitter' ? '🐕 Sitter' : '🏠 Owner'})</span>
                <br><span style="color: #6b7280; font-size: 12px;">${u.event_data.email}</span>
                ${u.event_data.suburb ? `<br><span style="color: #6b7280; font-size: 12px;">📍 ${u.event_data.suburb}, ${u.event_data.city || 'Auckland'}</span>` : ''}
              </div>
            `).join('')}
            ${users.length > 20 ? `<p style="color: #6b7280; font-size: 12px;">...and ${users.length - 20} more</p>` : ''}
          </div>
        </div>
      `);
    }

    // New Bookings Section
    if (eventsByType["new_booking"]) {
      const bookings = eventsByType["new_booking"];
      const totalValue = bookings.reduce((sum, b) => sum + (parseFloat(b.event_data.total_amount) || 0), 0);
      
      sections.push(`
        <div style="margin-bottom: 30px; padding: 20px; background: #eff6ff; border-radius: 12px; border-left: 4px solid #3b82f6;">
          <h2 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px;">📋 New Booking Requests (${bookings.length})</h2>
          <p style="margin: 5px 0; color: #1d4ed8;"><strong>Total Value:</strong> $${totalValue.toFixed(2)} NZD</p>
          <div style="margin-top: 15px; max-height: 300px; overflow-y: auto;">
            ${bookings.slice(0, 15).map(b => `
              <div style="padding: 8px; background: white; border-radius: 6px; margin-bottom: 8px;">
                <strong>${b.event_data.booking_reference}</strong>
                <span style="color: #6b7280; font-size: 12px;"> - $${b.event_data.total_amount}</span>
                <br><span style="color: #6b7280; font-size: 12px;">${b.event_data.owner_name} → ${b.event_data.sitter_name}</span>
                <br><span style="color: #6b7280; font-size: 12px;">${b.event_data.service_type?.replace(/_/g, ' ')}</span>
              </div>
            `).join('')}
            ${bookings.length > 15 ? `<p style="color: #6b7280; font-size: 12px;">...and ${bookings.length - 15} more</p>` : ''}
          </div>
        </div>
      `);
    }

    // Booking Status Updates Section
    if (eventsByType["booking_status_update"]) {
      const updates = eventsByType["booking_status_update"];
      const statusCounts: Record<string, number> = {};
      updates.forEach(u => {
        const status = u.event_data.new_status || 'unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      
      sections.push(`
        <div style="margin-bottom: 30px; padding: 20px; background: #fefce8; border-radius: 12px; border-left: 4px solid #eab308;">
          <h2 style="margin: 0 0 15px 0; color: #854d0e; font-size: 18px;">🔄 Booking Status Updates (${updates.length})</h2>
          <div style="margin: 10px 0;">
            ${Object.entries(statusCounts).map(([status, count]) => `
              <span style="display: inline-block; padding: 4px 10px; margin: 2px; background: white; border-radius: 15px; font-size: 12px;">
                ${status}: ${count}
              </span>
            `).join('')}
          </div>
        </div>
      `);
    }

    // Document Submissions Section
    if (eventsByType["document_submitted"]) {
      const docs = eventsByType["document_submitted"];
      
      sections.push(`
        <div style="margin-bottom: 30px; padding: 20px; background: #faf5ff; border-radius: 12px; border-left: 4px solid #a855f7;">
          <h2 style="margin: 0 0 15px 0; color: #7e22ce; font-size: 18px;">📄 Documents Pending Review (${docs.length})</h2>
          <div style="margin-top: 15px;">
            ${docs.slice(0, 10).map(d => `
              <div style="padding: 8px; background: white; border-radius: 6px; margin-bottom: 8px;">
                <strong>${d.event_data.sitter_name}</strong>
                <span style="color: #6b7280; font-size: 12px;"> - ${d.event_data.document_type}</span>
              </div>
            `).join('')}
            ${docs.length > 10 ? `<p style="color: #6b7280; font-size: 12px;">...and ${docs.length - 10} more</p>` : ''}
          </div>
          <a href="https://ziggysitters.lovable.app/admin/documents" style="display: inline-block; margin-top: 10px; padding: 8px 16px; background: #a855f7; color: white; border-radius: 6px; text-decoration: none; font-size: 14px;">Review Documents →</a>
        </div>
      `);
    }

    // Contact Form Submissions Section
    if (eventsByType["contact_form"]) {
      const contacts = eventsByType["contact_form"];
      
      sections.push(`
        <div style="margin-bottom: 30px; padding: 20px; background: #fff7ed; border-radius: 12px; border-left: 4px solid #f97316;">
          <h2 style="margin: 0 0 15px 0; color: #c2410c; font-size: 18px;">✉️ Contact Form Submissions (${contacts.length})</h2>
          <div style="margin-top: 15px;">
            ${contacts.slice(0, 5).map(c => `
              <div style="padding: 8px; background: white; border-radius: 6px; margin-bottom: 8px;">
                <strong>${c.event_data.name}</strong>
                <span style="color: #6b7280; font-size: 12px;"> - ${c.event_data.email}</span>
                <br><span style="color: #6b7280; font-size: 13px;">${c.event_data.subject || 'No subject'}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `);
    }

    // Summary stats
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekEnd = new Date();

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 650px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px;">📊 Weekly Admin Digest</h1>
            <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
              ${weekStart.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="padding: 15px; background: #f8fafc; border-radius: 10px; margin-bottom: 25px; text-align: center;">
              <h3 style="margin: 0 0 10px 0; color: #334155; font-size: 16px;">Week Summary</h3>
              <p style="margin: 0; color: #64748b; font-size: 14px;">
                <strong>${events.length}</strong> total events queued
              </p>
            </div>
            
            ${sections.length > 0 ? sections.join('') : '<p style="text-align: center; color: #6b7280;">No significant events this week.</p>'}
            
            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <a href="https://ziggysitters.lovable.app/admin" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Open Admin Dashboard
              </a>
            </div>
          </div>
          
          <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
            ZiggySitters Weekly Digest • Sent every Monday
          </p>
        </div>
      </body>
      </html>
    `;

    // Send the digest email
    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <hello@ziggysitters.com>",
      to: ["janamaia@gmail.com"],
      subject: `📊 Weekly Digest: ${eventsByType["new_user"]?.length || 0} signups, ${eventsByType["new_booking"]?.length || 0} bookings`,
      html,
    });

    console.log("Weekly digest sent:", emailResponse);

    // Mark all events as included in digest
    const eventIds = events.map(e => e.id);
    const { error: updateError } = await supabase
      .from("admin_event_queue")
      .update({ included_in_digest_at: new Date().toISOString() })
      .in("id", eventIds);

    if (updateError) {
      console.error("Failed to mark events as processed:", updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        eventsProcessed: events.length,
        emailId: emailResponse.id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error sending weekly digest:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
