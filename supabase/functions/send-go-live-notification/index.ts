import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  email: string;
  firstName: string;
  lastName: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName }: NotificationRequest = await req.json();

    console.log(`Sending go-live notification to: ${email}`);

    const { data, error } = await resend.emails.send({
      from: 'ZiggySitters <onboarding@ziggysitters.com>',
      to: [email],
      subject: 'Important: Update Your ZiggySitters Profile Before Launch',
      headers: {
        'List-Unsubscribe': `<mailto:unsubscribe@ziggysitters.com?subject=Unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #1f2937; margin-bottom: 20px;">Hi ${firstName},</h1>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              We're excited to announce that <strong>ZiggySitters is preparing to go live!</strong>
            </p>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              To ensure you're ready for bookings, please take a few minutes to update your profile:
            </p>

            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h2 style="color: #1f2937; font-size: 18px; margin-top: 0;">Complete These Tasks:</h2>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 10px;"><strong>Profile Information:</strong> Add your bio, experience, and specialties</li>
                <li style="margin-bottom: 10px;"><strong>Services & Rates:</strong> Configure all services you offer with accurate pricing</li>
                <li style="margin-bottom: 10px;"><strong>Availability Calendar:</strong> Mark your available dates for bookings</li>
                <li style="margin-bottom: 10px;"><strong>Verification:</strong> Upload ID and police check documents</li>
                <li style="margin-bottom: 10px;"><strong>Stripe Setup:</strong> Complete your payment account setup</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://ziggysitters.lovable.app/profile" 
                 style="display: inline-block; background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Update My Profile
              </a>
            </div>

            <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-top: 30px;">
              <strong>Why is this important?</strong><br>
              Pet owners can only see and book sitters who have:
            </p>
            <ul style="color: #4b5563; font-size: 14px; margin: 10px 0; padding-left: 20px;">
              <li>Completed their profile with services and rates</li>
              <li>Marked available dates on their calendar</li>
              <li>Completed verification requirements</li>
            </ul>

            <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
              If you need any help, please don't hesitate to reach out to our support team.
            </p>

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Best regards,<br>
                <strong>The ZiggySitters Team</strong>
              </p>
            </div>
          </div>

          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    console.log('Email sent successfully:', data);

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in send-go-live-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
