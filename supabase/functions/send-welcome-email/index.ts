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

    const roleMessage = role === 'pet_sitter' 
      ? 'As a pet sitter, you can now complete your profile, upload verification documents, and start receiving booking requests from pet owners.'
      : 'As a pet owner, you can now add your pets, search for trusted sitters, and book services.';

    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <welcome@ziggysitters.com>",
      to: [email],
      subject: "Welcome to ZiggySitters! 🐾",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ZiggySitters! 🎉</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName}!</h2>
              <p>Thank you for joining ZiggySitters, where pet lovers connect!</p>
              <p>${roleMessage}</p>
              <h3>Next Steps:</h3>
              <ul>
                ${role === 'pet_sitter' ? `
                  <li>Complete your sitter profile</li>
                  <li>Upload verification documents for approval</li>
                  <li>Set your availability and rates</li>
                  <li>Start receiving booking requests!</li>
                ` : `
                  <li>Complete your profile information</li>
                  <li>Add your pet's details</li>
                  <li>Browse available sitters in your area</li>
                  <li>Book your first service!</li>
                `}
              </ul>
              <center>
                <a href="https://82b1d4df-49fa-4aed-8283-e8671c38c6b4.lovableproject.com/onboarding" class="button">
                  Complete Your Profile
                </a>
              </center>
              <p>If you have any questions, feel free to reach out to our support team.</p>
              <p>Best regards,<br>The ZiggySitters Team</p>
            </div>
            <div class="footer">
              <p>© 2025 ZiggySitters. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    // Gather comprehensive user data for admin notification
    try {
      // Get user profile details
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      // Get search activity
      const { data: searches } = await supabase
        .from('search_events')
        .select('*')
        .eq('user_id', profile?.id)
        .order('search_timestamp', { ascending: false })
        .limit(5);

      // Get bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .or(`owner_id.eq.${profile?.id},sitter_id.eq.${profile?.id}`);

      // Build search activity summary
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

      // Determine onboarding status
      const onboardingStatus = profile?.onboarding_completed 
        ? '✅ Completed' 
        : '⚠️ Incomplete';

      // Determine booking status and why they haven't booked
      let bookingInsight = '';
      if (!bookings || bookings.length === 0) {
        bookingInsight = `
          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 10px 0;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">🚫 No Bookings Yet</h4>
            <p style="margin: 5px 0;"><strong>Possible reasons:</strong></p>
            <ul style="margin: 5px 0;">
              ${!profile?.onboarding_completed ? '<li>❌ Onboarding not completed</li>' : ''}
              ${searches && searches.length === 0 ? '<li>❌ No searches performed</li>' : ''}
              ${searches && searches.length > 0 && !searches.some(s => s.clicked_sitter_ids?.length) ? '<li>❌ Searches performed but no sitters clicked</li>' : ''}
              ${searches && searches.some(s => s.clicked_sitter_ids?.length) ? '<li>⚠️ Clicked sitters but didn\'t complete booking</li>' : ''}
              ${role === 'pet_owner' && !profile?.phone ? '<li>❌ Missing contact information</li>' : ''}
            </ul>
          </div>
        `;
      } else {
        bookingInsight = `✅ Has ${bookings.length} booking(s)`;
      }

      // Build pets info if pet owner
      let petsInfo = '';
      if (role === 'pet_owner') {
        const { data: pets } = await supabase
          .from('pets')
          .select('name, species, size')
          .eq('owner_id', profile?.id);
        
        if (pets && pets.length > 0) {
          petsInfo = `
            <h3>🐾 Pets Added (${pets.length})</h3>
            <ul>
              ${pets.map(p => `<li>${p.name} - ${p.species}${p.size ? ` (${p.size})` : ''}</li>`).join('')}
            </ul>
          `;
        } else {
          petsInfo = '<p>⚠️ <strong>No pets added yet</strong></p>';
        }
      }

      // Build sitter info if pet sitter
      let sitterInfo = '';
      if (role === 'pet_sitter') {
        const { data: services } = await supabase
          .from('sitter_services')
          .select('*')
          .eq('sitter_id', profile?.id);

        const verificationStatus = profile?.verification_status || 'pending';
        const stripeStatus = profile?.stripe_onboarding_completed ? '✅ Complete' : '❌ Incomplete';
        
        sitterInfo = `
          <h3>🎯 Sitter Details</h3>
          <ul>
            <li><strong>Verification Status:</strong> ${verificationStatus}</li>
            <li><strong>Stripe Setup:</strong> ${stripeStatus}</li>
            <li><strong>Services Configured:</strong> ${services?.length || 0}</li>
            ${profile?.id_document_urls?.length ? `<li>✅ ID Documents uploaded</li>` : '<li>⚠️ No ID documents</li>'}
          </ul>
        `;
      }

      await resend.emails.send({
        from: "ZiggySitters <welcome@ziggysitters.com>",
        to: ["janamaia@gmail.com"],
        subject: `🔔 New User: ${firstName} - ${role === 'pet_sitter' ? 'Pet Sitter' : 'Pet Owner'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #667eea; margin-top: 0;">👤 New User Registration</h2>
              
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">📋 Basic Information</h3>
                <p style="margin: 5px 0;"><strong>Name:</strong> ${firstName}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 5px 0;"><strong>Role:</strong> ${role === 'pet_sitter' ? '🧑‍💼 Pet Sitter' : '🏠 Pet Owner'}</p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> ${profile?.phone || '❌ Not provided'}</p>
                <p style="margin: 5px 0;"><strong>Location:</strong> ${profile?.suburb ? `${profile.suburb}, ${profile.city}` : '❌ Not provided'}</p>
                <p style="margin: 5px 0;"><strong>Registered:</strong> ${new Date().toLocaleString()}</p>
              </div>

              <div style="background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">📊 Onboarding Status</h3>
                <p style="margin: 5px 0; font-size: 18px;"><strong>${onboardingStatus}</strong></p>
              </div>

              ${petsInfo}
              ${sitterInfo}

              <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">🔍 Search Activity (${searches?.length || 0} searches)</h3>
                <div style="font-size: 14px; line-height: 1.8;">
                  ${searchSummary}
                </div>
              </div>

              <div style="background: #fef3f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">📅 Booking Status</h3>
                ${bookingInsight}
              </div>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center;">
                <a href="https://82b1d4df-49fa-4aed-8283-e8671c38c6b4.lovableproject.com/admin/user-details/${profile?.id}" 
                   style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  View Full Profile in Admin Dashboard
                </a>
              </div>
            </div>
          </div>
        `,
      });
      console.log("Enhanced admin notification sent for new user");
    } catch (error) {
      console.error("Failed to send admin notification:", error);
      // Don't fail if admin email fails
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
