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

    // Check if this is a single email send from admin (with specific recipient)
    let requestBody;
    try {
      requestBody = await req.json();
    } catch {
      requestBody = null;
    }

    // Single email mode - admin sending to specific recipient
    if (requestBody && requestBody.sitterName && requestBody.profileUrl) {
      const { sitterName, profileUrl, email } = requestBody;
      
      if (!email) {
        throw new Error("Email address is required for single send");
      }

      console.log(`Sending ID submission reminder to ${email}`);

      const emailResponse = await resend.emails.send({
        from: "ZiggySitters <welcome@ziggysitters.com>",
        to: [email],
        subject: "📝 Submit Your ID to Get Verified and Start Receiving Bookings!",
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
                background: linear-gradient(45deg, #4ade80, #22c55e);
                color: white;
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
                color: #667eea;
                margin-right: 15px;
                min-width: 35px;
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
              }
              .cta-section {
                text-align: center;
                background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
                padding: 30px;
                border-radius: 10px;
                margin: 30px 0;
              }
              .benefits-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin: 25px 0;
              }
              .benefit-box {
                background: #f0f4ff;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
              }
              .benefit-icon {
                font-size: 32px;
                margin-bottom: 8px;
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
                🚀 One Step Away from Getting Verified!
              </div>
              
              <div class="header">
                <h1>Submit Your ID to Get Verified</h1>
                <p style="font-size: 18px; margin-top: 15px; opacity: 0.95;">
                  Start receiving bookings and earning income today!
                </p>
              </div>

              <div class="content">
                <h2>Hi ${sitterName}! 👋</h2>
                
                <p style="font-size: 16px;">
                  We noticed that you haven't submitted your ID document yet. <strong>This is the final step</strong> 
                  to get verified on ZiggySitters and start receiving bookings from pet owners!
                </p>

                <div class="highlight-box">
                  <h3 style="margin-top: 0; color: #667eea;">Why Verification Matters:</h3>
                  <p style="margin: 10px 0;">
                    Pet owners only book with <strong>verified sitters</strong>. Without verification, your profile 
                    won't appear in search results, and you won't receive any booking requests.
                  </p>
                </div>

                <h2>Benefits of Getting Verified:</h2>
                
                <div class="benefits-grid">
                  <div class="benefit-box">
                    <div class="benefit-icon">✅</div>
                    <strong>Appear in Search</strong>
                    <p style="font-size: 13px; margin: 5px 0 0 0; color: #666;">
                      Be discoverable by pet owners
                    </p>
                  </div>
                  
                  <div class="benefit-box">
                    <div class="benefit-icon">💰</div>
                    <strong>Start Earning</strong>
                    <p style="font-size: 13px; margin: 5px 0 0 0; color: #666;">
                      Accept bookings and get paid
                    </p>
                  </div>
                  
                  <div class="benefit-box">
                    <div class="benefit-icon">🛡️</div>
                    <strong>Build Trust</strong>
                    <p style="font-size: 13px; margin: 5px 0 0 0; color: #666;">
                      Show you're a trusted sitter
                    </p>
                  </div>
                  
                  <div class="benefit-box">
                    <div class="benefit-icon">⭐</div>
                    <strong>Stand Out</strong>
                    <p style="font-size: 13px; margin: 5px 0 0 0; color: #666;">
                      Verified badge on profile
                    </p>
                  </div>
                </div>

                <h2>How to Submit Your ID (Takes 2 Minutes!):</h2>
                
                <div class="steps">
                  <div class="step-item">
                    <div class="step-number">1.</div>
                    <div>
                      <strong>Go to Your Profile</strong>
                      <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                        Click the button below to access your profile page
                      </p>
                    </div>
                  </div>

                  <div class="step-item">
                    <div class="step-number">2.</div>
                    <div>
                      <strong>Navigate to Verification Tab</strong>
                      <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                        Click on the "Verification" tab in your profile
                      </p>
                    </div>
                  </div>

                  <div class="step-item">
                    <div class="step-number">3.</div>
                    <div>
                      <strong>Upload Your ID</strong>
                      <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                        Take a clear photo of your NZ Driver's License or Passport
                      </p>
                    </div>
                  </div>

                  <div class="step-item">
                    <div class="step-number">4.</div>
                    <div>
                      <strong>Get Verified!</strong>
                      <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                        We'll review and verify your account within 24 hours
                      </p>
                    </div>
                  </div>
                </div>

                <div class="cta-section">
                  <h2 style="margin-top: 0; color: #667eea;">Ready to Get Verified?</h2>
                  <p style="font-size: 16px; margin-bottom: 25px;">
                    Submit your ID now and start receiving bookings today!
                  </p>
                  <center>
                    <a href="${profileUrl}" class="button">
                      🆔 Upload Your ID Now
                    </a>
                  </center>
                </div>

                <div class="highlight-box">
                  <h3 style="margin-top: 0;">📸 ID Photo Tips:</h3>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Ensure all text is clearly readable</li>
                    <li>Photo should be well-lit (no shadows or glare)</li>
                    <li>Include the full document in the frame</li>
                    <li>Accepted: NZ Driver's License, Passport, or Kiwi Access Card</li>
                  </ul>
                </div>

                <p style="font-size: 16px; margin-top: 30px;">
                  <strong>Don't miss out on earning opportunities!</strong> Pet owners are actively searching 
                  for verified sitters right now. Complete your verification today and start your pet care journey!
                </p>

                <p style="font-size: 16px;">
                  Questions? Our support team is here to help at 
                  <a href="https://ziggysitters.com/contact" style="color: #667eea;">contact us</a>.
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

      console.log(`ID submission reminder sent to ${email}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Email sent successfully",
          email: email,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Bulk send mode - send to all sitters without ID documents
    console.log("Fetching sitters without ID documents...");

    // Get all sitters without ID documents who are not test accounts
    const { data: sitters, error: sittersError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, first_name, last_name")
      .eq("role", "pet_sitter")
      .eq("is_test_account", false)
      .or("id_document_url.is.null,id_document_url.eq.")
      .order("created_at", { ascending: true });

    if (sittersError) {
      console.error("Error fetching sitters:", sittersError);
      throw sittersError;
    }

    console.log(`Found ${sitters?.length || 0} sitters without ID documents`);

    const results = [];
    let emailsSent = 0;

    for (const sitter of sitters || []) {
      try {
        const emailResponse = await resend.emails.send({
          from: "ZiggySitters <welcome@ziggysitters.com>",
          to: [sitter.email],
          subject: "📝 Submit Your ID to Get Verified and Start Receiving Bookings!",
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
                  background: linear-gradient(45deg, #4ade80, #22c55e);
                  color: white;
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
                  color: #667eea;
                  margin-right: 15px;
                  min-width: 35px;
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
                .benefits-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 15px;
                  margin: 25px 0;
                }
                .benefit-box {
                  background: #f0f4ff;
                  padding: 15px;
                  border-radius: 8px;
                  text-align: center;
                }
                .benefit-icon {
                  font-size: 32px;
                  margin-bottom: 8px;
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
                  🚀 One Step Away from Getting Verified!
                </div>
                
                <div class="header">
                  <h1>Submit Your ID to Get Verified</h1>
                  <p style="font-size: 18px; margin-top: 15px; opacity: 0.95;">
                    Start receiving bookings and earning income today!
                  </p>
                </div>

                <div class="content">
                  <h2>Hi ${sitter.first_name}! 👋</h2>
                  
                  <p style="font-size: 16px;">
                    We noticed that you haven't submitted your ID document yet. <strong>This is the final step</strong> 
                    to get verified on ZiggySitters and start receiving bookings from pet owners!
                  </p>

                  <div class="highlight-box">
                    <h3 style="margin-top: 0; color: #667eea;">Why Verification Matters:</h3>
                    <p style="margin: 10px 0;">
                      Pet owners only book with <strong>verified sitters</strong>. Without verification, your profile 
                      won't appear in search results, and you won't receive any booking requests.
                    </p>
                  </div>

                  <h2>Benefits of Getting Verified:</h2>
                  
                  <div class="benefits-grid">
                    <div class="benefit-box">
                      <div class="benefit-icon">✅</div>
                      <strong>Appear in Search</strong>
                      <p style="font-size: 13px; margin: 5px 0 0 0; color: #666;">
                        Be discoverable by pet owners
                      </p>
                    </div>
                    
                    <div class="benefit-box">
                      <div class="benefit-icon">💰</div>
                      <strong>Start Earning</strong>
                      <p style="font-size: 13px; margin: 5px 0 0 0; color: #666;">
                        Accept bookings and get paid
                      </p>
                    </div>
                    
                    <div class="benefit-box">
                      <div class="benefit-icon">🛡️</div>
                      <strong>Build Trust</strong>
                      <p style="font-size: 13px; margin: 5px 0 0 0; color: #666;">
                        Show you're a trusted sitter
                      </p>
                    </div>
                    
                    <div class="benefit-box">
                      <div class="benefit-icon">⭐</div>
                      <strong>Stand Out</strong>
                      <p style="font-size: 13px; margin: 5px 0 0 0; color: #666;">
                        Verified badge on profile
                      </p>
                    </div>
                  </div>

                  <h2>How to Submit Your ID (Takes 2 Minutes!):</h2>
                  
                  <div class="steps">
                    <div class="step-item">
                      <div class="step-number">1.</div>
                      <div>
                        <strong>Go to Your Profile</strong>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                          Click the button below to access your profile page
                        </p>
                      </div>
                    </div>

                    <div class="step-item">
                      <div class="step-number">2.</div>
                      <div>
                        <strong>Navigate to Verification Tab</strong>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                          Click on the "Verification" tab in your profile
                        </p>
                      </div>
                    </div>

                    <div class="step-item">
                      <div class="step-number">3.</div>
                      <div>
                        <strong>Upload Your ID</strong>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                          Take a clear photo of your NZ Driver's License or Passport
                        </p>
                      </div>
                    </div>

                    <div class="step-item">
                      <div class="step-number">4.</div>
                      <div>
                        <strong>Get Verified!</strong>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                          We'll review and verify your account within 24 hours
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="cta-section">
                    <h2 style="margin-top: 0; color: #667eea;">Ready to Get Verified?</h2>
                    <p style="font-size: 16px; margin-bottom: 25px;">
                      Submit your ID now and start receiving bookings today!
                    </p>
                    <center>
                      <a href="https://ziggysitters.com/profile" class="button">
                        🆔 Upload Your ID Now
                      </a>
                    </center>
                  </div>

                  <div class="highlight-box">
                    <h3 style="margin-top: 0;">📸 ID Photo Tips:</h3>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                      <li>Ensure all text is clearly readable</li>
                      <li>Photo should be well-lit (no shadows or glare)</li>
                      <li>Include the full document in the frame</li>
                      <li>Accepted: NZ Driver's License, Passport, or Kiwi Access Card</li>
                    </ul>
                  </div>

                  <p style="font-size: 16px; margin-top: 30px;">
                    <strong>Don't miss out on earning opportunities!</strong> Pet owners are actively searching 
                    for verified sitters right now. Complete your verification today and start your pet care journey!
                  </p>

                  <p style="font-size: 16px;">
                    Questions? Our support team is here to help at 
                    <a href="https://ziggysitters.com/contact" style="color: #667eea;">contact us</a>.
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

        console.log(`ID submission reminder sent to ${sitter.email}`);
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

    console.log(`ID submission reminders complete. Sent ${emailsSent} emails`);

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
    console.error("Error in send-id-submission-reminder function:", error);
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
