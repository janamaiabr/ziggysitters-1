import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MessageNotificationRequest {
  recipientId: string;
  senderId?: string;
  senderName?: string;
  messagePreview: string;
  // Guest enquiry fields
  isGuestEnquiry?: boolean;
  guestName?: string;
  guestEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: MessageNotificationRequest = await req.json();
    const { recipientId, senderId, senderName, messagePreview, isGuestEnquiry, guestName, guestEmail } = body;

    console.log(`[send-message-notification] ${isGuestEnquiry ? 'Guest enquiry' : 'Message'} to recipient ${recipientId}`);

    // Get recipient's email
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: recipient, error: recipientError } = await supabase
      .from("profiles")
      .select("email, first_name")
      .eq("id", recipientId)
      .maybeSingle();

    if (recipientError || !recipient?.email) {
      console.error("[send-message-notification] Failed to get recipient:", recipientError);
      return new Response(
        JSON.stringify({ error: "Recipient not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if recipient has messaging notifications enabled (default to true)
    const { data: subscriptions } = await supabase
      .from("email_subscriptions")
      .select("booking_notifications")
      .eq("user_id", recipientId)
      .maybeSingle();

    // Use booking_notifications setting for messages (they're booking-related)
    if (subscriptions && subscriptions.booking_notifications === false) {
      console.log("[send-message-notification] Recipient has notifications disabled");
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "notifications_disabled" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Different email content for guest enquiries vs logged-in user messages
    if (isGuestEnquiry && guestName && guestEmail) {
      // GUEST ENQUIRY - Direct email to sitter with guest's contact info
      const emailResponse = await resend.emails.send({
        from: "Ziggy Sitters <enquiries@ziggysitters.co.nz>",
        to: [recipient.email],
        reply_to: guestEmail,
        subject: `🔔 New enquiry from ${guestName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #F97316; margin: 0;">🐾 Ziggy Sitters</h1>
            </div>
            
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
              <p style="margin: 0; font-weight: 600; color: #92400e;">🎉 You have a new pet care enquiry!</p>
            </div>
            
            <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <h2 style="margin: 0 0 16px 0; color: #111;">Hi ${recipient.first_name}!</h2>
              
              <p style="margin: 0 0 16px 0;">
                <strong>${guestName}</strong> is interested in your pet care services and sent you a message:
              </p>
              
              <div style="background: white; border-radius: 8px; padding: 16px; border-left: 4px solid #F97316; margin-bottom: 16px;">
                <p style="margin: 0; color: #374151;">
                  "${messagePreview}"
                </p>
              </div>
              
              <div style="background: #ecfdf5; border-radius: 8px; padding: 12px; border: 1px solid #d1fae5;">
                <p style="margin: 0; font-size: 14px; color: #065f46;">
                  <strong>Reply directly to:</strong> ${guestEmail}
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="mailto:${guestEmail}?subject=Re: Your pet care enquiry on Ziggy Sitters" style="display: inline-block; background: #F97316; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">
                Reply to ${guestName} →
              </a>
            </div>
            
            <div style="background: #f0f9ff; border-radius: 8px; padding: 12px; margin-bottom: 24px;">
              <p style="margin: 0; font-size: 13px; color: #0369a1; text-align: center;">
                💡 <strong>Tip:</strong> Quick responses lead to more bookings! Try to reply within a few hours.
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} Ziggy Sitters | Auckland, New Zealand
            </p>
          </body>
          </html>
        `,
      });

      console.log("[send-message-notification] Guest enquiry email sent:", emailResponse);

      return new Response(
        JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // LOGGED-IN USER MESSAGE
    const messagesUrl = "https://ziggysitters.com/messages";
    
    const emailResponse = await resend.emails.send({
      from: "Ziggy Sitters <notifications@ziggysitters.co.nz>",
      to: [recipient.email],
      subject: `New message from ${senderName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #F97316; margin: 0;">🐾 Ziggy Sitters</h1>
          </div>
          
          <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 16px 0; color: #111;">New Message from ${senderName}</h2>
            
            <div style="background: white; border-radius: 8px; padding: 16px; border-left: 4px solid #F97316;">
              <p style="margin: 0; color: #666; font-style: italic;">
                "${messagePreview}${messagePreview.length >= 100 ? '...' : ''}"
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${messagesUrl}" style="display: inline-block; background: #F97316; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">
              View & Reply
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            You're receiving this because someone sent you a message on Ziggy Sitters.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} Ziggy Sitters | Auckland, New Zealand
          </p>
        </body>
        </html>
      `,
    });

    console.log("[send-message-notification] Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("[send-message-notification] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
