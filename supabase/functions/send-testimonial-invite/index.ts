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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get all active sitters who have fewer than 3 testimonials
    const { data: sitters, error: sittersError } = await supabase
      .from("profiles")
      .select("id, email, first_name")
      .eq("role", "pet_sitter")
      .eq("onboarding_completed", true)
      .eq("is_test_account", false);

    if (sittersError) throw sittersError;

    // Get testimonial counts per sitter
    const { data: testimonialCounts } = await supabase
      .from("sitter_testimonials")
      .select("sitter_id");

    const countMap = new Map<string, number>();
    testimonialCounts?.forEach((t: any) => {
      countMap.set(t.sitter_id, (countMap.get(t.sitter_id) || 0) + 1);
    });

    const eligibleSitters = sitters?.filter(s => (countMap.get(s.id) || 0) < 3) || [];
    console.log(`[TESTIMONIAL-INVITE] Found ${eligibleSitters.length} eligible sitters`);

    let sent = 0;
    let failed = 0;

    for (const sitter of eligibleSitters) {
      const currentCount = countMap.get(sitter.id) || 0;
      const remaining = 3 - currentCount;

      try {
        await resend.emails.send({
          from: "ZiggySitters <welcome@ziggysitters.com>",
          to: [sitter.email],
          subject: `⭐ ${sitter.first_name}, boost your profile with ${remaining} testimonial${remaining > 1 ? 's' : ''}!`,
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
    .star-box { background: white; padding: 20px; border-radius: 12px; margin: 15px 0; border: 2px solid #fbbf24; text-align: center; }
    .tip { background: #eff6ff; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #3b82f6; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">⭐ Boost Your Profile</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Add testimonials to get more bookings</p>
    </div>
    <div class="content">
      <p>Hi ${sitter.first_name},</p>
      
      <p>Sitters with <strong>3 client testimonials</strong> get <strong>3x more enquiries</strong> from pet owners. You have <strong>${remaining} spot${remaining > 1 ? 's' : ''} remaining</strong>!</p>

      <div class="star-box">
        <p style="font-size: 24px; margin: 0;">⭐⭐⭐</p>
        <h3 style="margin: 10px 0 5px 0;">Your Star Rating Journey</h3>
        <p style="font-size: 14px; color: #666; margin: 0;">
          Each milestone earns you a star. Testimonials help pet owners trust you faster!
        </p>
      </div>

      <div class="tip">
        <strong>💡 Pro tip:</strong> Ask a past pet sitting client, neighbour, or friend you've pet-sat for to write a quick note about their experience. Then add it to your profile!
      </div>

      <p>Here's what to include:</p>
      <ul>
        <li>Client's first name</li>
        <li>A short quote about their experience</li>
        <li>A star rating (1-5)</li>
      </ul>

      <center>
        <a href="https://ziggysitters.com/profile" class="cta-button">
          ⭐ Add Testimonials Now
        </a>
      </center>

      <p style="font-size: 13px; color: #666;">Testimonials are reviewed by our team before going live on your profile.</p>

      <p>Let's build trust together!<br>— The Ziggy Team 🐾</p>
    </div>
    <div class="footer">
      <p>Ziggy Sitters | Your Pet Sitting Platform</p>
    </div>
  </div>
</body>
</html>`,
        });
        sent++;
      } catch (emailError) {
        failed++;
        console.error(`[TESTIMONIAL-INVITE] Failed for ${sitter.email}:`, emailError);
      }
    }

    return new Response(JSON.stringify({ success: true, sent, failed, total: eligibleSitters.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[TESTIMONIAL-INVITE] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
