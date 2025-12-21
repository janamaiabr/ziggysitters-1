import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// This function runs on a schedule to find and email users who:
// 1. Opened the booking form but didn't complete a booking
// 2. Haven't received an abandoned booking email yet (or are due for the 2nd)

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
    console.log("[CHECK-ABANDONED] Starting abandoned booking check...");

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    // Find users who opened booking form in the last 24-48 hours
    // but haven't made a booking
    const { data: bookingFormEvents, error: eventsError } = await supabaseClient
      .from('user_events')
      .select('user_id, created_at')
      .eq('event_name', 'booking_form_opened')
      .not('user_id', 'is', null)
      .gte('created_at', threeDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (eventsError) {
      throw new Error(`Failed to fetch events: ${eventsError.message}`);
    }

    console.log(`[CHECK-ABANDONED] Found ${bookingFormEvents?.length || 0} booking form open events`);

    // Get unique user IDs
    const userEventMap = new Map<string, Date>();
    bookingFormEvents?.forEach(event => {
      if (!userEventMap.has(event.user_id)) {
        userEventMap.set(event.user_id, new Date(event.created_at));
      }
    });

    const userIds = Array.from(userEventMap.keys());
    if (userIds.length === 0) {
      console.log("[CHECK-ABANDONED] No users with booking form opens found");
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get users who already have bookings (exclude them)
    const { data: usersWithBookings } = await supabaseClient
      .from('bookings')
      .select('owner_id')
      .in('owner_id', userIds);

    const usersWithBookingsSet = new Set(usersWithBookings?.map(b => b.owner_id) || []);

    // Check which users already received abandoned booking emails
    const { data: previousEmails } = await supabaseClient
      .from('user_events')
      .select('user_id, event_data, created_at')
      .in('user_id', userIds)
      .eq('event_name', 'abandoned_booking_email_sent');

    // Map of user_id -> { email_1_sent: boolean, email_1_time: Date, email_2_sent: boolean }
    const emailStatusMap = new Map<string, { email1Sent: boolean; email1Time?: Date; email2Sent: boolean }>();
    
    previousEmails?.forEach(event => {
      const status = emailStatusMap.get(event.user_id) || { email1Sent: false, email2Sent: false };
      const emailNumber = (event.event_data as any)?.email_number;
      if (emailNumber === 1) {
        status.email1Sent = true;
        status.email1Time = new Date(event.created_at);
      } else if (emailNumber === 2) {
        status.email2Sent = true;
      }
      emailStatusMap.set(event.user_id, status);
    });

    let emailsSent = 0;
    const results: any[] = [];

    for (const [userId, formOpenedAt] of userEventMap) {
      // Skip users who already have bookings
      if (usersWithBookingsSet.has(userId)) {
        continue;
      }

      const emailStatus = emailStatusMap.get(userId) || { email1Sent: false, email2Sent: false };
      const timeSinceFormOpen = now.getTime() - formOpenedAt.getTime();
      const hoursSinceOpen = timeSinceFormOpen / (1000 * 60 * 60);

      let shouldSendEmail = false;
      let emailNumber: 1 | 2 = 1;

      // Email 1: Send 24 hours after form open if not sent
      if (!emailStatus.email1Sent && hoursSinceOpen >= 24 && hoursSinceOpen < 72) {
        shouldSendEmail = true;
        emailNumber = 1;
      }
      // Email 2: Send 3 days after email 1 if email 1 was sent
      else if (emailStatus.email1Sent && !emailStatus.email2Sent && emailStatus.email1Time) {
        const hoursSinceEmail1 = (now.getTime() - emailStatus.email1Time.getTime()) / (1000 * 60 * 60);
        if (hoursSinceEmail1 >= 72) { // 3 days after first email
          shouldSendEmail = true;
          emailNumber = 2;
        }
      }

      if (shouldSendEmail) {
        console.log(`[CHECK-ABANDONED] Sending email ${emailNumber} to user ${userId}`);
        
        try {
          // Send the email
          const { data: emailResult, error: emailError } = await supabaseClient.functions.invoke(
            'send-abandoned-booking-email',
            { body: { user_id: userId, email_number: emailNumber } }
          );

          if (emailError) {
            console.error(`[CHECK-ABANDONED] Failed to send email to ${userId}:`, emailError);
            results.push({ userId, success: false, error: emailError.message });
          } else {
            // Log that we sent the email
            await supabaseClient.from('user_events').insert({
              user_id: userId,
              event_type: 'system',
              event_name: 'abandoned_booking_email_sent',
              event_data: { email_number: emailNumber, result: emailResult }
            });

            emailsSent++;
            results.push({ userId, success: true, emailNumber });
            console.log(`[CHECK-ABANDONED] Successfully sent email ${emailNumber} to ${userId}`);
          }
        } catch (err: any) {
          console.error(`[CHECK-ABANDONED] Exception sending email to ${userId}:`, err);
          results.push({ userId, success: false, error: err.message });
        }
      }
    }

    console.log(`[CHECK-ABANDONED] Completed. Sent ${emailsSent} emails.`);

    return new Response(JSON.stringify({ 
      processed: userIds.length,
      emailsSent,
      results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("[CHECK-ABANDONED] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
