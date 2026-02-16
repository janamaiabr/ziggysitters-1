import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderRequest {
  email: string;
  firstName: string;
  profileId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Pet owner onboarding reminder function started');
    
    const { email, firstName, profileId }: ReminderRequest = await req.json();
    
    console.log('Sending pet owner reminder to:', email);

    // Check what's missing from their profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('phone, suburb, city')
      .eq('id', profileId)
      .single();

    const { data: pets } = await supabase
      .from('pets')
      .select('id')
      .eq('owner_id', profileId);

    const hasPets = pets && pets.length > 0;
    const hasPhone = !!profile?.phone;
    const hasLocation = !!profile?.suburb;

    // Build personalized missing items list
    const missingItems = [];
    if (!hasPets) missingItems.push('Add your pet(s) so sitters know who they\'ll be caring for');
    if (!hasPhone) missingItems.push('Add your phone number for booking confirmations');
    if (!hasLocation) missingItems.push('Add your location to find nearby sitters');

    if (missingItems.length === 0) {
      console.log('Profile is complete, no reminder needed');
      return new Response(JSON.stringify({ success: true, message: "Profile already complete" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <hello@ziggysitters.com>",
      to: [email],
      subject: `🐾 ${firstName}, your pet is waiting to meet their perfect sitter!`,
      headers: {
        'List-Unsubscribe': `<mailto:unsubscribe@ziggysitters.com?subject=Unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
              .header h1 { margin: 0; font-size: 24px; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .checklist { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .checklist-item { display: flex; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
              .checklist-item:last-child { border-bottom: none; }
              .checkbox { width: 24px; height: 24px; border: 2px solid #d1d5db; border-radius: 4px; margin-right: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
              .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px 0; }
              .btn-secondary { background: white; color: #6366f1 !important; border: 2px solid #6366f1; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
              .highlight { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Complete Your Profile 🐾</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Find the perfect sitter for your furry friend</p>
            </div>
            
            <div class="content">
              <p style="font-size: 18px;">Hi ${firstName}!</p>
              
              <p>We noticed you signed up for ZiggySitters but haven't finished setting up your profile yet. Completing your profile helps our trusted sitters prepare for your pet and makes booking faster!</p>

              <div class="highlight">
                <strong>💡 Did you know?</strong> Pet owners with complete profiles are 3x more likely to get quick responses from sitters!
              </div>

              <div class="checklist">
                <h3 style="margin-top: 0; color: #6366f1;">Quick checklist:</h3>
                ${missingItems.map(item => `
                  <div class="checklist-item">
                    <div class="checkbox"></div>
                    <span>${item}</span>
                  </div>
                `).join('')}
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://ziggysitters.com/profile" class="btn">Complete My Profile</a>
                <br>
                <a href="https://ziggysitters.com/find-sitters" class="btn btn-secondary" style="margin-top: 10px;">Browse Sitters First</a>
              </div>

              <p style="color: #6b7280; font-size: 14px;">
                Already have a sitter in mind? You can still search and book - just add your pet details during checkout!
              </p>
            </div>

            <div class="footer">
              <p>Questions? Reply to this email or contact us at hello@ziggysitters.com</p>
              <p style="font-size: 12px; color: #9ca3af;">
                You're receiving this because you signed up for ZiggySitters. 
                <a href="mailto:unsubscribe@ziggysitters.com?subject=Unsubscribe" style="color: #6b7280;">Unsubscribe</a>
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Pet owner onboarding reminder sent successfully:", emailResponse);

    // Update last reminder timestamp
    await supabase
      .from('profiles')
      .update({ last_onboarding_reminder_at: new Date().toISOString() })
      .eq('id', profileId);

    return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending pet owner onboarding reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
