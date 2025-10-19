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

    // 7. Verification Request
    console.log("Sending verification request email...");
    const verificationRequestResult = await supabase.functions.invoke("send-verification-request-email", {
      body: {
        user_id: "00000000-0000-0000-0000-000000000000",
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

    // 10. Daily Report Reminder
    console.log("Sending daily report reminder...");
    const dailyReportReminderResult = await supabase.functions.invoke("send-daily-report-reminder", {
      body: {
        bookingId: "00000000-0000-0000-0000-000000000000"
      }
    });
    results.push({ email: "Daily Report Reminder", success: !dailyReportReminderResult.error, error: dailyReportReminderResult.error });

    // 11. Penalty Notification
    console.log("Sending penalty notification...");
    const penaltyResult = await supabase.functions.invoke("send-penalty-notification", {
      body: {
        owner_email: testEmail,
        owner_name: "Test Owner",
        sitter_name: "Test Sitter",
        booking_id: "TEST123",
        refund_amount: 50,
        penalty_reason: "Missed daily report for 2 days",
        service_dates: "Dec 1-5, 2025"
      }
    });
    results.push({ email: "Penalty Notification", success: !penaltyResult.error, error: penaltyResult.error });

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
