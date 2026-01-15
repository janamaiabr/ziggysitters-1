import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactEmailRequest = await req.json();

    // Send confirmation email to user (this stays - user should get immediate confirmation)
    const userEmailResponse = await resend.emails.send({
      from: "ZiggySitters <hello@ziggysitters.com>",
      to: [email],
      subject: "We received your message!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Thank you for contacting ZiggySitters!</h1>
          <p>Hi ${name},</p>
          <p>We have received your message and will get back to you within 24 hours.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Your Message:</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <p>If you have any urgent concerns, please email us directly for immediate assistance.</p>
          
          <p>Best regards,<br>The ZiggySitters Team</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            This email was sent from ZiggySitters contact form. 
            If you didn't submit this form, please ignore this email.
          </p>
        </div>
      `,
    });

    console.log("User confirmation email sent:", userEmailResponse);

    // Queue admin notification for weekly digest instead of sending immediately
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: queueError } = await supabase
      .from("admin_event_queue")
      .insert({
        event_type: "contact_form",
        event_data: {
          name,
          email,
          subject,
          message: message.substring(0, 500), // Truncate for digest
          submitted_at: new Date().toISOString()
        }
      });

    if (queueError) {
      console.error("Failed to queue contact form event:", queueError);
      // Don't throw - user email was sent successfully
    } else {
      console.log("Contact form event queued for weekly digest");
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Message sent successfully!" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
