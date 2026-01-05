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
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, sessionId }: NewUserRequest = await req.json();
    console.log("=== NEW USER ADMIN NOTIFICATION ===");
    console.log("Email:", email, "Name:", firstName, lastName, "Session:", sessionId);

    // Get referrer from session if available
    let referrer = 'Direct / Unknown';
    let searchInfo = 'No searches yet';
    
    if (sessionId) {
      // Check for search events to understand how they found us
      const { data: searches } = await supabase
        .from('search_events')
        .select('suburb, service_type, results_count, referrer')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (searches && searches.length > 0) {
        searchInfo = searches.map(s => 
          `📍 ${s.suburb || 'No location'} - ${s.service_type || 'any service'} (${s.results_count || '?'} results)`
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

    // Send admin notification immediately on signup
    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <hello@ziggysitters.com>",
      to: ["janamaia@gmail.com"],
      subject: `🆕 New Signup: ${firstName} ${lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #6366f1; margin-top: 0;">🆕 New User Registration</h2>
            
            <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #22c55e;">
              <p style="margin: 5px 0;"><strong>👤 Name:</strong> ${firstName} ${lastName}</p>
              <p style="margin: 5px 0;"><strong>📧 Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p style="margin: 5px 0;"><strong>🌐 Came from:</strong> ${referrer}</p>
              <p style="margin: 5px 0;"><strong>📅 Registered:</strong> ${new Date().toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' })}</p>
            </div>

            <div style="background: #eff6ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h3 style="margin-top: 0; color: #1e40af;">🔍 Search Activity Before Signup</h3>
              <p style="margin: 0; color: #374151; font-size: 14px;">
                ${searchInfo}
              </p>
            </div>

            <div style="background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>⏳ Note:</strong> This user just signed up. Role selection and onboarding status will be determined next.
                You'll receive another email with full journey details when they complete onboarding.
              </p>
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
