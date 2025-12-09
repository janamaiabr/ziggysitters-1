import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DocumentNotificationRequest {
  sitter_id: string;
  document_type: 'id_verification' | 'vet_check';
  sitter_name: string;
  sitter_email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sitter_id, document_type, sitter_name, sitter_email }: DocumentNotificationRequest = await req.json();

    console.log('Sending document notification to admin:', { sitter_id, document_type, sitter_name });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get sitter profile details
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('id, first_name, last_name, email, phone, suburb, city, id_document_url, blue_card_document_url, verification_documents_uploaded_at')
      .eq('id', sitter_id)
      .single();

    if (!profile) {
      throw new Error('Sitter profile not found');
    }

    const documentTypeLabel = document_type === 'id_verification' ? 'ID Verification Documents' : 'Police Vet Check (Gold Badge)';
    const badgeLevel = document_type === 'id_verification' ? 'Verified Badge' : 'Gold Star Badge';

    // Email to admin
    await resend.emails.send({
      from: "ZiggySitters <hello@ziggysitters.com>",
      to: ["janamaia@gmail.com"],
      subject: `🔔 ${documentTypeLabel} Submitted for Review - ${profile.first_name} ${profile.last_name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin: 10px 5px; }
              .badge-urgent { background: #fef3c7; color: #92400e; }
              .badge-id { background: #dbeafe; color: #1e40af; }
              .badge-gold { background: #fef3c7; color: #92400e; }
              .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1; }
              .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
              .info-label { font-weight: 600; color: #6b7280; }
              .info-value { color: #111827; }
              .document-links { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .btn { display: inline-block; padding: 12px 24px; background: #6366f1; color: white !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 5px; }
              .btn:hover { background: #4f46e5; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">📄 Document Review Required</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">A sitter has submitted ${documentTypeLabel.toLowerCase()}</p>
              </div>
              
              <div class="content">
                <div class="badge badge-urgent">⚡ APPROVAL REQUIRED</div>
                <div class="badge ${document_type === 'id_verification' ? 'badge-id' : 'badge-gold'}">${badgeLevel}</div>
                
                <p style="color: #374151; font-size: 16px; margin: 20px 0; padding: 15px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
                  <strong>This sitter has completed their document upload and is ready for your review.</strong><br>
                  Once approved, they will be visible to pet owners and can start accepting bookings.
                </p>
                
                <h2 style="color: #111827; margin-top: 20px;">Sitter Information</h2>
                
                <div class="info-box">
                  <div class="info-row">
                    <span class="info-label">Name:</span>
                    <span class="info-value">${profile.first_name} ${profile.last_name}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${profile.email}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">${profile.phone || 'Not provided'}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Location:</span>
                    <span class="info-value">${profile.suburb || ''}, ${profile.city || 'Auckland'}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Submitted:</span>
                    <span class="info-value">${new Date(profile.verification_documents_uploaded_at || Date.now()).toLocaleString()}</span>
                  </div>
                </div>

                <div class="document-links">
                  <h3 style="margin-top: 0; color: #92400e;">📋 Documents to Review</h3>
                  ${document_type === 'id_verification' && profile.id_document_url ? `
                    <p><strong>ID Document:</strong><br><a href="${profile.id_document_url}" style="color: #2563eb; word-break: break-all;">${profile.id_document_url}</a></p>
                  ` : ''}
                  ${document_type === 'vet_check' && profile.blue_card_document_url ? `
                    <p><strong>Police Vet Check:</strong><br><a href="${profile.blue_card_document_url}" style="color: #2563eb; word-break: break-all;">${profile.blue_card_document_url}</a></p>
                  ` : ''}
                </div>

                <h3 style="color: #111827;">Next Steps:</h3>
                <ol style="color: #4b5563; line-height: 1.8;">
                  <li><strong>Review</strong> the submitted ${document_type === 'id_verification' ? 'ID documents' : 'police vet check'}</li>
                  <li><strong>Verify</strong> authenticity and match with profile information</li>
                  <li><strong>Approve or Reject</strong> via Admin Dashboard</li>
                  ${document_type === 'vet_check' ? '<li><strong>Award Gold Star Badge</strong> if approved</li>' : ''}
                </ol>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://ziggysitters.com/admin" class="btn">Go to Admin Dashboard</a>
                  <a href="https://ziggysitters.com/admin/user/${profile.id}" class="btn" style="background: #8b5cf6;">View Sitter Profile</a>
                </div>
              </div>

              <div class="footer">
                <p style="margin: 5px 0;">ZiggySitters Admin Notifications</p>
                <p style="margin: 5px 0; font-size: 12px;">This is an automated notification for document review</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('Admin notification sent successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Admin notification sent' }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-sitter-document-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
