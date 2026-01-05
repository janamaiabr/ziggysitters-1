import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CancellationRequest {
  userId: string;
  userEmail: string;
  userName: string;
  reason: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, userEmail, userName, reason }: CancellationRequest = await req.json();

    console.log('Account cancellation request received:', { userId, userEmail, userName });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's profile ID
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Could not find user profile');
    }

    const profileId = profileData.id;

    // Check for active bookings (as owner or sitter)
    const { data: activeBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, status, payment_status')
      .or(`owner_id.eq.${profileId},sitter_id.eq.${profileId}`)
      .in('status', ['pending', 'awaiting_payment', 'confirmed', 'in_progress']);

    if (bookingsError) {
      console.error('Error checking bookings:', bookingsError);
    }

    // Check for pending payouts (completed bookings with unpaid status)
    const { data: pendingPayouts, error: payoutsError } = await supabase
      .from('bookings')
      .select('id, status, payment_status')
      .eq('sitter_id', profileId)
      .eq('status', 'completed')
      .neq('payment_status', 'payout_completed');

    if (payoutsError) {
      console.error('Error checking payouts:', payoutsError);
    }

    const hasActiveBookings = activeBookings && activeBookings.length > 0;
    const hasPendingPayouts = pendingPayouts && pendingPayouts.length > 0;
    const canDeleteImmediately = !hasActiveBookings && !hasPendingPayouts;

    console.log('Eligibility check:', { 
      hasActiveBookings, 
      hasPendingPayouts, 
      canDeleteImmediately,
      activeBookingsCount: activeBookings?.length || 0,
      pendingPayoutsCount: pendingPayouts?.length || 0
    });

    if (canDeleteImmediately) {
      // User is eligible for immediate deletion
      console.log('User eligible for immediate deletion, proceeding...');

      // Store deleted user information
      const { error: storeError } = await supabase
        .from('deleted_users')
        .insert({
          user_id: userId,
          email: userEmail,
          first_name: userName.split(' ')[0],
          last_name: userName.split(' ').slice(1).join(' ') || '',
          cancellation_reason: reason,
          deleted_by_admin: null // Self-deletion
        });

      if (storeError) {
        console.error('Failed to store deleted user info:', storeError);
      }

      // Delete the user from auth
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

      if (deleteError) {
        console.error('Failed to delete user:', deleteError);
        throw new Error('Failed to delete account. Please try again or contact support.');
      }

      console.log('User deleted successfully:', userId);

      // Send deletion confirmation email
      try {
        await resend.emails.send({
          from: "ZiggySitters <noreply@ziggysitters.com>",
          to: [userEmail],
          subject: "Account Deleted Successfully",
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
                  .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
                  .info-box { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                  .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1 style="margin: 0;">Account Deleted</h1>
                  </div>
                  <div class="content">
                    <p>Hi ${userName.split(' ')[0] || 'there'},</p>
                    
                    <p>Your ZiggySitters account has been successfully deleted.</p>

                    <div class="info-box">
                      <p><strong>What this means:</strong></p>
                      <ul>
                        <li>Your account and profile have been removed</li>
                        <li>You will no longer receive notifications</li>
                        <li>Your personal data has been deleted in accordance with our privacy policy</li>
                      </ul>
                    </div>

                    <p>Thank you for being part of the ZiggySitters community. We hope to see you again in the future!</p>

                    <p>If you have any questions, please contact us at hello@ziggysitters.com</p>

                    <div class="footer">
                      <p>Best regards,<br>
                      The ZiggySitters Team<br>
                      <a href="https://ziggysitters.com">ziggysitters.com</a></p>
                    </div>
                  </div>
                </div>
              </body>
            </html>
          `,
        });
        console.log('Deletion confirmation email sent to:', userEmail);
      } catch (emailError) {
        console.error('Failed to send deletion email:', emailError);
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          deleted: true,
          message: "Your account has been successfully deleted." 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // User has active bookings or pending payouts - send to admin for review
    console.log('User has active commitments, sending to admin for review');

    // Store cancellation request in database
    const { error: dbError } = await supabase
      .from('account_cancellation_requests')
      .insert({
        user_id: userId,
        email: userEmail,
        user_name: userName,
        reason: reason
      });

    if (dbError) {
      console.error('Error storing cancellation request:', dbError);
    }

    // Build reason for manual review
    const reviewReasons = [];
    if (hasActiveBookings) {
      reviewReasons.push(`${activeBookings.length} active booking(s)`);
    }
    if (hasPendingPayouts) {
      reviewReasons.push(`${pendingPayouts.length} pending payout(s)`);
    }

    // Send notification to admin
    const adminEmailResponse = await resend.emails.send({
      from: "ZiggySitters <noreply@ziggysitters.com>",
      to: ["janamaia@gmail.com"],
      subject: `Account Cancellation Request - ${userName} (Manual Review Required)`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
              .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
              .warning-box { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
              .label { font-weight: bold; color: #6b7280; }
              .reason-box { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
              .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">⚠️ Manual Review Required</h1>
              </div>
              <div class="content">
                <p>A user has requested to cancel their account but requires manual review.</p>
                
                <div class="warning-box">
                  <p style="margin: 0;"><strong>⚠️ Reason for Manual Review:</strong></p>
                  <p style="margin: 10px 0 0 0;">${reviewReasons.join(', ')}</p>
                </div>
                
                <div class="info-box">
                  <p><span class="label">User Name:</span> ${userName}</p>
                  <p><span class="label">Email:</span> ${userEmail}</p>
                  <p><span class="label">User ID:</span> ${userId}</p>
                  <p><span class="label">Date Requested:</span> ${new Date().toLocaleString()}</p>
                </div>

                <div class="reason-box">
                  <p class="label">Reason for Cancellation:</p>
                  <p style="margin-top: 10px; white-space: pre-wrap;">${reason}</p>
                </div>

                <p><strong>Next Steps:</strong></p>
                <ul>
                  <li>Review active bookings and ensure they are completed or cancelled</li>
                  <li>Process any pending payouts</li>
                  <li>Contact the user to confirm and process the request</li>
                  <li>Once resolved, delete the user account from the admin dashboard</li>
                </ul>

                <a href="https://ziggysitters.com/admin/users" class="button">Go to Admin Users</a>

                <div class="footer">
                  <p>ZiggySitters Admin Notification<br>
                  This is an automated message, please do not reply directly.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('Admin notification email response:', adminEmailResponse);

    // Send confirmation to user explaining why manual review is needed
    const userEmailResponse = await resend.emails.send({
      from: "ZiggySitters <noreply@ziggysitters.com>",
      to: [userEmail],
      subject: "Account Cancellation Request Received",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
              .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
              .info-box { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
              .warning-box { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">Account Cancellation Request</h1>
              </div>
              <div class="content">
                <p>Hi ${userName.split(' ')[0] || 'there'},</p>
                
                <p>We've received your request to cancel your ZiggySitters account.</p>

                <div class="warning-box">
                  <p><strong>Why does this require review?</strong></p>
                  <p>Your account has ${reviewReasons.join(' and ')} that need to be resolved before we can complete the deletion.</p>
                </div>

                <div class="info-box">
                  <p><strong>What happens next?</strong></p>
                  <ul>
                    <li>Our team will review your account within 24-48 hours</li>
                    <li>We'll help resolve any outstanding bookings or payments</li>
                    <li>You'll receive an email confirmation once your account is deleted</li>
                  </ul>
                </div>

                <p><strong>Changed your mind?</strong></p>
                <p>If you'd like to keep your account, simply reply to this email and let us know.</p>

                <p>Thank you for your patience!</p>

                <div class="footer">
                  <p>Best regards,<br>
                  The ZiggySitters Team<br>
                  <a href="https://ziggysitters.com">ziggysitters.com</a></p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('User confirmation email response:', userEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        deleted: false,
        message: "Your account has active bookings or pending payouts. Our team will review your request and contact you within 24-48 hours.",
        requiresReview: true,
        reasons: reviewReasons
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error processing account cancellation request:", error);
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
