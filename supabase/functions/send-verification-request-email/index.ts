import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequestData {
  user_id: string;
  documents_uploaded: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user_id, documents_uploaded }: VerificationRequestData = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    );

    // Get user profile details
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, first_name, last_name, email, bio, suburb, city')
      .eq('user_id', user_id)
      .maybeSingle();

    if (profileError) {
      throw new Error(`Database error: ${profileError.message}`);
    }
    
    if (!profile) {
      throw new Error('Failed to fetch user profile');
    }

    // Get sitter services
    const { data: services } = await supabaseClient
      .from('sitter_services')
      .select('service_type, hourly_rate, daily_rate, overnight_rate, description, experience_years')
      .eq('sitter_id', profile.id);

    const user_name = `${profile.first_name} ${profile.last_name}`;
    const user_email = profile.email;

    // Send email to administrators
    const servicesList = services?.map(s => 
      `${s.service_type.replace(/_/g, ' ')} - $${s.hourly_rate || s.daily_rate || s.overnight_rate}/unit`
    ).join(', ') || 'No services configured';

    const adminEmailResponse = await resend.emails.send({
      from: "ZiggySitters <verification@ziggysitters.com>",
      to: ["janamaia@gmail.com"],
      subject: "New Sitter Application - Approval Required",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">New Sitter Application</h1>
          <p>A new sitter has completed their profile and is awaiting approval:</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>Sitter Details:</h2>
            <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 8px;"><strong>Name:</strong> ${user_name}</li>
              <li style="margin-bottom: 8px;"><strong>Email:</strong> ${user_email}</li>
              <li style="margin-bottom: 8px;"><strong>Location:</strong> ${profile.suburb}, ${profile.city}</li>
              <li style="margin-bottom: 8px;"><strong>User ID:</strong> ${user_id}</li>
              <li style="margin-bottom: 8px;"><strong>Documents Uploaded:</strong> ${documents_uploaded ? 'Yes' : 'No'}</li>
              <li style="margin-bottom: 8px;"><strong>Experience:</strong> ${services?.[0]?.experience_years || 0} years</li>
              <li style="margin-bottom: 8px;"><strong>Services:</strong> ${servicesList}</li>
            </ul>
            
            ${profile.bio ? `<h3>Bio:</h3><p style="font-style: italic;">${profile.bio}</p>` : ''}
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Action Required:</strong> Please review their complete profile and approve or reject their application in the admin dashboard.</p>
          </div>
          
          <p><a href="https://ziggysitters.lovableproject.com/admin" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Admin Dashboard</a></p>
          
          <p>Best regards,<br>ZiggySitters System</p>
        </div>
      `,
    });

    // Send confirmation email to user
    const userEmailResponse = await resend.emails.send({
      from: "ZiggySitters <verification@ziggysitters.com>",
      to: [user_email],
      subject: "Profile Submitted for Review",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Profile Submitted Successfully!</h1>
          
          <p>Hi ${user_name},</p>
          
          <p>Thank you for completing your sitter profile! Your application has been submitted and is now under review.</p>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>What happens next?</h3>
            <ul>
              <li>Our team will review your profile, services, and any uploaded documents within 24-48 hours</li>
              <li>We may contact you if additional information is needed</li>
              <li>You'll receive an email notification once your profile has been approved</li>
              <li>Once approved, your profile will be visible to pet owners and you can start receiving booking requests!</li>
            </ul>
          </div>
          
          <p>In the meantime, you can browse other sitters to see how they structure their profiles, or explore the platform to familiarize yourself with how bookings work.</p>
          
          <p>If you have any questions, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br>The ZiggySitters Team</p>
        </div>
      `,
    });

    console.log("Verification request emails sent successfully");

    return new Response(JSON.stringify({ 
      success: true,
      admin_email: adminEmailResponse,
      user_email: userEmailResponse 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending verification request email:", error);
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