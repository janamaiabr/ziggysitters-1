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
                  body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
                  .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                  .badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin: 10px 5px; }
                  .badge-new { background: #f3f4f6; color: #6b7280; border: 2px solid #d1d5db; }
                  .btn { display: inline-block; padding: 12px 24px; background: #6366f1; color: white !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 5px; }
                  .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1 style="margin: 0; font-size: 32px;">🎉 Welcome to ZiggySitters!</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px;">You're now live on the platform</p>
                  </div>
                  
                  <div class="content">
                    <h2 style="color: #111827;">Hi ${profile.first_name}!</h2>
                    <p style="color: #4b5563;">Congratulations on completing your onboarding! 🎊</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
                      <p style="margin: 0; color: #4b5563;"><strong>Great news:</strong> Pet owners can now find and book you! Your profile is live with a "New Sitter" status.</p>
                    </div>

                    <div class="badge badge-new">🆕 New Sitter</div>

                    <h3 style="color: #111827; margin-top: 30px;">Build Trust with Verification Badges:</h3>
                    <ul style="color: #4b5563; line-height: 1.8;">
                      <li>📤 <strong>Upload your ID</strong> to earn the blue "ID Verified" badge</li>
                      <li>⭐ <strong>Submit a police vet check</strong> to earn the gold "Gold Star Verified" badge</li>
                      <li>💰 <strong>Connect your bank account</strong> via Stripe to receive payments</li>
                    </ul>

                    <p style="color: #4b5563;">Verified sitters get more bookings and can charge higher rates!</p>

                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://ziggysitters.com/profile?tab=verification" class="btn">Complete Verification</a>
                    </div>

                    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <p style="color: #78350f; margin: 0;"><strong>Tip:</strong> You don't need a business number (NZBN) for Stripe - you're working as an individual through ZiggySitters.</p>
                    </div>
                  </div>

                  <div class="footer">
                    <p style="margin: 5px 0;">Questions? Contact us at hello@ziggysitters.com</p>
                  </div>
                </div>
              </body>
            </html>
          `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    // Only send admin notification for PET OWNERS (not sitters)
    // Sitters will trigger admin notification when they upload documents
    // This prevents confusing "approval needed" emails for sitters with no documents
    if (role !== 'pet_sitter') {
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
        console.log("Enhanced admin notification sent for new pet owner");
      } catch (error) {
        console.error("Failed to send admin notification:", error);
        // Don't fail if admin email fails
      }
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
