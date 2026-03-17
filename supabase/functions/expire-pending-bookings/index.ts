import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    console.log("[EXPIRE-BOOKINGS] Starting booking expiry check...");

    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const today = now.toISOString().split('T')[0];
    const results: any[] = [];

    // ========== 1. Expire PENDING bookings ==========
    // Pending > 3 days old OR start_date has passed
    const { data: pendingBookings, error: pendingError } = await supabaseClient
      .from('bookings')
      .select('id, booking_reference, owner_id, sitter_id, service_type, start_date, end_date, total_amount, created_at')
      .eq('status', 'pending')
      .or(`created_at.lt.${threeDaysAgo.toISOString()},start_date.lt.${today}`);

    if (pendingError) throw new Error(`Failed to fetch pending bookings: ${pendingError.message}`);
    console.log(`[EXPIRE-BOOKINGS] Found ${pendingBookings?.length || 0} pending bookings to expire`);

    // ========== 2. Cancel CONFIRMED bookings past end_date ==========
    // These were accepted but never started/completed
    const { data: staleConfirmed, error: confirmedError } = await supabaseClient
      .from('bookings')
      .select('id, booking_reference, owner_id, sitter_id, service_type, start_date, end_date, total_amount, created_at')
      .eq('status', 'confirmed')
      .lt('end_date', today);

    if (confirmedError) throw new Error(`Failed to fetch confirmed bookings: ${confirmedError.message}`);
    console.log(`[EXPIRE-BOOKINGS] Found ${staleConfirmed?.length || 0} stale confirmed bookings`);

    // ========== 3. Cancel AWAITING_PAYMENT bookings past end_date or > 24h old ==========
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const { data: stalePayment, error: paymentError } = await supabaseClient
      .from('bookings')
      .select('id, booking_reference, owner_id, sitter_id, service_type, start_date, end_date, total_amount, created_at, updated_at')
      .eq('status', 'awaiting_payment')
      .or(`end_date.lt.${today},updated_at.lt.${oneDayAgo.toISOString()}`);

    if (paymentError) throw new Error(`Failed to fetch awaiting_payment bookings: ${paymentError.message}`);
    console.log(`[EXPIRE-BOOKINGS] Found ${stalePayment?.length || 0} stale awaiting_payment bookings`);

    // Process all categories
    const allBookings = [
      ...(pendingBookings || []).map(b => ({ ...b, originalStatus: 'pending', reason: b.start_date < today ? 'Start date passed without sitter response' : 'Sitter did not respond within 3 days' })),
      ...(staleConfirmed || []).map(b => ({ ...b, originalStatus: 'confirmed', reason: 'Booking end date passed without being started or completed' })),
      ...(stalePayment || []).map(b => ({ ...b, originalStatus: 'awaiting_payment', reason: b.end_date < today ? 'Booking end date passed without payment' : 'Payment not received within 24 hours of acceptance' })),
    ];

    for (const booking of allBookings) {
      try {
        const { data: owner } = await supabaseClient
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', booking.owner_id)
          .maybeSingle();

        const { data: sitter } = await supabaseClient
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', booking.sitter_id)
          .maybeSingle();

        const { error: updateError } = await supabaseClient
          .from('bookings')
          .update({
            status: 'cancelled',
            sitter_notes: `Auto-expired: ${booking.reason} (was ${booking.originalStatus})`
          })
          .eq('id', booking.id);

        if (updateError) {
          console.error(`[EXPIRE-BOOKINGS] Failed to expire ${booking.booking_reference}:`, updateError);
          results.push({ booking_reference: booking.booking_reference, success: false, error: updateError.message });
          continue;
        }

        // Send notification to owner
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
              expiry_reason: booking.reason
            }
          }).catch(err => console.error(`[EXPIRE-BOOKINGS] Notification error:`, err));
        }

        // Admin notification
        await supabaseClient.functions.invoke('send-admin-status-update', {
          body: {
            booking_reference: booking.booking_reference,
            old_status: booking.originalStatus,
            new_status: 'expired',
            owner_name: owner ? `${owner.first_name} ${owner.last_name}` : 'Unknown',
            owner_email: owner?.email,
            sitter_name: sitter ? `${sitter.first_name} ${sitter.last_name}` : 'Unknown',
            sitter_email: sitter?.email,
            service_type: booking.service_type,
            start_date: booking.start_date,
            end_date: booking.end_date,
            total_amount: booking.total_amount,
            additional_info: `Auto-expired: ${booking.reason}`
          }
        }).catch(err => console.error(`[EXPIRE-BOOKINGS] Admin notification error:`, err));

        console.log(`[EXPIRE-BOOKINGS] Expired ${booking.booking_reference} (${booking.originalStatus}): ${booking.reason}`);
        results.push({ booking_reference: booking.booking_reference, success: true, reason: booking.reason, was: booking.originalStatus });

      } catch (err: any) {
        console.error(`[EXPIRE-BOOKINGS] Exception processing ${booking.booking_reference}:`, err);
        results.push({ booking_reference: booking.booking_reference, success: false, error: err.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`[EXPIRE-BOOKINGS] Done. Expired ${successCount}/${allBookings.length} bookings.`);

    return new Response(JSON.stringify({
      expired: successCount,
      total: allBookings.length,
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
