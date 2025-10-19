import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
      from: "ZiggySitters <onboarding@ziggysitters.com>",
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

    // Send notification to admin about new user
    try {
      await resend.emails.send({
        from: "ZiggySitters <onboarding@ziggysitters.com>",
        to: ["admin@ziggysitters.com"],
        subject: `New User Registered - ${role === 'pet_sitter' ? 'Pet Sitter' : 'Pet Owner'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>New User Registration</h2>
            <p><strong>Name:</strong> ${firstName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Role:</strong> ${role === 'pet_sitter' ? 'Pet Sitter' : 'Pet Owner'}</p>
            <p><strong>Registered:</strong> ${new Date().toLocaleString()}</p>
          </div>
        `,
      });
      console.log("Admin notification sent for new user");
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
