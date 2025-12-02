import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationUpdateRequest {
  user_email: string;
  user_name: string;
  verification_status: 'verified' | 'rejected';
  rejection_reason?: string;
  badge_type?: 'ID' | 'Gold Star';
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      user_email,
      user_name,
      verification_status,
      rejection_reason,
      badge_type = 'ID'
    }: VerificationUpdateRequest = await req.json();

    const isApproved = verification_status === 'verified';
    const statusText = isApproved ? 'Approved' : 'Not Approved';
    const subject = isApproved 
      ? `🎉 ${badge_type === 'Gold Star' ? 'Gold Star' : 'ID'} Verification Approved!`
      : `${badge_type === 'Gold Star' ? 'Gold Star' : 'ID'} Verification Update`;

    const emailContent = isApproved ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #16a34a; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
          ${badge_type === 'Gold Star' ? '⭐' : '✅'} Congratulations ${user_name}!
        </h1>
        
        <div style="background-color: ${badge_type === 'Gold Star' ? '#fef3c7' : '#dbeafe'}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${badge_type === 'Gold Star' ? '#f59e0b' : '#3b82f6'};">
          <h2 style="color: ${badge_type === 'Gold Star' ? '#92400e' : '#1e40af'}; margin-top: 0;">Your ${badge_type} Verification Has Been Approved!</h2>
          <p style="color: ${badge_type === 'Gold Star' ? '#78350f' : '#1e40af'}; font-size: 16px;">
            ${badge_type === 'Gold Star' 
              ? 'You now have our highest trust level - the Gold Star badge! This shows pet owners you\'ve completed both ID verification AND police vet check.' 
              : 'You now have the blue "ID Verified" badge on your profile! Pet owners can see you\'re a verified sitter.'}
          </p>
        </div>

        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">What This Means:</h3>
          <ul style="color: #4b5563; line-height: 1.6;">
            <li>📈 Higher visibility in search results</li>
            <li>💰 ${badge_type === 'Gold Star' ? 'Can charge premium rates' : 'More bookings from pet owners'}</li>
            <li>🤝 Increased trust from pet owners</li>
            <li>🏆 ${badge_type === 'Gold Star' ? 'Featured as a Gold Star sitter' : 'Stand out with your ID Verified badge'}</li>
          </ul>
          ${badge_type === 'ID' ? `
            <div style="background: #eff6ff; padding: 15px; border-radius: 6px; margin-top: 15px;">
              <p style="margin: 0; color: #1e40af;"><strong>💡 Want to go further?</strong> Upload your police vet check to earn the prestigious Gold Star badge!</p>
            </div>
          ` : ''}
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://ziggysitters.com/profile" 
             style="background-color: #16a34a; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; display: inline-block;">
            View Your Profile
          </a>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            ${badge_type === 'Gold Star' ? 'Welcome to our Gold Star family!' : 'Keep up the great work!'}<br>
            The ZiggySitters Team
          </p>
        </div>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #dc2626; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
          Profile Verification Update
        </h1>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h2 style="color: #991b1b; margin-top: 0;">Hello ${user_name},</h2>
          <p style="color: #7f1d1d; font-size: 16px;">
            We have reviewed your pet sitter profile application and unfortunately, 
            we are unable to approve your profile at this time.
          </p>
        </div>

        ${rejection_reason ? `
          <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Reason for Rejection:</h3>
            <p style="color: #4b5563; font-size: 16px; background-color: #f9fafb; padding: 15px; border-radius: 6px;">
              ${rejection_reason}
            </p>
          </div>
        ` : ''}

        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">What You Can Do:</h3>
          <ul style="color: #4b5563; line-height: 1.6;">
            <li>Review and update your profile information</li>
            <li>Ensure all required documents are properly uploaded</li>
            <li>Contact our support team if you have questions</li>
            <li>Resubmit your application when ready</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://ziggysitters.com/onboarding" 
             style="background-color: #2563eb; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; display: inline-block;">
            Update Your Application
          </a>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            If you have any questions, please don't hesitate to contact us.<br>
            The Ziggy Sitters Team
          </p>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <verification@ziggysitters.com>",
      to: [user_email],
      subject: subject,
      html: emailContent,
    });

    console.log("Verification update email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending verification update email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});