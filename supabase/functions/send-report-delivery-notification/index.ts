import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeliveryNotificationRequest {
  reportId: string;
  sitterEmail: string;
  sitterName: string;
  ownerName: string;
  petNames: string;
  reportDate: string;
  viewedAt?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const { sitterEmail, sitterName, ownerName, petNames, reportDate, viewedAt }: DeliveryNotificationRequest = await req.json();

    console.log("Sending report delivery notification to sitter:", sitterEmail);

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Report Delivered</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">✅ Report ${viewedAt ? 'Viewed' : 'Delivered'}</h1>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e1e1e1; border-top: none; border-radius: 0 0 10px 10px;">
        <div style="margin-bottom: 25px;">
          <h2 style="color: #667eea; margin-bottom: 10px;">Hi ${sitterName}!</h2>
          <p style="font-size: 16px;">
            Great news! Your daily report for ${petNames} on ${new Date(reportDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })} has been successfully ${viewedAt ? 'viewed' : 'delivered'} to ${ownerName}.
          </p>
        </div>

        ${viewedAt ? `
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #22c55e; margin-bottom: 25px;">
          <p style="margin: 0; color: #166534;">
            <strong>📖 Viewed:</strong> ${new Date(viewedAt).toLocaleString('en-US', {
              weekday: 'short',
              month: 'short', 
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </p>
        </div>
        ` : `
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9; margin-bottom: 25px;">
          <p style="margin: 0; color: #075985;">
            <strong>📧 Email delivered successfully</strong> to ${ownerName}
          </p>
        </div>
        `}

        <div style="margin-bottom: 25px;">
          <h3 style="color: #667eea; margin-bottom: 15px;">💡 What this means</h3>
          <ul style="padding-left: 20px; margin: 0;">
            <li style="margin-bottom: 10px;">${viewedAt ? `${ownerName} has opened and read your report` : `Your report has been emailed to ${ownerName}`}</li>
            <li style="margin-bottom: 10px;">This report counts toward your daily reporting requirements</li>
            <li style="margin-bottom: 10px;">Keep up the great communication with pet owners!</li>
          </ul>
        </div>

        <div style="border-top: 2px solid #e1e1e1; padding-top: 20px; text-align: center;">
          <p style="color: #667eea; margin: 0; font-weight: bold;">
            ZiggySitters - Transparent Pet Care You Can Trust
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <notifications@ziggysitters.com>",
      to: [sitterEmail],
      subject: `✅ Daily Report ${viewedAt ? 'Viewed' : 'Delivered'} - ${petNames}`,
      html: emailHtml,
    });

    console.log("Delivery notification sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-report-delivery-notification function:", error);
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
