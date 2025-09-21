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
      rejection_reason
    }: VerificationUpdateRequest = await req.json();

    const isApproved = verification_status === 'verified';
    const subject = isApproved 
      ? "🎉 Profile Approved - Welcome to Ziggy Sitters!"
      : "Profile Verification Update";

    const emailContent = isApproved ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #16a34a; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
          🎉 Congratulations ${user_name}!
        </h1>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
          <h2 style="color: #166534; margin-top: 0;">Your Profile Has Been Approved!</h2>
          <p style="color: #15803d; font-size: 16px;">
            Great news! Your pet sitter profile has been successfully verified and approved. 
            You are now live on the Ziggy Sitters platform and can start receiving booking requests.
          </p>
        </div>

        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">What's Next?</h3>
          <ul style="color: #4b5563; line-height: 1.6;">
            <li>Your profile is now visible to pet owners searching for sitters</li>
            <li>Make sure your availability calendar is up to date</li>
            <li>Review your service offerings and pricing</li>
            <li>Respond promptly to booking requests to maintain a high response rate</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://ziggysitters.com/profile" 
             style="background-color: #16a34a; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; display: inline-block;">
            Manage Your Profile
          </a>
        </div>

        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>Tips for Success:</strong> Complete your profile with high-quality photos, detailed service descriptions, and competitive pricing to attract more bookings.
          </p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Welcome to the Ziggy Sitters family!<br>
            The Ziggy Sitters Team
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
          <a href="https://ziggysitters.com/profile" 
             style="background-color: #2563eb; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; display: inline-block;">
            Update Your Profile
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
      from: "Ziggy Sitters <notifications@ziggysitters.com>",
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