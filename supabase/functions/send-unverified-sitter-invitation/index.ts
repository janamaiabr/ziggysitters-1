import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  sitter_ids?: string[]; // Optional - if not provided, sends to all unverified sitters
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify admin authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profile?.role !== "admin") {
      throw new Error("Admin access required");
    }

    const { sitter_ids }: InvitationRequest = await req.json();

    // Get unverified sitters
    let query = supabaseClient
      .from("profiles")
      .select("id, first_name, last_name, email")
      .eq("role", "pet_sitter")
      .eq("onboarding_completed", true)
      .or("is_verified.is.null,is_verified.eq.false");

    if (sitter_ids && sitter_ids.length > 0) {
      query = query.in("id", sitter_ids);
    }

    const { data: sitters, error: sittersError } = await query;

    if (sittersError) {
      throw new Error(`Failed to fetch sitters: ${sittersError.message}`);
    }

    console.log(`Sending invitations to ${sitters?.length || 0} unverified sitters`);

    const emailPromises = sitters?.map(async (sitter) => {
      try {
        await resend.emails.send({
          from: "ZiggySitters <hello@ziggysitters.com>",
          to: [sitter.email],
          subject: "🎉 You're Now Live on ZiggySitters - Get Your Verification Badges!",
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
                  .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                  .badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin: 10px 5px; }
                  .badge-new { background: #f3f4f6; color: #6b7280; border: 2px solid #d1d5db; }
                  .badge-verified { background: #dbeafe; color: #1e40af; border: 2px solid #3b82f6; }
                  .badge-gold { background: #fef3c7; color: #92400e; border: 2px solid #f59e0b; }
                  .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1; }
                  .steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                  .step { padding: 15px 0; border-bottom: 1px solid #e5e7eb; }
                  .step:last-child { border-bottom: none; }
                  .btn { display: inline-block; padding: 12px 24px; background: #6366f1; color: white !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 5px; }
                  .btn:hover { background: #4f46e5; }
                  .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1 style="margin: 0; font-size: 32px;">🎉 Congratulations ${sitter.first_name}!</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px;">You're now bookable on ZiggySitters!</p>
                  </div>
                  
                  <div class="content">
                    <div class="info-box">
                      <h2 style="margin-top: 0; color: #111827;">Great news! Pet owners can now find and book you!</h2>
                      <p style="color: #4b5563;">Your profile is live on our platform and you can start accepting booking requests right away. To build even more trust with pet owners and stand out from the crowd, we've introduced verification badges:</p>
                    </div>

                    <h3 style="color: #111827; margin-top: 30px;">Unlock Trust Badges:</h3>
                    
                    <div class="steps">
                      <div class="step">
                        <div class="badge badge-new">🆕 New Sitter</div>
                        <p style="margin: 10px 0 0 0; color: #6b7280;"><strong>Current Status:</strong> You're bookable now, but adding verification will help you get more bookings!</p>
                      </div>
                      
                      <div class="step">
                        <div class="badge badge-verified">✓ ID Verified</div>
                        <p style="margin: 10px 0 0 0; color: #6b7280;"><strong>Upload your ID:</strong> Drivers license or passport to get the blue "ID Verified" badge. This shows pet owners you're a real, verified person.</p>
                      </div>
                      
                      <div class="step">
                        <div class="badge badge-gold">⭐ Gold Star Verified</div>
                        <p style="margin: 10px 0 0 0; color: #6b7280;"><strong>Submit your police vet check:</strong> Get our highest trust level with the Gold Star badge. This gives pet owners maximum peace of mind!</p>
                      </div>
                    </div>

                    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <h3 style="margin-top: 0; color: #92400e;">💰 Connect Your Bank Account</h3>
                      <p style="color: #78350f; margin-bottom: 10px;">Don't forget to connect your bank account via Stripe so you can receive payments! This takes just 2 minutes.</p>
                      <p style="color: #78350f; margin: 0;"><strong>Important:</strong> You don't need a business number (NZBN) - you're working as an individual through ZiggySitters.</p>
                    </div>

                    <h3 style="color: #111827;">Why Get Verified?</h3>
                    <ul style="color: #4b5563; line-height: 1.8;">
                      <li>📈 <strong>More bookings:</strong> Pet owners trust verified sitters</li>
                      <li>💎 <strong>Higher rates:</strong> Gold Star sitters can charge premium prices</li>
                      <li>🏆 <strong>Featured placement:</strong> Verified sitters appear higher in search results</li>
                      <li>🤝 <strong>Build trust:</strong> Show you're serious about pet care</li>
                    </ul>

                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://ziggysitters.com/profile?tab=verification" class="btn">Upload Documents & Connect Bank</a>
                    </div>

                    <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border: 2px solid #3b82f6;">
                      <h3 style="margin-top: 0; color: #1e40af;">🚀 Ready to Start Earning?</h3>
                      <ol style="color: #1e40af; line-height: 1.8; padding-left: 20px;">
                        <li>Complete your profile with great photos</li>
                        <li>Set your availability calendar</li>
                        <li>Upload ID for "ID Verified" badge</li>
                        <li>Connect your bank account</li>
                        <li>Start accepting bookings!</li>
                      </ol>
                    </div>
                  </div>

                  <div class="footer">
                    <p style="margin: 5px 0;"><strong>ZiggySitters Team</strong></p>
                    <p style="margin: 5px 0; font-size: 12px;">Questions? Reply to this email or contact us at hello@ziggysitters.com</p>
                    <p style="margin: 15px 0 5px 0; font-size: 12px;">
                      <a href="https://ziggysitters.com/profile" style="color: #6366f1; text-decoration: none;">View Profile</a> • 
                      <a href="https://ziggysitters.com/calendar" style="color: #6366f1; text-decoration: none;">Set Availability</a>
                    </p>
                  </div>
                </div>
              </body>
            </html>
          `,
        });
        console.log(`Invitation sent to ${sitter.email}`);
      } catch (emailError) {
        console.error(`Failed to send invitation to ${sitter.email}:`, emailError);
      }
    }) || [];

    await Promise.all(emailPromises);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Invitations sent to ${sitters?.length || 0} sitters`,
        count: sitters?.length || 0
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-unverified-sitter-invitation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
