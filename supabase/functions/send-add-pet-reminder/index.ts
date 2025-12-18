import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "npm:resend@2.0.0";

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
    console.log("[ADD-PET-REMINDER] Starting...");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get all pet owners who don't have any pets
    const { data: ownersWithPets } = await supabase
      .from('pets')
      .select('owner_id');
    
    const ownerIdsWithPets = new Set(ownersWithPets?.map(p => p.owner_id) || []);

    const { data: owners, error } = await supabase
      .from('profiles')
      .select('id, email, first_name')
      .eq('role', 'pet_owner')
      .eq('is_test_account', false);

    if (error) throw error;

    const ownersWithoutPets = owners?.filter(o => !ownerIdsWithPets.has(o.id)) || [];
    console.log(`[ADD-PET-REMINDER] Found ${ownersWithoutPets.length} owners without pets`);

    let sent = 0;
    let failed = 0;

    for (const owner of ownersWithoutPets) {
      try {
        await resend.emails.send({
          from: "Ziggy Sitters <hello@ziggysitters.com>",
          to: [owner.email],
          subject: "🐾 Don't forget to add your furry friend!",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
                .cta-button { display: inline-block; background: #8b5cf6; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
                .benefit-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #8b5cf6; }
                .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">We miss your pet! 🐶🐱</h1>
                </div>
                <div class="content">
                  <p>Hi ${owner.first_name},</p>
                  
                  <p>We noticed you haven't added your pet to your Ziggy Sitters profile yet. Adding your pet helps sitters get to know them before the first booking!</p>
                  
                  <div class="benefit-box">
                    <h3 style="margin-top: 0;">Why add your pet?</h3>
                    <ul>
                      <li>🏷️ Sitters can see your pet's name, breed & personality</li>
                      <li>📝 Share any special care instructions upfront</li>
                      <li>⚡ Book sitters faster with pre-filled pet info</li>
                      <li>🔔 Get daily reports during bookings with your pet's photos</li>
                    </ul>
                  </div>
                  
                  <p>It only takes 1 minute to add your pet!</p>
                  
                  <center>
                    <a href="https://ziggysitters.com/profile" class="cta-button">
                      Add Your Pet Now →
                    </a>
                  </center>
                  
                  <p>Once you've added your pet, you can start browsing our amazing local pet sitters!</p>
                  
                  <p>Can't wait to meet your furry friend,<br>— The Ziggy Team 🐾</p>
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
        console.log(`[ADD-PET-REMINDER] Sent to ${owner.email}`);
      } catch (emailError) {
        failed++;
        console.error(`[ADD-PET-REMINDER] Failed to send to ${owner.email}:`, emailError);
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      total_owners: ownersWithoutPets.length,
      sent,
      failed
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[ADD-PET-REMINDER] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
