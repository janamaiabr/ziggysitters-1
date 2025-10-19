import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const testEmail = "janamaia@gmail.com";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results = [];

    // 1. Welcome Email
    console.log("Sending welcome email...");
    const welcomeResult = await supabase.functions.invoke("send-welcome-email", {
      body: {
        email: testEmail,
        firstName: "Test",
        role: "pet_owner"
      }
    });
    results.push({ email: "Welcome", success: !welcomeResult.error, error: welcomeResult.error });

    // 2. Contact Email
    console.log("Sending contact email...");
    const contactResult = await supabase.functions.invoke("send-contact-email", {
      body: {
        name: "Test User",
        email: testEmail,
        subject: "Test Contact",
        message: "This is a test contact message"
      }
    });
    results.push({ email: "Contact", success: !contactResult.error, error: contactResult.error });

    // 3. Police Vet Reminder
    console.log("Sending police vet reminder...");
    const policeVetResult = await supabase.functions.invoke("send-police-vet-reminder", {
      body: {
        user_email: testEmail,
        user_name: "Test User"
      }
    });
    results.push({ email: "Police Vet Reminder", success: !policeVetResult.error, error: policeVetResult.error });

    // 4. Booking Notification
    console.log("Sending booking notification...");
    const bookingNotificationResult = await supabase.functions.invoke("send-booking-notification", {
      body: {
        sitter_email: testEmail,
        sitter_name: "Test Sitter",
        owner_name: "Test Owner",
        owner_phone: "0212345678",
        service_type: "pet_sitting_owners_home",
        start_date: "2025-12-01",
        end_date: "2025-12-05",
        pet_names: ["Fluffy", "Max"],
        total_amount: 250
      }
    });
    results.push({ email: "Booking Notification", success: !bookingNotificationResult.error, error: bookingNotificationResult.error });

    // 5. Booking Acceptance
    console.log("Sending booking acceptance email...");
    const bookingAcceptanceResult = await supabase.functions.invoke("send-booking-acceptance-email", {
      body: {
        owner_email: testEmail,
        owner_name: "Test Owner",
        sitter_name: "Test Sitter",
        service_type: "pet_sitting_owners_home",
        start_date: "2025-12-01",
        end_date: "2025-12-05",
        booking_reference: "BK-TEST123",
        total_amount: 250.00
      }
    });
    results.push({ email: "Booking Acceptance", success: !bookingAcceptanceResult.error, error: bookingAcceptanceResult.error });

    // 6. Booking Cancellation
    console.log("Sending booking cancellation email...");
    const cancellationResult = await supabase.functions.invoke("send-booking-cancellation", {
      body: {
        recipient_email: testEmail,
        recipient_name: "Test User",
        sitter_name: "Test Sitter",
        owner_name: "Test Owner",
        service_type: "pet_sitting_owners_home",
        start_date: "2025-12-01",
        end_date: "2025-12-05",
        cancelled_by: "owner",
        cancellation_reason: "Change of plans",
        refund_amount: 250
      }
    });
    results.push({ email: "Booking Cancellation", success: !cancellationResult.error, error: cancellationResult.error });

    // 7. Verification Request - Get a real user ID
    console.log("Sending verification request email...");
    const { data: testUser } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('role', 'pet_sitter')
      .limit(1)
      .single();
    
    const verificationRequestResult = await supabase.functions.invoke("send-verification-request-email", {
      body: {
        user_id: testUser?.user_id || "00000000-0000-0000-0000-000000000000",
        documents_uploaded: true
      }
    });
    results.push({ email: "Verification Request", success: !verificationRequestResult.error, error: verificationRequestResult.error });

    // 8. Verification Update (Approved)
    console.log("Sending verification approved email...");
    const verificationApprovedResult = await supabase.functions.invoke("send-verification-update", {
      body: {
        user_email: testEmail,
        user_name: "Test Sitter",
        verification_status: "approved"
      }
    });
    results.push({ email: "Verification Approved", success: !verificationApprovedResult.error, error: verificationApprovedResult.error });

    // 9. Verification Update (Rejected)
    console.log("Sending verification rejected email...");
    const verificationRejectedResult = await supabase.functions.invoke("send-verification-update", {
      body: {
        user_email: testEmail,
        user_name: "Test Sitter",
        verification_status: "rejected",
        rejection_reason: "Documents are unclear. Please resubmit clearer images."
      }
    });
    results.push({ email: "Verification Rejected", success: !verificationRejectedResult.error, error: verificationRejectedResult.error });

    // 10. Daily Report Reminder - Get a real booking ID
    console.log("Sending daily report reminder...");
    const { data: testBooking } = await supabase
      .from('bookings')
      .select('id')
      .eq('requires_daily_reports', true)
      .limit(1)
      .single();
    
    const dailyReportReminderResult = await supabase.functions.invoke("send-daily-report-reminder", {
      body: {
        bookingId: testBooking?.id || "00000000-0000-0000-0000-000000000000"
      }
    });
    results.push({ email: "Daily Report Reminder", success: !dailyReportReminderResult.error, error: dailyReportReminderResult.error });

    // 11. Penalty Notification
    console.log("Sending penalty notification...");
    const penaltyResult = await supabase.functions.invoke("send-penalty-notification", {
      body: {
        booking_id: "TEST123",
        owner_email: testEmail,
        owner_name: "Test Owner",
        sitter_name: "Test Sitter",
        penalty_amount: 50,
        reports_completed: 2,
        reports_required: 5,
        booking_reference: "BK-TEST123"
      }
    });
    results.push({ email: "Penalty Notification", success: !penaltyResult.error, error: penaltyResult.error });

    // 12. Admin Booking Notification
    console.log("Sending admin booking notification...");
    const adminNotificationResult = await supabase.functions.invoke("send-admin-booking-notification", {
      body: {
        booking_id: "00000000-0000-0000-0000-000000000000",
        owner_name: "Test Owner",
        owner_email: testEmail,
        sitter_name: "Test Sitter",
        service_type: "pet_sitting_owners_home",
        start_date: "2025-12-01",
        end_date: "2025-12-05",
        booking_reference: "BK-TEST123",
        total_amount: 250.00
      }
    });
    results.push({ email: "Admin Booking Notification", success: !adminNotificationResult.error, error: adminNotificationResult.error });

    // 13. Booking Decline Notification
    console.log("Sending booking decline notification...");
    const declineResult = await supabase.functions.invoke("send-booking-decline-notification", {
      body: {
        owner_email: testEmail,
        owner_name: "Test Owner",
        sitter_name: "Test Sitter",
        service_type: "pet_sitting_owners_home",
        start_date: "2025-12-01",
        end_date: "2025-12-05"
      }
    });
    results.push({ email: "Booking Decline Notification", success: !declineResult.error, error: declineResult.error });

    // 14. Booking Notification (No Stripe)
    console.log("Sending booking notification (no Stripe)...");
    const noStripeResult = await supabase.functions.invoke("send-booking-notification-no-stripe", {
      body: {
        booking_id: "test-no-stripe",
        sitter_email: testEmail,
        sitter_name: "Test Sitter",
        owner_name: "Test Owner",
        service_type: "pet_sitting_sitters_home",
        start_date: "2025-12-01",
        end_date: "2025-12-05",
        booking_reference: "BK-NOSTRIPE",
        total_amount: 250
      }
    });
    results.push({ email: "Booking Notification (No Stripe)", success: !noStripeResult.error, error: noStripeResult.error });

    // 15. Daily Report Email - Use valid booking ID
    console.log("Sending daily report email...");
    const dailyReportEmailResult = await supabase.functions.invoke("send-daily-report-email", {
      body: {
        bookingId: testBooking?.id || "00000000-0000-0000-0000-000000000000",
        reportDate: "2025-12-01",
        reportData: {
          photo_urls: [],
          exercise_duration: 60,
          exercise_notes: "Great walk in the park",
          medication_given: true,
          medication_notes: "Morning medication given as scheduled",
          sleep_quality: "good",
          sleep_notes: "Slept through the night",
          time_alone_hours: 2,
          food_consumption: "all",
          food_notes: "Ate all meals enthusiastically",
          general_notes: "Had a great day at the park! Very playful and happy.",
          mood: "happy"
        }
      }
    });
    results.push({ email: "Daily Report Email", success: !dailyReportEmailResult.error, error: dailyReportEmailResult.error });

    // 16. Go Live Notification
    console.log("Sending go live notification...");
    const goLiveResult = await supabase.functions.invoke("send-go-live-notification", {
      body: {
        email: testEmail,
        firstName: "Test",
        lastName: "Sitter"
      }
    });
    results.push({ email: "Go Live Notification", success: !goLiveResult.error, error: goLiveResult.error });

    // 17. Onboarding Reminder
    console.log("Sending onboarding reminder...");
    const onboardingReminderResult = await supabase.functions.invoke("send-onboarding-reminder", {
      body: {
        user_email: testEmail,
        user_name: "Test User",
        onboarding_status: "incomplete"
      }
    });
    results.push({ email: "Onboarding Reminder", success: !onboardingReminderResult.error, error: onboardingReminderResult.error });

    console.log("All email tests completed:", results);

    return new Response(
      JSON.stringify({
        message: `All test emails sent to ${testEmail}`,
        results: results
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in test-all-emails:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
