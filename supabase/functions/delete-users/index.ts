import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user is authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Verify user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      console.error('Admin check failed:', roleError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { userIds } = await req.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'userIds must be a non-empty array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prevent admin from deleting themselves
    if (userIds.includes(user.id)) {
      return new Response(
        JSON.stringify({ error: 'Cannot delete your own account' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Admin ${user.email} deleting ${userIds.length} users:`, userIds);

    const results = [];
    let successCount = 0;
    let failCount = 0;

    // Delete users one by one using admin API
    for (const userId of userIds) {
      try {
        // Get user profile info before deletion
        const { data: userProfile } = await supabaseClient
          .from('profiles')
          .select('email, first_name, last_name, user_id')
          .eq('user_id', userId)
          .single();

        // Get cancellation reason if exists
        const { data: cancellationRequest } = await supabaseClient
          .from('account_cancellation_requests')
          .select('reason')
          .eq('user_id', userId)
          .order('requested_at', { ascending: false })
          .limit(1)
          .single();

        // Store deleted user information before deletion
        if (userProfile) {
          const { error: storeError } = await supabaseClient
            .from('deleted_users')
            .insert({
              user_id: userId,
              email: userProfile.email,
              first_name: userProfile.first_name,
              last_name: userProfile.last_name,
              cancellation_reason: cancellationRequest?.reason || null,
              deleted_by_admin: user.id
            });

          if (storeError) {
            console.error(`Failed to store deleted user info for ${userId}:`, storeError);
          }

          // Send deletion confirmation email
          try {
            await resend.emails.send({
              from: "ZiggySitters <noreply@ziggysitters.com>",
              to: [userProfile.email],
              subject: "Account Deletion Confirmation",
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
                        <h1 style="margin: 0;">Account Deletion Confirmation</h1>
                      </div>
                      <div class="content">
                        <p>Hi ${userProfile.first_name || 'there'},</p>
                        
                        <p>This email confirms that your ZiggySitters account has been permanently deleted.</p>

                        <div class="info-box">
                          <p><strong>What this means:</strong></p>
                          <ul>
                            <li>Your account and profile have been removed</li>
                            <li>You will no longer receive notifications</li>
                            <li>Your personal data has been deleted in accordance with our privacy policy</li>
                            <li>We've kept your email address for future communications only</li>
                          </ul>
                        </div>

                        <p>Thank you for being part of the ZiggySitters community. We hope to see you again in the future!</p>

                        <p>If you have any questions or believe this was done in error, please contact us at hello@ziggysitters.com</p>

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
            console.log(`Deletion confirmation email sent to ${userProfile.email}`);
          } catch (emailError) {
            console.error(`Failed to send deletion email to ${userProfile.email}:`, emailError);
          }
        }

        // Mark cancellation request as processed
        if (cancellationRequest) {
          await supabaseClient
            .from('account_cancellation_requests')
            .update({ 
              processed: true, 
              processed_at: new Date().toISOString(),
              processed_by: user.id 
            })
            .eq('user_id', userId);
        }

        // Delete the user
        const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(userId);
        
        if (deleteError) {
          console.error(`Failed to delete user ${userId}:`, deleteError);
          results.push({ userId, success: false, error: deleteError.message });
          failCount++;
        } else {
          console.log(`Successfully deleted user ${userId}`);
          results.push({ userId, success: true });
          successCount++;
        }
      } catch (err) {
        console.error(`Exception deleting user ${userId}:`, err);
        results.push({ userId, success: false, error: String(err) });
        failCount++;
      }
    }

    return new Response(
      JSON.stringify({
        message: `Deleted ${successCount} users, ${failCount} failures`,
        successCount,
        failCount,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in delete-users function:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});