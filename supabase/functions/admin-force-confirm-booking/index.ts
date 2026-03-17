import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Retrieve authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    console.log('[FORCE-CONFIRM] User:', user.email);

    const { booking_id } = await req.json();
    if (!booking_id) throw new Error("Booking ID is required");

    console.log('[FORCE-CONFIRM] Force confirming booking:', booking_id);

    // Update booking using service role (bypasses RLS)
    const { data: booking, error: updateError } = await supabaseClient
      .from('bookings')
      .update({ 
        status: 'confirmed',
        payment_status: 'paid'
      })
      .eq('id', booking_id)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error('[FORCE-CONFIRM] Error updating booking:', updateError);
      throw new Error(`Failed to update booking: ${updateError.message}`);
    }

    if (!booking) {
      throw new Error('Booking not found after update');
    }

    console.log('[FORCE-CONFIRM] Booking updated successfully:', booking.booking_reference);

    // Record transaction for accounting
    const platformFee = booking.platform_fee || 0;
    const gstAmount = Math.round((platformFee / 1.15) * 0.15 * 100) / 100;

    await supabaseClient.from('transactions').insert({
      booking_id: booking.id,
      transaction_type: 'booking_payment',
      amount: booking.total_amount,
      gst_amount: gstAmount,
      platform_earnings: platformFee,
      description: `Manual confirmation for booking ${booking.booking_reference}`,
      metadata: {
        service_type: booking.service_type,
        start_date: booking.start_date,
        end_date: booking.end_date,
        manually_confirmed: true
      }
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Booking manually confirmed',
      booking_status: 'confirmed',
      payment_status: 'paid',
      booking_reference: booking.booking_reference
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('[FORCE-CONFIRM] Error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: (error as Error).message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
