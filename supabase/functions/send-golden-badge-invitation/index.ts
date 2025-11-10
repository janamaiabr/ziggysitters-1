import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    console.log("Fetching verified sitters without golden badge...");

    // Get all verified sitters without golden badge and without police vet document
    const { data: sitters, error: sittersError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, first_name, last_name")
      .eq("role", "pet_sitter")
      .eq("is_verified", true)
      .eq("is_test_account", false)
      .or("golden_badge_approved.is.false,golden_badge_approved.is.null")
      .or("blue_card_document_url.is.null,blue_card_document_url.eq.")
      .order("created_at", { ascending: true });

    if (sittersError) {
      console.error("Error fetching sitters:", sittersError);
      throw sittersError;
    }

    console.log(`Found ${sitters?.length || 0} verified sitters without golden badge`);

    const results = [];
    let emailsSent = 0;

    for (const sitter of sitters || []) {
      try {
        const emailResponse = await resend.emails.send({
          from: "ZiggySitters <welcome@ziggysitters.com>",
          to: [sitter.email],
          subject: "⭐ Unlock Your Golden Badge - Get Priority Booking Visibility!",
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
                .banner {
                  background: linear-gradient(45deg, #ffd700, #ffed4e);
                  color: #333;
                  text-align: center;
                  padding: 20px;
                  font-weight: bold;
                  font-size: 22px;
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
                .steps {
                  margin: 30px 0;
                }
                .step-item {
                  display: flex;
                  align-items: start;
                  margin: 15px 0;
                  padding: 15px;
                  background: #f9f9f9;
                  border-radius: 8px;
                }
                .step-number {
                  font-size: 24px;
                  font-weight: bold;
                  color: #ffd700;
                  margin-right: 15px;
                  min-width: 35px;
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
                .comparison-table {
                  margin: 25px 0;
                  border-collapse: collapse;
                  width: 100%;
                }
                .comparison-table th {
                  background: #ffd700;
                  color: #333;
                  padding: 12px;
                  text-align: left;
                  font-weight: bold;
                }
                .comparison-table td {
                  padding: 12px;
                  border-bottom: 1px solid #eee;
                }
                .comparison-table tr:nth-child(even) {
                  background: #fffbef;
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
                <div class="banner">
                  ⭐ Earn Your Golden Badge Today! ⭐
                </div>
                
                <div class="header">
                  <h1>You're Eligible for a Golden Badge!</h1>
                  <p style="font-size: 18px; margin-top: 15px; opacity: 0.95;">
                    Get priority visibility and more bookings
                  </p>
                </div>

                <div class="content">
                  <h2>Hi ${sitter.first_name}! 🌟</h2>
                  
                  <p style="font-size: 16px;">
                    Congratulations on being a verified sitter! You've already taken an important step in building 
                    trust with pet owners. Now, take it to the next level with our <strong>Golden Badge</strong> program!
                  </p>

                  <div class="highlight-box">
                    <h3 style="margin-top: 0; color: #ffd700;">What is the Golden Badge?</h3>
                    <p style="margin: 10px 0;">
                      The Golden Badge is an elite status awarded to sitters who complete advanced police vetting. 
                      It shows pet owners you've passed the <strong>highest level of background checks</strong>, 
                      giving them ultimate peace of mind.
                    </p>
                  </div>

                  <h2>Why Get Your Golden Badge?</h2>
                  
                  <div class="benefits">
                    <div class="benefit-item">
                      <div class="benefit-icon">🔝</div>
                      <div>
                        <strong>Appear First in Search Results</strong>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                          Golden badge sitters are shown at the top of all searches - maximum exposure!
                        </p>
                      </div>
                    </div>

                    <div class="benefit-item">
                      <div class="benefit-icon">💰</div>
                      <div>
                        <strong>Get More Bookings</strong>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                          Pet owners actively seek out golden badge sitters for added security
                        </p>
                      </div>
                    </div>

                    <div class="benefit-item">
                      <div class="benefit-icon">⭐</div>
                      <div>
                        <strong>Stand Out from Competition</strong>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                          Only elite sitters earn this prestigious badge
                        </p>
                      </div>
                    </div>

                    <div class="benefit-item">
                      <div class="benefit-icon">🛡️</div>
                      <div>
                        <strong>Build Ultimate Trust</strong>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                          Show you've passed the most thorough safety checks available
                        </p>
                      </div>
                    </div>
                  </div>

                  <h2>See the Difference:</h2>
                  
                  <table class="comparison-table">
                    <thead>
                      <tr>
                        <th>Feature</th>
                        <th>Verified ✓</th>
                        <th>Golden Badge ⭐</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Appears in Search</td>
                        <td>✓ Yes</td>
                        <td>✓ Yes (Top Priority)</td>
                      </tr>
                      <tr>
                        <td>ID Verified</td>
                        <td>✓ Yes</td>
                        <td>✓ Yes</td>
                      </tr>
                      <tr>
                        <td>Police Vetted</td>
                        <td>—</td>
                        <td>⭐ Yes</td>
                      </tr>
                      <tr>
                        <td>Priority Placement</td>
                        <td>—</td>
                        <td>⭐ Top of Search</td>
                      </tr>
                      <tr>
                        <td>Golden Star Badge</td>
                        <td>—</td>
                        <td>⭐ Displayed</td>
                      </tr>
                      <tr>
                        <td>Booking Advantage</td>
                        <td>Standard</td>
                        <td>⭐ Highest Trust</td>
                      </tr>
                    </tbody>
                  </table>

                  <h2>How to Get Your Golden Badge:</h2>
                  
                  <div class="steps">
                    <div class="step-item">
                      <div class="step-number">1.</div>
                      <div>
                        <strong>Get Your Police Vet Document</strong>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                          Apply for a police vetting check through the NZ Police. This typically takes 1-2 weeks.
                          <br><a href="https://www.police.govt.nz/advice-services/pre-employment-vetting" style="color: #ffd700;">Learn more →</a>
                        </p>
                      </div>
                    </div>

                    <div class="step-item">
                      <div class="step-number">2.</div>
                      <div>
                        <strong>Upload to Your Profile</strong>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                          Once you receive your police vet document, upload it in your ZiggySitters profile under the Verification tab
                        </p>
                      </div>
                    </div>

                    <div class="step-item">
                      <div class="step-number">3.</div>
                      <div>
                        <strong>Get Approved!</strong>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                          We'll review your document and activate your golden badge within 24 hours
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="cta-section">
                    <h2 style="margin-top: 0; color: #ffd700;">Ready to Stand Out?</h2>
                    <p style="font-size: 16px; margin-bottom: 25px;">
                      Start your journey to earning the golden badge today!
                    </p>
                    <center>
                      <a href="https://ziggysitters.com/profile" class="button">
                        ⭐ Get My Golden Badge
                      </a>
                    </center>
                  </div>

                  <div class="highlight-box">
                    <h3 style="margin-top: 0;">❓ Frequently Asked Questions:</h3>
                    <p><strong>How much does police vetting cost?</strong></p>
                    <p style="margin: 5px 0 15px 0; font-size: 14px; color: #666;">
                      Police vetting fees vary, typically around $8-15. This is a one-time cost that pays for itself with increased bookings.
                    </p>
                    
                    <p><strong>How long does it take?</strong></p>
                    <p style="margin: 5px 0 15px 0; font-size: 14px; color: #666;">
                      Police vetting usually takes 1-2 weeks to process. Once you receive your document, golden badge activation is within 24 hours.
                    </p>
                    
                    <p><strong>Is it required?</strong></p>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                      No, but it gives you a significant competitive advantage and shows your commitment to safety and professionalism.
                    </p>
                  </div>

                  <p style="font-size: 16px; margin-top: 30px;">
                    <strong>Don't miss out on this opportunity!</strong> Golden badge sitters consistently receive more 
                    bookings and build their reputation faster. Take your sitter profile to the next level today!
                  </p>

                  <p style="font-size: 16px;">
                    Questions about the process? Contact us at 
                    <a href="https://ziggysitters.com/contact" style="color: #ffd700;">support</a>.
                  </p>

                  <p style="margin-top: 30px;">
                    Best regards,<br>
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
                    You're receiving this email because you have a ZiggySitters sitter account.
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
        });

        console.log(`Golden badge invitation sent to ${sitter.email}`);
        results.push({
          email: sitter.email,
          name: `${sitter.first_name} ${sitter.last_name}`,
          status: "sent",
        });
        emailsSent++;
      } catch (error: any) {
        console.error(`Failed to send email to ${sitter.email}:`, error);
        results.push({
          email: sitter.email,
          name: `${sitter.first_name} ${sitter.last_name}`,
          status: "failed",
          error: error.message,
        });
      }
    }

    console.log(`Golden badge invitations complete. Sent ${emailsSent} emails`);

    return new Response(
      JSON.stringify({
        success: true,
        total_sitters: sitters?.length || 0,
        emails_sent: emailsSent,
        results,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-golden-badge-invitation function:", error);
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
