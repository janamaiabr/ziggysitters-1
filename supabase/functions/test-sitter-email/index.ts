import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[TEST-SITTER-EMAIL] Starting test email");
    console.log("[TEST-SITTER-EMAIL] RESEND_API_KEY exists:", !!Deno.env.get("RESEND_API_KEY"));

    const { email } = await req.json();
    const testEmail = email || "jana.maia@seequent.com";

    console.log("[TEST-SITTER-EMAIL] Sending test email to:", testEmail);

    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <onboarding@resend.dev>",
      to: [testEmail],
      subject: "Test Email - Ziggy Sitters Notification System",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">Test Email Successful! ✅</h1>
          <p>This is a test email from the Ziggy Sitters notification system.</p>
          <p>If you're receiving this, the email system is working correctly.</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        </div>
      `,
    });

    console.log("[TEST-SITTER-EMAIL] Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Test email sent to ${testEmail}`,
      emailResponse 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[TEST-SITTER-EMAIL] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
