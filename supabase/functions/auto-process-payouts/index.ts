import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AUTO-PROCESS-PAYOUTS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting automatic payout processing");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Find all completed bookings that haven't been paid out yet
    const { data: bookingsNeedingPayout, error: queryError } = await supabaseClient
      .from("bookings")
      .select(`
        id,
        booking_reference,
        end_date,
        payment_status,
        total_amount,
        platform_fee
      `)
      .eq("status", "completed")
      .eq("payment_status", "paid")
      .order("end_date", { ascending: true });

    if (queryError) {
      throw new Error(`Error querying bookings: ${queryError.message}`);
    }

    if (!bookingsNeedingPayout || bookingsNeedingPayout.length === 0) {
      logStep("No bookings requiring payout");
      return new Response(
        JSON.stringify({
          success: true,
          message: "No bookings requiring payout",
          processed: 0
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    logStep(`Found ${bookingsNeedingPayout.length} bookings needing payout`, {
      booking_ids: bookingsNeedingPayout.map(b => b.booking_reference)
    });

    const results = [];
    let successCount = 0;
    let failCount = 0;

    // Process each booking
    for (const booking of bookingsNeedingPayout) {
      try {
        logStep(`Processing payout for booking ${booking.booking_reference}`);
        
        // Call the process-booking-payout function
        const { data: payoutResult, error: payoutError } = await supabaseClient.functions.invoke(
          'process-booking-payout',
          {
            body: { booking_id: booking.id }
          }
        );

        if (payoutError) {
          throw payoutError;
        }

        logStep(`Successfully processed payout for ${booking.booking_reference}`, payoutResult);
        successCount++;
        results.push({
          booking_reference: booking.booking_reference,
          status: 'success',
          result: payoutResult
        });

      } catch (error) {
        logStep(`ERROR processing payout for ${booking.booking_reference}`, { error: (error as Error).message });
        failCount++;
        results.push({
          booking_reference: booking.booking_reference,
          status: 'failed',
          error: (error as Error).message
        });
      }
    }

    logStep("Automatic payout processing complete", {
      total: bookingsNeedingPayout.length,
      success: successCount,
      failed: failCount
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${successCount} payouts successfully, ${failCount} failed`,
        processed: successCount,
        failed: failCount,
        total: bookingsNeedingPayout.length,
        results
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    logStep("ERROR in auto-process-payouts", { error: error.message });
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
