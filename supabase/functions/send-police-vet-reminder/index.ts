import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderRequest {
  user_email: string;
  user_name: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_email, user_name }: ReminderRequest = await req.json();

    console.log("Sending Police Vet reminder to:", user_email);

    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <onboarding@resend.dev>",
      to: [user_email],
      subject: "Reminder: Complete Your Police Vetting Check",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Hi ${user_name},</h1>
          
          <p style="color: #666; line-height: 1.6;">
            This is a friendly reminder to complete your NZ Police Vetting Service check as part of your sitter verification process.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            To get started with your police vet check, visit:
          </p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <a href="https://www.police.govt.nz/advice-services/businesses-and-organisations/nz-police-vetting-service/forms-and-guides" 
               style="color: #2563eb; text-decoration: none; font-weight: bold;">
              NZ Police Vetting Service - Forms and Guides
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Once you've received your police vet check document, please upload it to your profile to complete the verification process.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            If you have any questions, feel free to reach out to our support team.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The ZiggySitters Team
          </p>
        </div>
      `,
    });

    console.log("Police Vet reminder sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending Police Vet reminder:", error);
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
