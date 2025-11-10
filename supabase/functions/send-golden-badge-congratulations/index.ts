import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GoldenBadgeRequest {
  sitterId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sitterId }: GoldenBadgeRequest = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get sitter details
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", sitterId)
      .single();

    if (profileError || !profile) {
      throw new Error("Sitter not found");
    }

    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <welcome@ziggysitters.com>",
      to: [profile.email],
      subject: "🌟 Congratulations! You've Earned Your Golden Badge!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.7; 
              color: #333; 
              margin: 0; 
              padding: 0;
              background: #f5f5f5;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white;
            }
            .header { 
              background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); 
              color: #333; 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header h1 {
              margin: 0;
              font-size: 32px;
              font-weight: bold;
            }
            .badge-banner {
              background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
              color: #333;
              text-align: center;
              padding: 25px;
              font-weight: bold;
              font-size: 48px;
            }
            .content { 
              padding: 40px 30px; 
            }
            .content h2 {
              color: #ffd700;
              font-size: 24px;
              margin-bottom: 15px;
            }
            .highlight-box {
              background: linear-gradient(135deg, #ffd70015 0%, #ffed4e15 100%);
              border-left: 4px solid #ffd700;
              padding: 20px;
              margin: 25px 0;
              border-radius: 5px;
            }
            .benefits {
              margin: 30px 0;
            }
            .benefit-item {
              display: flex;
              align-items: start;
              margin: 15px 0;
              padding: 15px;
              background: #fffbef;
              border-radius: 8px;
              border-left: 3px solid #ffd700;
            }
            .benefit-icon {
              font-size: 24px;
              margin-right: 15px;
              min-width: 30px;
            }
            .button { 
              display: inline-block; 
              padding: 16px 40px; 
              background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
              color: #333 !important; 
              text-decoration: none; 
              border-radius: 30px; 
              margin: 25px 0;
              font-weight: bold;
              font-size: 16px;
              box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
              transition: transform 0.2s;
            }
            .button:hover {
              transform: translateY(-2px);
            }
            .cta-section {
              text-align: center;
              background: linear-gradient(135deg, #ffd70010 0%, #ffed4e10 100%);
              padding: 30px;
              border-radius: 10px;
              margin: 30px 0;
            }
            .footer { 
              text-align: center; 
              padding: 30px; 
              background: #f9f9f9;
              color: #666; 
              font-size: 13px; 
            }
            .footer-links {
              margin: 15px 0;
            }
            .footer-links a {
              color: #ffd700;
              text-decoration: none;
              margin: 0 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="badge-banner">
              ⭐ 🏆 ⭐
            </div>
            
            <div class="header">
              <h1>You've Earned Your Golden Badge!</h1>
              <p style="font-size: 18px; margin-top: 15px; opacity: 0.95;">
                A mark of excellence and trust in pet care
              </p>
            </div>

            <div class="content">
              <h2>Congratulations, ${profile.first_name}! 🎉</h2>
              
              <p style="font-size: 16px;">
                We're thrilled to inform you that you've been awarded the prestigious <strong>Golden Badge</strong> 
                on ZiggySitters! This badge is a testament to your commitment to providing safe, 
                professional, and trustworthy pet care services.
              </p>

              <div class="highlight-box">
                <h3 style="margin-top: 0; color: #ffd700;">🌟 What is the Golden Badge?</h3>
                <p style="margin: 10px 0;">
                  The Golden Badge is awarded to sitters who have completed advanced verification, including 
                  police vetting. This elite status shows pet owners that you go above and beyond in ensuring 
                  their pets' safety and well-being.
                </p>
              </div>

              <h2>Your Exclusive Benefits:</h2>
              
              <div class="benefits">
                <div class="benefit-item">
                  <div class="benefit-icon">🔝</div>
                  <div>
                    <strong>Priority in Search Results</strong>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                      Your profile now appears at the top of search results, giving you maximum visibility
                    </p>
                  </div>
                </div>

                <div class="benefit-item">
                  <div class="benefit-icon">⭐</div>
                  <div>
                    <strong>Golden Badge Display</strong>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                      A prominent golden star badge appears on your profile, showing your verified status
                    </p>
                  </div>
                </div>

                <div class="benefit-item">
                  <div class="benefit-icon">💰</div>
                  <div>
                    <strong>Increased Booking Potential</strong>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                      Pet owners actively seek out golden badge sitters for peace of mind
                    </p>
                  </div>
                </div>

                <div class="benefit-item">
                  <div class="benefit-icon">🛡️</div>
                  <div>
                    <strong>Trust & Credibility</strong>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                      Show you've passed the highest level of background checks
                    </p>
                  </div>
                </div>

                <div class="benefit-item">
                  <div class="benefit-icon">📈</div>
                  <div>
                    <strong>Professional Recognition</strong>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                      Stand out from other sitters and build your reputation faster
                    </p>
                  </div>
                </div>
              </div>

              <div class="cta-section">
                <h2 style="margin-top: 0; color: #ffd700;">Your Golden Badge is Now Live!</h2>
                <p style="font-size: 16px; margin-bottom: 25px;">
                  Visit your profile to see your new badge and start enjoying the benefits!
                </p>
                <center>
                  <a href="https://ziggysitters.com/profile" class="button">
                    ⭐ View My Profile
                  </a>
                </center>
              </div>

              <div class="highlight-box">
                <h3 style="margin-top: 0;">💡 Maximize Your Golden Badge:</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Keep your profile updated with recent photos</li>
                  <li>Respond quickly to booking requests</li>
                  <li>Provide exceptional service to earn 5-star reviews</li>
                  <li>Share your golden badge status on social media</li>
                  <li>Update your availability calendar regularly</li>
                </ul>
              </div>

              <p style="font-size: 16px; margin-top: 30px;">
                Thank you for your dedication to providing top-quality pet care. Your golden badge is 
                well-deserved and reflects the trust and excellence you bring to the ZiggySitters community.
              </p>

              <p style="font-size: 16px; margin-top: 25px;">
                <strong>Congratulations again, ${profile.first_name}! Here's to many happy pets and satisfied clients! 🐾</strong>
              </p>

              <p style="margin-top: 30px;">
                Warm regards,<br>
                <strong>The ZiggySitters Team</strong>
              </p>
            </div>

            <div class="footer">
              <p><strong>ZiggySitters</strong></p>
              <div class="footer-links">
                <a href="https://ziggysitters.com/about">About Us</a> |
                <a href="https://ziggysitters.com/how-it-works">How It Works</a> |
                <a href="https://ziggysitters.com/faq">FAQ</a> |
                <a href="https://ziggysitters.com/contact">Contact</a>
              </div>
              <p style="margin-top: 15px;">© 2025 ZiggySitters. All rights reserved.</p>
              <p style="font-size: 11px; color: #999; margin-top: 10px;">
                You're receiving this email because you have a ZiggySitters account.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`Golden badge congratulations email sent to ${profile.email}`);

    return new Response(
      JSON.stringify({
        success: true,
        emailResponse,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-golden-badge-congratulations function:", error);
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
