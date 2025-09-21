import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequestData {
  user_name: string;
  user_email: string;
  user_id: string;
  documents_uploaded: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_name, user_email, user_id, documents_uploaded }: VerificationRequestData = await req.json();

    console.log('Sending verification request email for user:', user_email);

    // Send email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "ZiggySitters <noreply@ziggysitters.com>",
      to: ["janamaia@gmail.com", "admin@ziggysitters.com"],
      subject: "New Sitter Verification Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">New Sitter Verification Request</h1>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>Sitter Details</h2>
            <p><strong>Name:</strong> ${user_name}</p>
            <p><strong>Email:</strong> ${user_email}</p>
            <p><strong>User ID:</strong> ${user_id}</p>
            <p><strong>Documents Uploaded:</strong> ${documents_uploaded ? 'Yes' : 'No'}</p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Action Required:</strong> Please review and verify this sitter application in the admin dashboard.</p>
          </div>
          
          <p>Please log in to the admin dashboard to review this verification request.</p>
          
          <p>Best regards,<br>ZiggySitters System</p>
        </div>
      `,
    });

    // Send confirmation email to user
    const userEmailResponse = await resend.emails.send({
      from: "ZiggySitters <noreply@ziggysitters.com>",
      to: [user_email],
      subject: "Verification Request Submitted",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Verification Request Submitted</h1>
          
          <p>Hi ${user_name},</p>
          
          <p>Thank you for submitting your verification request to become a ZiggySitters pet sitter!</p>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>What happens next?</h3>
            <ul>
              <li>Our team will review your application and uploaded documents</li>
              <li>We may contact you if additional information is needed</li>
              <li>You'll receive an email notification once your verification is complete</li>
              <li>The verification process typically takes 1-3 business days</li>
            </ul>
          </div>
          
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