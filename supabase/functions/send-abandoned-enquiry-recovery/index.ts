import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AbandonedEnquiry {
  user_id: string;
  email: string;
  first_name: string;
  sitter_name: string | null;
  sitter_id: string | null;
  form_opened_at: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[AbandonedEnquiry] Starting abandoned enquiry check...");

    // Find users who:
    // 1. Opened the booking form (booking_form_viewed event)
    // 2. Did NOT send an enquiry within 24 hours
    // 3. Haven't been emailed in the last 3 days
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

    // Get form_viewed events from 24-72 hours ago
    const { data: formViewedEvents, error: eventsError } = await supabase
      .from("user_events")
      .select("user_id, event_data, created_at")
      .eq("event_name", "booking_form_viewed")
      .gte("created_at", threeDaysAgo)
      .lte("created_at", twentyFourHoursAgo)
      .not("user_id", "is", null);

    if (eventsError) {
      console.error("[AbandonedEnquiry] Error fetching events:", eventsError);
      throw eventsError;
    }

    console.log(`[AbandonedEnquiry] Found ${formViewedEvents?.length || 0} form view events`);

    if (!formViewedEvents || formViewedEvents.length === 0) {
      return new Response(
        JSON.stringify({ message: "No abandoned enquiries found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get unique user IDs
    const userIds = [...new Set(formViewedEvents.map(e => e.user_id).filter(Boolean))];

    // Check which users actually sent an enquiry
    const { data: enquirySent } = await supabase
      .from("user_events")
      .select("user_id")
      .in("user_id", userIds)
      .in("event_name", ["booking_request_sent", "enquiry_sent", "guest_enquiry_sent"]);

    const sentUserIds = new Set(enquirySent?.map(e => e.user_id) || []);

    // Filter to users who didn't complete
    const abandonedUserIds = userIds.filter(id => !sentUserIds.has(id));
    console.log(`[AbandonedEnquiry] ${abandonedUserIds.length} users abandoned the form`);

    if (abandonedUserIds.length === 0) {
      return new Response(
        JSON.stringify({ message: "No abandoned enquiries to email" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, first_name")
      .in("id", abandonedUserIds);

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No profiles found for abandoned users" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check email history to avoid spamming
    const { data: recentEmails } = await supabase
      .from("user_events")
      .select("user_id")
      .in("user_id", abandonedUserIds)
      .eq("event_name", "abandoned_enquiry_email_sent")
      .gte("created_at", threeDaysAgo);

    const recentlyEmailedIds = new Set(recentEmails?.map(e => e.user_id) || []);

    let emailsSent = 0;

    for (const profile of profiles) {
      if (recentlyEmailedIds.has(profile.id)) {
        console.log(`[AbandonedEnquiry] Skipping ${profile.email} - recently emailed`);
        continue;
      }

      // Get sitter info from their form view
      const formEvent = formViewedEvents.find(e => e.user_id === profile.id);
      const eventData = formEvent?.event_data as any;
      const sitterName = eventData?.sitter_name || "our sitters";
      const sitterId = eventData?.sitter_id;

      // Send recovery email
      try {
        const sitterLink = sitterId 
          ? `https://ziggysitters.com/sitter/${sitterId}?booking=true`
          : "https://ziggysitters.com/find-sitters";

        await resend.emails.send({
          from: "ZiggySitters <hello@ziggysitters.com>",
          to: [profile.email],
          subject: `Still looking for pet care? ${sitterName} is waiting! 🐾`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #7c3aed;">Hi ${profile.first_name || 'there'}! 👋</h1>
              
              <p>We noticed you were looking at booking ${sitterName} but didn't finish your enquiry.</p>
              
              <p><strong>Good news:</strong> Sending an enquiry is completely free and commits you to nothing. It's just a way to start a conversation!</p>
              
              <div style="background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
                <a href="${sitterLink}" style="display: inline-block; background: white; color: #7c3aed; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                  Complete Your Enquiry →
                </a>
              </div>
              
              <p>💡 <strong>Why send an enquiry?</strong></p>
              <ul>
                <li>✓ No payment required</li>
                <li>✓ No commitment until you're ready</li>
                <li>✓ Sitters typically respond within 24 hours</li>
                <li>✓ You can ask questions and arrange a meet-and-greet</li>
              </ul>
              
              <p>Your pet deserves the best care - let's make it happen!</p>
              
              <p style="color: #666; font-size: 14px;">
                The ZiggySitters Team 🐕
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #999; font-size: 12px;">
                You received this email because you started an enquiry on ZiggySitters. 
                <a href="https://ziggysitters.com/profile">Manage preferences</a>
              </p>
            </div>
          `,
        });

        // Log that we sent the email
        await supabase.from("user_events").insert({
          user_id: profile.id,
          event_type: "email",
          event_name: "abandoned_enquiry_email_sent",
          event_data: { sitter_name: sitterName, sitter_id: sitterId },
          page_path: "/email/abandoned-enquiry",
        });

        emailsSent++;
        console.log(`[AbandonedEnquiry] Sent recovery email to ${profile.email}`);
      } catch (emailError) {
        console.error(`[AbandonedEnquiry] Failed to send email to ${profile.email}:`, emailError);
      }
    }

    console.log(`[AbandonedEnquiry] Completed. Sent ${emailsSent} recovery emails.`);

    return new Response(
      JSON.stringify({ success: true, emailsSent }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[AbandonedEnquiry] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
