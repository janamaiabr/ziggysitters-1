import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AbandonedBookingRequest {
  user_id: string;
  email_number: 1 | 2; // Which email in the sequence
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const { user_id, email_number }: AbandonedBookingRequest = await req.json();
    
    console.log(`[ABANDONED-BOOKING] Processing email ${email_number} for user ${user_id}`);

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('first_name, email, id')
      .eq('id', user_id)
      .single();

    if (profileError || !profile) {
      throw new Error(`Profile not found: ${profileError?.message}`);
    }

    // Check if user already has a booking (don't send if they completed one)
    const { data: existingBookings } = await supabaseClient
      .from('bookings')
      .select('id')
      .eq('owner_id', user_id)
      .limit(1);

    if (existingBookings && existingBookings.length > 0) {
      console.log(`[ABANDONED-BOOKING] User ${user_id} already has bookings, skipping`);
      return new Response(JSON.stringify({ skipped: true, reason: 'already_has_bookings' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user's search history to find clicked sitters
    const { data: searchEvents } = await supabaseClient
      .from('search_events')
      .select('clicked_sitter_ids, suburb, city, service_type')
      .eq('user_id', user_id)
      .not('clicked_sitter_ids', 'is', null)
      .order('search_timestamp', { ascending: false })
      .limit(5);

    // Get user events to check for booking form opens
    const { data: bookingEvents } = await supabaseClient
      .from('user_events')
      .select('event_data, created_at')
      .eq('user_id', user_id)
      .eq('event_name', 'booking_form_opened')
      .order('created_at', { ascending: false })
      .limit(5);

    // Extract clicked sitter IDs
    const clickedSitterIds = new Set<string>();
    searchEvents?.forEach(event => {
      event.clicked_sitter_ids?.forEach((id: string) => clickedSitterIds.add(id));
    });

    // Get sitter details
    let sittersHtml = '';
    if (clickedSitterIds.size > 0) {
      const { data: sitters } = await supabaseClient
        .from('profiles')
        .select('id, first_name, last_name, suburb, avatar_url, rating, total_reviews')
        .in('id', Array.from(clickedSitterIds));

      if (sitters && sitters.length > 0) {
        sittersHtml = sitters.map(sitter => `
          <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 12px; background: #fafafa;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="60" valign="top">
                  <img src="${sitter.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(sitter.first_name)}" 
                       alt="${sitter.first_name}" 
                       width="50" height="50" 
                       style="border-radius: 50%; object-fit: cover;">
                </td>
                <td valign="top" style="padding-left: 12px;">
                  <div style="font-weight: 600; color: #1f2937; font-size: 16px;">${sitter.first_name} ${sitter.last_name?.charAt(0) || ''}.</div>
                  <div style="color: #6b7280; font-size: 14px;">${sitter.suburb || 'Auckland'}</div>
                  ${sitter.rating ? `<div style="color: #f59e0b; font-size: 14px;">★ ${sitter.rating} (${sitter.total_reviews} reviews)</div>` : ''}
                </td>
                <td width="120" align="right" valign="middle">
                  <a href="https://ziggysitters.com/sitter/${sitter.id}" 
                     style="background: #6366f1; color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-size: 14px;">
                    View Profile
                  </a>
                </td>
              </tr>
            </table>
          </div>
        `).join('');
      }
    }

    // Get search context
    const searchContext = searchEvents?.[0];
    const searchLocation = searchContext?.suburb || searchContext?.city || 'Auckland';
    const serviceType = searchContext?.service_type?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'pet sitting';

    // Different email content based on sequence number
    let subject: string;
    let headline: string;
    let bodyText: string;
    let ctaText: string;

    if (email_number === 1) {
      subject = `${profile.first_name}, your perfect pet sitter is waiting! 🐾`;
      headline = 'Still looking for a pet sitter?';
      bodyText = `We noticed you were checking out some great pet sitters in ${searchLocation}. Finding the right sitter for your furry friend is important - and we're here to help!`;
      ctaText = 'Complete Your Booking';
    } else {
      subject = `Last chance: Book your pet sitter in ${searchLocation}`;
      headline = "Don't miss out on great sitters!";
      bodyText = `Pet sitters in ${searchLocation} fill up fast, especially during busy periods. The sitters you viewed are still available - but we can't guarantee for how long.`;
      ctaText = 'Book Now Before They Fill Up';
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <div style="text-align: center; margin-bottom: 24px;">
          <img src="https://ziggysitters.com/logo-dark.png" alt="ZiggySitters" height="40" style="height: 40px;">
        </div>

        <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 16px;">${headline}</h1>
        
        <p style="margin-bottom: 20px;">Hi ${profile.first_name},</p>
        
        <p style="margin-bottom: 20px;">${bodyText}</p>

        ${sittersHtml ? `
          <div style="margin: 24px 0;">
            <h3 style="color: #1f2937; font-size: 16px; margin-bottom: 12px;">Sitters you were interested in:</h3>
            ${sittersHtml}
          </div>
        ` : ''}

        <div style="text-align: center; margin: 32px 0;">
          <a href="https://ziggysitters.com/find-sitters?suburb=${encodeURIComponent(searchLocation)}&service=${encodeURIComponent(searchContext?.service_type || 'house_sitting')}" 
             style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
            ${ctaText}
          </a>
        </div>

        <div style="background: #f0fdf4; border-radius: 12px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; color: #166534; font-size: 14px;">
            <strong>💡 Why book with ZiggySitters?</strong><br>
            ✅ Verified & background-checked sitters<br>
            ✅ Daily photo updates during your pet's stay<br>
            ✅ Secure payments with full protection<br>
            ✅ 24/7 support if you need us
          </p>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
          Have questions? Just reply to this email and we'll help you find the perfect sitter.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
        
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          ZiggySitters - Trusted Pet Care in Auckland<br>
          <a href="https://ziggysitters.com/unsubscribe?email=${encodeURIComponent(profile.email)}" style="color: #9ca3af;">Unsubscribe from these emails</a>
        </p>
      </body>
      </html>
    `;

    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: "ZiggySitters <hello@ziggysitters.com>",
      to: [profile.email],
      subject,
      html: emailHtml,
    });

    if (emailError) {
      throw new Error(`Email send failed: ${emailError.message}`);
    }

    console.log(`[ABANDONED-BOOKING] Email ${email_number} sent successfully to ${profile.email}`);

    return new Response(JSON.stringify({ 
      success: true, 
      email_id: emailResult?.id,
      email_number,
      sitters_included: clickedSitterIds.size
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("[ABANDONED-BOOKING] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
