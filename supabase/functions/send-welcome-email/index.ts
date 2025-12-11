import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  firstName: string;
  role: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, role }: WelcomeEmailRequest = await req.json();
    console.log("Sending welcome email to:", email, "Role:", role);

    // For SITTERS: Send the comprehensive sitter welcome email instead
    if (role === 'pet_sitter') {
      console.log("Triggering sitter-specific welcome email for:", email);
      
      try {
        const sitterWelcomeResponse = await fetch(`${supabaseUrl}/functions/v1/send-sitter-welcome`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            sitterEmail: email,
            sitterName: firstName || 'there',
            profileUrl: 'https://ziggysitters.co.nz/profile',
          }),
        });

        if (sitterWelcomeResponse.ok) {
          console.log("Sitter welcome email sent successfully");
        } else {
          const errorText = await sitterWelcomeResponse.text();
          console.error("Failed to send sitter welcome email:", errorText);
        }
      } catch (sitterEmailError) {
        console.error("Error calling sitter welcome function:", sitterEmailError);
      }

      // Also notify admin about new sitter signup
      try {
        await resend.emails.send({
          from: "ZiggySitters <hello@ziggysitters.co.nz>",
          to: ["janamaia@gmail.com"],
          subject: `🆕 New Sitter Signup: ${firstName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #8B5CF6;">New Pet Sitter Registration</h2>
              <p><strong>Name:</strong> ${firstName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Status:</strong> Just signed up - awaiting profile completion</p>
              <p style="color: #64748b; margin-top: 20px;">
                They will receive automated reminders if they don't complete their profile.
                You'll receive another notification when they upload verification documents.
              </p>
            </div>
          `,
        });
        console.log("Admin notification sent for new sitter");
      } catch (adminError) {
        console.error("Failed to send admin notification:", adminError);
      }

      return new Response(JSON.stringify({ success: true, message: "Sitter welcome email sent" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // For PET OWNERS: Send standard welcome email
    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <hello@ziggysitters.co.nz>",
      to: [email],
      subject: "Welcome to ZiggySitters! 🐾",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .btn { display: inline-block; padding: 12px 24px; background: #6366f1; color: white !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 5px; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">Welcome to ZiggySitters! 🎉</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Your trusted pet care community</p>
              </div>
              
              <div class="content">
                <h2 style="color: #111827;">Hi ${firstName}!</h2>
                <p style="color: #4b5563;">Thank you for joining ZiggySitters! We're excited to help you find the perfect care for your furry friends.</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
                  <p style="margin: 0; color: #4b5563;"><strong>What's next?</strong> Complete your profile and add your pets to start searching for trusted sitters in your area.</p>
                </div>

                <h3 style="color: #111827; margin-top: 30px;">Getting Started:</h3>
                <ul style="color: #4b5563; line-height: 1.8;">
                  <li>📝 <strong>Complete your profile</strong> with your contact details</li>
                  <li>🐾 <strong>Add your pets</strong> so sitters know who they'll be caring for</li>
                  <li>🔍 <strong>Search for sitters</strong> in your area</li>
                  <li>📅 <strong>Book with confidence</strong> - all sitters are verified</li>
                </ul>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://ziggysitters.co.nz/profile" class="btn">Complete My Profile</a>
                </div>
              </div>

              <div class="footer">
                <p style="margin: 5px 0;">Questions? Contact us at hello@ziggysitters.co.nz</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Pet owner welcome email sent successfully:", emailResponse);

    // Send admin notification for pet owners
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      const { data: searches } = await supabase
        .from('search_events')
        .select('*')
        .eq('user_id', profile?.id)
        .order('search_timestamp', { ascending: false })
        .limit(5);

      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('owner_id', profile?.id);

      let searchSummary = 'No searches yet';
      if (searches && searches.length > 0) {
        searchSummary = searches.map(s => {
          const parts = [];
          if (s.suburb) parts.push(`📍 ${s.suburb}`);
          if (s.service_type) parts.push(`🛏️ ${s.service_type.replace(/_/g, ' ')}`);
          if (s.pet_species?.length) parts.push(`🐾 ${s.pet_species.join(', ')}`);
          if (s.clicked_sitter_ids?.length) parts.push(`👆 Clicked ${s.clicked_sitter_ids.length} sitters`);
          return parts.join(' | ') || 'Generic search';
        }).join('<br>');
      }

      const { data: pets } = await supabase
        .from('pets')
        .select('name, species, size')
        .eq('owner_id', profile?.id);

      let petsInfo = '<p>⚠️ <strong>No pets added yet</strong></p>';
      if (pets && pets.length > 0) {
        petsInfo = `
          <h3>🐾 Pets Added (${pets.length})</h3>
          <ul>
            ${pets.map(p => `<li>${p.name} - ${p.species}${p.size ? ` (${p.size})` : ''}</li>`).join('')}
          </ul>
        `;
      }

      await resend.emails.send({
        from: "ZiggySitters <hello@ziggysitters.co.nz>",
        to: ["janamaia@gmail.com"],
        subject: `🏠 New Pet Owner: ${firstName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #667eea; margin-top: 0;">👤 New Pet Owner Registration</h2>
              
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">📋 Basic Information</h3>
                <p style="margin: 5px 0;"><strong>Name:</strong> ${firstName}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> ${profile?.phone || '❌ Not provided'}</p>
                <p style="margin: 5px 0;"><strong>Location:</strong> ${profile?.suburb ? `${profile.suburb}, ${profile.city}` : '❌ Not provided'}</p>
                <p style="margin: 5px 0;"><strong>Registered:</strong> ${new Date().toLocaleString()}</p>
              </div>

              ${petsInfo}

              <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">🔍 Search Activity</h3>
                <div style="font-size: 14px; line-height: 1.8;">
                  ${searchSummary}
                </div>
              </div>

              <div style="background: #fef3f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">📅 Bookings</h3>
                <p>${bookings && bookings.length > 0 ? `✅ Has ${bookings.length} booking(s)` : '❌ No bookings yet'}</p>
              </div>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center;">
                <a href="https://ziggysitters.co.nz/admin/user-details/${profile?.id}" 
                   style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  View Full Profile
                </a>
              </div>
            </div>
          </div>
        `,
      });
      console.log("Admin notification sent for new pet owner");
    } catch (adminError) {
      console.error("Failed to send admin notification:", adminError);
    }

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
