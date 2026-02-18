import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';
import { Resend } from 'https://esm.sh/resend@2.0.0';
import { renderAsync } from 'https://esm.sh/@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { ConfirmSignupEmail } from './_templates/confirm-signup.tsx';
import { MagicLinkEmail } from './_templates/magic-link.tsx';
import { ResetPasswordEmail } from './_templates/reset-password.tsx';
import { ChangeEmailEmail } from './_templates/change-email.tsx';

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);
const hookSecret = Deno.env.get('SEND_AUTH_EMAIL_HOOK_SECRET') as string;

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const payload = await req.json();
    const { user, email_data } = payload;
    const { token, token_hash, redirect_to, email_action_type } = email_data;

    // Send email asynchronously without blocking the response
    const sendEmail = async () => {
      try {
        let html: string;
        let subject: string;
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';

        // Build the appropriate URL based on email action type
        let actionUrl: string;
        
        if (email_action_type === 'signup') {
          actionUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=signup&redirect_to=${redirect_to}`;
          subject = 'Welcome to ZiggySitters - Confirm Your Email';
          html = await renderAsync(
            React.createElement(ConfirmSignupEmail, {
              confirmationUrl: actionUrl,
              email: user.email,
            })
          );
        } else if (email_action_type === 'magiclink') {
          actionUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=magiclink&redirect_to=${redirect_to}`;
          subject = 'Your ZiggySitters Sign In Link';
          html = await renderAsync(
            React.createElement(MagicLinkEmail, {
              magicLink: actionUrl,
              token: token,
            })
          );
        } else if (email_action_type === 'recovery') {
          actionUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=recovery&redirect_to=${redirect_to}`;
          subject = 'Reset Your ZiggySitters Password';
          html = await renderAsync(
            React.createElement(ResetPasswordEmail, {
              resetLink: actionUrl,
              email: user.email,
            })
          );
        } else if (email_action_type === 'email_change') {
          actionUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=email_change&redirect_to=${redirect_to}`;
          subject = 'Confirm Your New ZiggySitters Email';
          html = await renderAsync(
            React.createElement(ChangeEmailEmail, {
              confirmationUrl: actionUrl,
              newEmail: user.new_email || user.email,
              oldEmail: user.email,
            })
          );
        } else {
          throw new Error(`Unsupported email action type: ${email_action_type}`);
        }

        const { error } = await resend.emails.send({
          from: 'ZiggySitters <onboarding@ziggysitters.com>',
          to: [user.new_email || user.email],
          subject: subject,
          html: html,
        });

        if (error) {
          console.error('Resend error:', error);
          throw error;
        }

        console.log(`Successfully sent ${email_action_type} email to ${user.email}`);
      } catch (error) {
        console.error('Error sending auth email:', error);
      }
    };

    // Fire and forget - don't await
    sendEmail();

    // Respond immediately to avoid timeout
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({
        error: {
          message: error.message,
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
