import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaign, userType } = await req.json();

    console.log(`Generating preview for campaign: ${campaign}, userType: ${userType}`);

    let html = '';

    if (campaign === 'black_friday_promo') {
      const isOwner = userType === 'pet_owner';
      const isSitter = userType === 'pet_sitter';

      html = `
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
                <h1>Welcome to Ziggysitters ✨</h1>
                <p style="font-size: 18px; margin: 10px 0 0 0;">Black Friday Treat</p>
              </div>
              <div class="content">
                ${isOwner ? `
                  <p>Hi Ziggysitters community,</p>
                  
                  <p>To welcome you into our growing Auckland community, we're sharing a special Black Friday offer that's all about care — the heart of everything we do.</p>
                  
                  <h2 style="color: #667eea;">🐾 Enjoy 50% off Ziggy fees on any new booking!</h2>
                  <p>Book and pay for your Ziggysitters booking before midnight 30 November and save 50% on platform fees using code <code style="background: #f7fafc; padding: 2px 8px; border-radius: 4px; color: #667eea; font-weight: bold;">BLACKFRIDAY50</code></p>
                  
                  <p>It's our way of saying thanks for joining us early and helping shape a caring, trusted space for pets and the people who love them.</p>
                  
                  <p>If you've been thinking about lining up a holiday sit or planning a weekend away, now's the perfect time to lock in someone wonderful to mind your furry family member.</p>
                  
                  <div class="promo-code">
                    <p style="margin: 0 0 10px 0; font-size: 16px;">Your Welcome Code:</p>
                    <code>BLACKFRIDAY50</code>
                    <p style="margin: 10px 0 0 0; font-size: 14px; color: #718096;">Valid until midnight 30 November</p>
                  </div>
                  
                  <p style="font-style: italic; color: #718096;">No codes, no fuss — just a warm welcome and a feel-good deal.</p>
                  
                  <div style="text-align: center;">
                    <a href="https://www.ziggysitters.com/find-sitters" class="cta">Find Your Perfect Sitter</a>
                  </div>
                  
                  <p style="margin-top: 30px;">With thanks and tail wags,</p>
                  <p><strong>The Ziggysitters Team 🐶✨</strong></p>
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
                    <a href="https://www.ziggysitters.com/calendar" class="cta">View Your Calendar</a>
                  </div>
                  
                  <p style="margin-top: 30px;">Happy booking!</p>
                  <p><strong>The ZiggySitters Team</strong></p>
                ` : `
                  <p>This Black Friday, we're offering <span class="highlight">50% OFF</span> platform fees!</p>
                  
                  <div class="promo-code">
                    <p style="margin: 0 0 10px 0; font-size: 16px;">Your Black Friday Code:</p>
                    <code>BLACKFRIDAY50</code>
                    <p style="margin: 10px 0 0 0; font-size: 14px; color: #718096;">Valid through November 30th</p>
                  </div>
                  
                  <div style="text-align: center;">
                    <a href="https://www.ziggysitters.com" class="cta">Visit ZiggySitters</a>
                  </div>
                  
                  <p style="margin-top: 30px;">Happy booking!</p>
                  <p><strong>The ZiggySitters Team</strong></p>
                `}
              </div>
              
              <div class="footer">
                <p>ZiggySitters - Trusted Pet Care in New Zealand</p>
                <p style="font-size: 12px; color: #a0aec0;">
                  You're receiving this because you're subscribed to marketing emails.<br>
                  <a href="https://www.ziggysitters.com/profile" style="color: #667eea;">Manage email preferences</a> | 
                  <a href="https://www.ziggysitters.com/profile" style="color: #667eea;">Unsubscribe</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `;
    } else {
      html = '<p>Preview not available for this campaign type yet.</p>';
    }

    return new Response(
      JSON.stringify({ html }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error generating preview:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
