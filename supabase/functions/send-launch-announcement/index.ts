import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

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

    console.log("Fetching all users for launch announcement...");

    // Get all users from profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("email, first_name, role, is_test_account")
      .eq("is_test_account", false)
      .order("created_at", { ascending: true });

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    console.log(`Found ${profiles?.length || 0} users to notify`);

    const results = [];
    let emailsSent = 0;

    for (const profile of profiles || []) {
      try {
        const isSitter = profile.role === "pet_sitter";
        
        const emailResponse = await resend.emails.send({
          from: "ZiggySitters <welcome@ziggysitters.com>",
          to: [profile.email],
          subject: "🎉 ZiggySitters is Officially LIVE! Your Pet Care Journey Starts Now",
          headers: {
            'List-Unsubscribe': `<mailto:unsubscribe@ziggysitters.com?subject=Unsubscribe>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
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
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; 
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
                  padding: 15px;
                  font-weight: bold;
                  font-size: 18px;
                }
                .content { 
                  padding: 40px 30px; 
                }
                .content h2 {
                  color: #667eea;
                  font-size: 24px;
                  margin-bottom: 15px;
                }
                .highlight-box {
                  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
                  border-left: 4px solid #667eea;
                  padding: 20px;
                  margin: 25px 0;
                  border-radius: 5px;
                }
                .features {
                  margin: 30px 0;
                }
                .feature-item {
                  display: flex;
                  align-items: start;
                  margin: 15px 0;
                  padding: 15px;
                  background: #f9f9f9;
                  border-radius: 8px;
                }
                .feature-icon {
                  font-size: 24px;
                  margin-right: 15px;
                  min-width: 30px;
                }
                .button { 
                  display: inline-block; 
                  padding: 16px 40px; 
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white !important; 
                  text-decoration: none; 
                  border-radius: 30px; 
                  margin: 25px 0;
                  font-weight: bold;
                  font-size: 16px;
                  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                  transition: transform 0.2s;
                }
                .button:hover {
                  transform: translateY(-2px);
                }
                .cta-section {
                  text-align: center;
                  background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
                  padding: 30px;
                  border-radius: 10px;
                  margin: 30px 0;
                }
                .stats {
                  display: flex;
                  justify-content: space-around;
                  margin: 30px 0;
                  text-align: center;
                }
                .stat-item {
                  flex: 1;
                }
                .stat-number {
                  font-size: 32px;
                  font-weight: bold;
                  color: #667eea;
                }
                .stat-label {
                  font-size: 14px;
                  color: #666;
                  margin-top: 5px;
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
                  color: #667eea;
                  text-decoration: none;
                  margin: 0 10px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="banner">
                  🚀 WE'RE OFFICIALLY LIVE! 🚀
                </div>
                
                <div class="header">
                  <h1>Welcome to the Future of Pet Care!</h1>
                  <p style="font-size: 18px; margin-top: 15px; opacity: 0.95;">
                    ZiggySitters is now fully operational and ready to serve you
                  </p>
                </div>

                <div class="content">
                  <h2>Hi ${profile.first_name}! 🎊</h2>
                  
                  <p style="font-size: 16px;">
                    We're thrilled to announce that <strong>ZiggySitters is officially LIVE</strong> and ready to transform 
                    the way you ${isSitter ? 'provide pet care services' : 'care for your beloved pets'}!
                  </p>

                  <div class="highlight-box">
                    <h3 style="margin-top: 0; color: #667eea;">What This Means for You:</h3>
                    ${isSitter ? `
                      <p>✨ <strong>Start Accepting Real Bookings:</strong> Pet owners are actively searching for trusted sitters like you</p>
                      <p>💰 <strong>Earn Real Income:</strong> All payments are now processed securely through Stripe</p>
                      <p>🌟 <strong>Build Your Reputation:</strong> Start receiving reviews and growing your profile</p>
                      <p>📅 <strong>Flexible Schedule:</strong> Set your availability and work on your terms</p>
                    ` : `
                      <p>🐾 <strong>Find Your Perfect Sitter:</strong> Browse verified, experienced pet sitters in your area</p>
                      <p>🔒 <strong>Book with Confidence:</strong> All sitters are verified</p>
                      <p>📸 <strong>Stay Connected:</strong> Receive daily photo updates and reports during bookings</p>
                      <p>💳 <strong>Secure Payments:</strong> Safe, encrypted payment processing through Stripe</p>
                    `}
                  </div>

                  <h2>Why Choose ZiggySitters?</h2>
                  
                  <div class="features">
                    <div class="feature-item">
                      <div class="feature-icon">🛡️</div>
                      <div>
                        <strong>Verified & Trusted</strong>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                          All sitters undergo thorough background checks and document verification
                        </p>
                      </div>
                    </div>

                    <div class="feature-item">
                      <div class="feature-icon">💬</div>
                      <div>
                        <strong>Real-Time Communication</strong>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                          Chat directly with ${isSitter ? 'pet owners' : 'sitters'} and receive instant updates
                        </p>
                      </div>
                    </div>

                    <div class="feature-item">
                      <div class="feature-icon">📱</div>
                      <div>
                        <strong>Easy to Use</strong>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                          Simple, intuitive platform designed for ${isSitter ? 'managing bookings' : 'booking services'} in minutes
                        </p>
                      </div>
                    </div>

                    <div class="feature-item">
                      <div class="feature-icon">💳</div>
                      <div>
                        <strong>Secure Payments</strong>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                          Enterprise-grade payment security powered by Stripe
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="cta-section">
                    <h2 style="margin-top: 0; color: #667eea;">Ready to Get Started?</h2>
                    <p style="font-size: 16px; margin-bottom: 25px;">
                      ${isSitter 
                        ? 'Start accepting bookings today and turn your love for pets into income!' 
                        : 'Find the perfect sitter for your furry friend and book with confidence!'}
                    </p>
                    <center>
                      <a href="https://ziggysitters.com/${isSitter ? 'profile' : 'find-sitters'}" class="button">
                        ${isSitter ? '🚀 View My Dashboard' : '🔍 Find a Sitter Now'}
                      </a>
                    </center>
                  </div>

                  <div class="highlight-box">
                    <h3 style="margin-top: 0;">💡 Quick Tips to Get Started:</h3>
                    <ol style="margin: 10px 0; padding-left: 20px;">
                      ${isSitter ? `
                        <li>Complete your profile with photos and detailed descriptions</li>
                        <li>Set your availability calendar</li>
                        <li>Ensure your Stripe account is fully verified</li>
                        <li>Respond quickly to booking requests to build your reputation</li>
                      ` : `
                        <li>Complete your profile and add your pet's information</li>
                        <li>Browse sitters in your area</li>
                        <li>Read reviews and check sitter profiles</li>
                        <li>Book your first service with confidence!</li>
                      `}
                    </ol>
                  </div>

                  <p style="font-size: 16px; margin-top: 30px;">
                    Thank you for being part of our community! We're excited to see the amazing connections 
                    between pets and sitters that will happen on our platform.
                  </p>

                  <p style="font-size: 16px;">
                    Have questions? Our support team is here to help you every step of the way.
                  </p>

                  <p style="font-size: 16px; margin-top: 25px;">
                    <strong>Welcome to ZiggySitters - Where Every Pet Gets the Love They Deserve! 🐾</strong>
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

        console.log(`Email sent to ${profile.email}`);
        results.push({
          email: profile.email,
          name: profile.first_name,
          status: "sent",
          emailResponse,
        });
        emailsSent++;
      } catch (error: any) {
        console.error(`Failed to send email to ${profile.email}:`, error);
        results.push({
          email: profile.email,
          name: profile.first_name,
          status: "failed",
          error: error.message,
        });
      }
    }

    console.log(`Launch announcement complete. Sent ${emailsSent} emails`);

    return new Response(
      JSON.stringify({
        success: true,
        total_users: profiles?.length || 0,
        emails_sent: emailsSent,
        results,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-launch-announcement function:", error);
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
