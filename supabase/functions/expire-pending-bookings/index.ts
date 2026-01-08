import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// This function expires pending bookings after 3 days if sitter hasn't responded
// Also expires bookings where the start_date has already passed

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    console.log("[EXPIRE-BOOKINGS] Starting pending booking expiry check...");

    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const today = now.toISOString().split('T')[0];

    // Find pending bookings that are:
    // 1. Created more than 3 days ago (sitter never responded)
    // 2. OR the start_date has already passed
    const { data: expiredBookings, error: fetchError } = await supabaseClient
      .from('bookings')
      .select(`
        id,
        booking_reference,
        owner_id,
        sitter_id,
        service_type,
        start_date,
        end_date,
        total_amount,
        created_at
      `)
      .eq('status', 'pending')
      .or(`created_at.lt.${threeDaysAgo.toISOString()},start_date.lt.${today}`);

    if (fetchError) {
      throw new Error(`Failed to fetch pending bookings: ${fetchError.message}`);
    }

    console.log(`[EXPIRE-BOOKINGS] Found ${expiredBookings?.length || 0} bookings to expire`);

    if (!expiredBookings || expiredBookings.length === 0) {
      return new Response(JSON.stringify({ expired: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: any[] = [];

    for (const booking of expiredBookings) {
      try {
        // Get owner and sitter details
        const { data: owner } = await supabaseClient
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', booking.owner_id)
          .single();

        const { data: sitter } = await supabaseClient
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', booking.sitter_id)
          .single();

        // Determine reason for expiry
        const startDatePassed = booking.start_date < today;
        const expiryReason = startDatePassed 
          ? 'Start date has passed without sitter response'
          : 'Sitter did not respond within 3 days';

        // Update booking status to expired
        const { error: updateError } = await supabaseClient
          .from('bookings')
          .update({ 
            status: 'cancelled',
            sitter_notes: `Auto-expired: ${expiryReason}`
          })
          .eq('id', booking.id);

        if (updateError) {
          console.error(`[EXPIRE-BOOKINGS] Failed to expire ${booking.booking_reference}:`, updateError);
          results.push({ booking_reference: booking.booking_reference, success: false, error: updateError.message });
          continue;
        }

        // Send expiry notification to owner
        if (owner?.email) {
          await supabaseClient.functions.invoke('send-booking-expiry-notification', {
            body: {
              owner_email: owner.email,
              owner_name: `${owner.first_name} ${owner.last_name}`,
              sitter_name: sitter ? `${sitter.first_name} ${sitter.last_name}` : 'The sitter',
              service_type: booking.service_type,
              start_date: booking.start_date,
              end_date: booking.end_date,
              booking_reference: booking.booking_reference,
              total_amount: booking.total_amount,
              expiry_reason: expiryReason
            }
          }).catch(err => console.error(`[EXPIRE-BOOKINGS] Failed to send owner notification:`, err));
        }

        // Send admin notification
        await supabaseClient.functions.invoke('send-admin-status-update', {
          body: {
            booking_reference: booking.booking_reference,
            old_status: 'pending',
            new_status: 'expired',
            owner_name: owner ? `${owner.first_name} ${owner.last_name}` : 'Unknown',
            owner_email: owner?.email,
            sitter_name: sitter ? `${sitter.first_name} ${sitter.last_name}` : 'Unknown',
            sitter_email: sitter?.email,
            service_type: booking.service_type,
            start_date: booking.start_date,
            end_date: booking.end_date,
            total_amount: booking.total_amount,
            additional_info: `Auto-expired: ${expiryReason}`
          }
        }).catch(err => console.error(`[EXPIRE-BOOKINGS] Failed to send admin notification:`, err));

        console.log(`[EXPIRE-BOOKINGS] Expired ${booking.booking_reference}: ${expiryReason}`);
        results.push({ booking_reference: booking.booking_reference, success: true, reason: expiryReason });

      } catch (err: any) {
        console.error(`[EXPIRE-BOOKINGS] Exception processing ${booking.booking_reference}:`, err);
        results.push({ booking_reference: booking.booking_reference, success: false, error: err.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`[EXPIRE-BOOKINGS] Completed. Expired ${successCount} of ${expiredBookings.length} bookings.`);

    return new Response(JSON.stringify({ 
      expired: successCount,
      total: expiredBookings.length,
      results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("[EXPIRE-BOOKINGS] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
