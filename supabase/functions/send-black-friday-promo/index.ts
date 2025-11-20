import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get all verified pet owners and sitters with email subscriptions
    const { data: profiles, error } = await supabaseClient
      .from("profiles")
      .select(`
        id,
        email,
        first_name,
        last_name,
        role,
        email_subscriptions!inner(marketing_emails)
      `)
      .eq("email_subscriptions.marketing_emails", true);

    if (error) throw error;

    console.log(`Sending Black Friday promo to ${profiles?.length || 0} users`);

    const emailPromises = profiles?.map(async (profile) => {
      const isOwner = profile.role === "pet_owner";
      const isSitter = profile.role === "pet_sitter";

      const subject = isOwner 
        ? "🎉 Black Friday Special: 50% Off Booking Fees!" 
        : "🎉 Black Friday: Help Pet Parents Save 50%!";

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { margin: 0; font-size: 32px; }
              .content { background: white; padding: 40px 20px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .promo-code { background: #f7fafc; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px; }
              .promo-code code { font-size: 28px; font-weight: bold; color: #667eea; letter-spacing: 2px; }
              .cta { display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
              .footer { text-align: center; margin-top: 40px; color: #718096; font-size: 14px; }
              .highlight { color: #667eea; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Black Friday is Here!</h1>
                <p style="font-size: 18px; margin: 10px 0 0 0;">Biggest Savings of the Year</p>
              </div>
              <div class="content">
                <p>Hi ${profile.first_name},</p>
                
                ${isOwner ? `
                  <p>This Black Friday, we're making it easier than ever to book trusted pet care! 🐾</p>
                  
                  <h2 style="color: #667eea;">Save 50% on Platform Fees</h2>
                  <p>Use our exclusive Black Friday code to get <span class="highlight">50% OFF</span> our platform booking fee. That means more savings when you book amazing sitters!</p>
                  
                  <div class="promo-code">
                    <p style="margin: 0 0 10px 0; font-size: 16px;">Your Black Friday Code:</p>
                    <code>BLACKFRIDAY50</code>
                    <p style="margin: 10px 0 0 0; font-size: 14px; color: #718096;">Valid through November 30th</p>
                  </div>
                  
                  <p><strong>How to use:</strong></p>
                  <ul>
                    <li>Browse and select your perfect sitter</li>
                    <li>Enter <code>BLACKFRIDAY50</code> at checkout</li>
                    <li>Enjoy 50% off the platform fee!</li>
                  </ul>
                  
                  <div style="text-align: center;">
                    <a href="https://ziggysitters.lovable.app/find-sitters" class="cta">Find Your Perfect Sitter</a>
                  </div>
                ` : isSitter ? `
                  <p>Great news! We're running a Black Friday promotion that will help you get more bookings! 🐾</p>
                  
                  <h2 style="color: #667eea;">Pet Parents Save 50%</h2>
                  <p>We're offering pet owners <span class="highlight">50% OFF</span> platform fees when they use code <code>BLACKFRIDAY50</code>. This means:</p>
                  
                  <ul>
                    <li>✅ More affordable bookings for pet parents</li>
                    <li>✅ More bookings for you</li>
                    <li>✅ <strong>Your earnings stay exactly the same</strong></li>
                  </ul>
                  
                  <div class="promo-code">
                    <p style="margin: 0 0 10px 0; font-size: 16px;">Share This Code:</p>
                    <code>BLACKFRIDAY50</code>
                    <p style="margin: 10px 0 0 0; font-size: 14px; color: #718096;">Valid through November 30th</p>
                  </div>
                  
                  <p>Share this code with your clients and on social media to encourage more bookings during the holiday season!</p>
                  
                  <div style="text-align: center;">
                    <a href="https://ziggysitters.lovable.app/calendar" class="cta">View Your Calendar</a>
                  </div>
                ` : `
                  <p>This Black Friday, we're offering <span class="highlight">50% OFF</span> platform fees!</p>
                  
                  <div class="promo-code">
                    <p style="margin: 0 0 10px 0; font-size: 16px;">Your Black Friday Code:</p>
                    <code>BLACKFRIDAY50</code>
                    <p style="margin: 10px 0 0 0; font-size: 14px; color: #718096;">Valid through November 30th</p>
                  </div>
                  
                  <div style="text-align: center;">
                    <a href="https://ziggysitters.lovable.app" class="cta">Visit ZiggySitters</a>
                  </div>
                `}
                
                <p style="margin-top: 30px;">Happy booking!</p>
                <p><strong>The ZiggySitters Team</strong></p>
              </div>
              
              <div class="footer">
                <p>ZiggySitters - Trusted Pet Care in New Zealand</p>
                <p style="font-size: 12px; color: #a0aec0;">
                  You're receiving this because you're subscribed to marketing emails.<br>
                  <a href="https://ziggysitters.lovable.app/profile" style="color: #667eea;">Manage preferences</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `;

      try {
        await resend.emails.send({
          from: "ZiggySitters <hello@ziggysitters.com>",
          to: [profile.email],
          subject,
          html,
        });
        console.log(`Email sent to ${profile.email}`);
        return { success: true, email: profile.email };
      } catch (error) {
        console.error(`Failed to send to ${profile.email}:`, error);
        return { success: false, email: profile.email, error };
      }
    }) || [];

    const results = await Promise.all(emailPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        message: "Black Friday promo emails sent",
        total: results.length,
        successful,
        failed,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending Black Friday promo:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});