import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[SERVICE-AREA-REMINDER] Starting...");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get all verified sitters who don't have service areas set up
    const { data: sittersWithAreas } = await supabase
      .from('sitter_service_areas')
      .select('sitter_id');
    
    const sitterIdsWithAreas = new Set(sittersWithAreas?.map(s => s.sitter_id) || []);

    const { data: sitters, error } = await supabase
      .from('profiles')
      .select('id, email, first_name')
      .eq('role', 'pet_sitter')
      .eq('is_verified', true)
      .eq('is_test_account', false);

    if (error) throw error;

    const sittersWithoutAreas = sitters?.filter(s => !sitterIdsWithAreas.has(s.id)) || [];
    console.log(`[SERVICE-AREA-REMINDER] Found ${sittersWithoutAreas.length} sitters without service areas`);

    let sent = 0;
    let failed = 0;

    for (const sitter of sittersWithoutAreas) {
      try {
        await resend.emails.send({
          from: "Ziggy Sitters <hello@ziggysitters.com>",
          to: [sitter.email],
          subject: "🆕 New Feature: Expand Your Service Area!",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
                .cta-button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
                .feature-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10b981; }
                .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">Exciting New Feature! 🎉</h1>
                </div>
                <div class="content">
                  <p>Hi ${sitter.first_name},</p>
                  
                  <p>Great news! You can now <strong>add multiple suburbs</strong> to your service area, making you visible to more pet owners searching in those areas.</p>
                  
                  <div class="feature-box">
                    <h3 style="margin-top: 0;">Why add more suburbs?</h3>
                    <ul>
                      <li>📍 Appear in more search results</li>
                      <li>📈 Get more booking requests</li>
                      <li>🏠 Cover areas you're willing to travel to</li>
                    </ul>
                  </div>
                  
                  <p>It only takes 30 seconds to update your profile!</p>
                  
                  <center>
                    <a href="https://ziggysitters.com/profile" class="cta-button">
                      Add Your Service Areas →
                    </a>
                  </center>
                  
                  <p>Simply go to your Profile, click "Edit Profile", and you'll see the new "Service Areas" section where you can select multiple Auckland suburbs.</p>
                  
                  <p>Thanks for being part of Ziggy Sitters!</p>
                  <p>— The Ziggy Team 🐾</p>
                </div>
                <div class="footer">
                  <p>Ziggy Sitters | Auckland's Trusted Pet Sitting Platform</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
        sent++;
        console.log(`[SERVICE-AREA-REMINDER] Sent to ${sitter.email}`);
      } catch (emailError) {
        failed++;
        console.error(`[SERVICE-AREA-REMINDER] Failed to send to ${sitter.email}:`, emailError);
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      total_sitters: sittersWithoutAreas.length,
      sent,
      failed
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[SERVICE-AREA-REMINDER] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
