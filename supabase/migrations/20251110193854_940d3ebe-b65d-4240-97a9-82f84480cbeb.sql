-- Update all email templates to have consistent styling with header, footer, and beautiful design

-- Booking Acceptance Email
UPDATE email_templates
SET html_content = '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.7; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; border-radius: 30px; margin: 25px 0; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
    .footer { text-align: center; padding: 30px; background: #f9f9f9; color: #666; font-size: 13px; }
    .info-box { background: #f0f4ff; border-left: 4px solid #667eea; padding: 20px; border-radius: 8px; margin: 25px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>🎉 Great News!</h1><p>Your Booking Has Been Accepted</p></div>
    <div class="content">
      <p>Hi there! 👋</p>
      <p>We''re excited to let you know that <strong>{sitterName}</strong> has accepted your booking request!</p>
      <div class="info-box">
        <h3 style="margin-top: 0; color: #667eea;">📅 Booking Details:</h3>
        <p><strong>Start Date:</strong> {startDate}</p>
        <p><strong>End Date:</strong> {endDate}</p>
      </div>
      <center><a href="https://ziggysitters.com/bookings" class="button">View Booking Details</a></center>
      <p>Your pet is in great hands! 🐾</p>
      <p>Best regards,<br><strong>The ZiggySitters Team</strong></p>
    </div>
    <div class="footer"><p><strong>ZiggySitters</strong> - Your trusted pet care platform</p></div>
  </div>
</body>
</html>'
WHERE template_key = 'booking_acceptance';

-- Booking Decline Email
UPDATE email_templates
SET html_content = '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.7; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; border-radius: 30px; margin: 25px 0; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
    .footer { text-align: center; padding: 30px; background: #f9f9f9; color: #666; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Booking Update</h1></div>
    <div class="content">
      <p>Hi there,</p>
      <p>Unfortunately, <strong>{sitterName}</strong> is not available for your requested dates.</p>
      <p>Don''t worry though - we have many other amazing sitters who would love to care for your pet! 🐾</p>
      <center><a href="https://ziggysitters.com/find-sitters" class="button">Find Another Sitter</a></center>
      <p>Best regards,<br><strong>The ZiggySitters Team</strong></p>
    </div>
    <div class="footer"><p><strong>ZiggySitters</strong> - Your trusted pet care platform</p></div>
  </div>
</body>
</html>'
WHERE template_key = 'booking_decline';

-- Daily Report Email
UPDATE email_templates
SET html_content = '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.7; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; border-radius: 30px; margin: 25px 0; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
    .footer { text-align: center; padding: 30px; background: #f9f9f9; color: #666; font-size: 13px; }
    .report-box { background: #f0f4ff; border-left: 4px solid #667eea; padding: 20px; border-radius: 8px; margin: 25px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>📋 Daily Report for {petName}</h1><p>{reportDate}</p></div>
    <div class="content">
      <p>Hi there! 👋</p>
      <p>Here''s today''s update from your pet sitter, <strong>{sitterName}</strong>:</p>
      <div class="report-box">
        <h3 style="margin-top: 0; color: #667eea;">🐾 Today''s Report</h3>
        <p>View the full report with photos and details in your dashboard.</p>
      </div>
      <center><a href="https://ziggysitters.com/daily-reports" class="button">View Full Report</a></center>
      <p>Best regards,<br><strong>The ZiggySitters Team</strong></p>
    </div>
    <div class="footer"><p><strong>ZiggySitters</strong> - Your trusted pet care platform</p></div>
  </div>
</body>
</html>'
WHERE template_key = 'daily_report_email';

-- Daily Report Reminder
UPDATE email_templates
SET html_content = '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.7; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; border-radius: 30px; margin: 25px 0; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
    .footer { text-align: center; padding: 30px; background: #f9f9f9; color: #666; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>⏰ Daily Report Reminder</h1></div>
    <div class="content">
      <p>Hi there! 👋</p>
      <p>Just a friendly reminder to submit today''s daily report for booking <strong>{bookingReference}</strong>.</p>
      <p>Daily reports help pet owners feel connected with their furry friends! 🐾</p>
      <center><a href="https://ziggysitters.com/daily-reports" class="button">Submit Report Now</a></center>
      <p>Best regards,<br><strong>The ZiggySitters Team</strong></p>
    </div>
    <div class="footer"><p><strong>ZiggySitters</strong> - Your trusted pet care platform</p></div>
  </div>
</body>
</html>'
WHERE template_key = 'daily_report_reminder';

-- Document Upload Reminder
UPDATE email_templates
SET html_content = '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.7; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; border-radius: 30px; margin: 25px 0; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
    .footer { text-align: center; padding: 30px; background: #f9f9f9; color: #666; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>📄 Complete Your Profile</h1></div>
    <div class="content">
      <p>Hi {firstName}! 👋</p>
      <p>To get verified and start accepting bookings, please upload your ID document.</p>
      <p>This helps us maintain a safe and trusted community for all pet owners and sitters. 🐾</p>
      <center><a href="https://ziggysitters.com/profile" class="button">Upload Document Now</a></center>
      <p>Best regards,<br><strong>The ZiggySitters Team</strong></p>
    </div>
    <div class="footer"><p><strong>ZiggySitters</strong> - Your trusted pet care platform</p></div>
  </div>
</body>
</html>'
WHERE template_key = 'document_upload_reminder';

-- New Booking Request
UPDATE email_templates
SET html_content = '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.7; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; border-radius: 30px; margin: 25px 0; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
    .footer { text-align: center; padding: 30px; background: #f9f9f9; color: #666; font-size: 13px; }
    .info-box { background: #f0f4ff; border-left: 4px solid #667eea; padding: 20px; border-radius: 8px; margin: 25px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>🎉 New Booking Request!</h1></div>
    <div class="content">
      <p>Hi there! 👋</p>
      <p>You have a new booking request from <strong>{ownerName}</strong>!</p>
      <div class="info-box">
        <h3 style="margin-top: 0; color: #667eea;">📋 Request Details:</h3>
        <p><strong>Service:</strong> {serviceName}</p>
        <p><strong>Start Date:</strong> {startDate}</p>
        <p><strong>End Date:</strong> {endDate}</p>
      </div>
      <center><a href="https://ziggysitters.com/bookings" class="button">View & Respond</a></center>
      <p>Best regards,<br><strong>The ZiggySitters Team</strong></p>
    </div>
    <div class="footer"><p><strong>ZiggySitters</strong> - Your trusted pet care platform</p></div>
  </div>
</body>
</html>'
WHERE template_key = 'booking_notification';

-- Payment Confirmation
UPDATE email_templates
SET html_content = '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.7; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; border-radius: 30px; margin: 25px 0; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
    .footer { text-align: center; padding: 30px; background: #f9f9f9; color: #666; font-size: 13px; }
    .success-box { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; border-radius: 8px; margin: 25px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>✅ Payment Confirmed!</h1></div>
    <div class="content">
      <p>Hi there! 👋</p>
      <div class="success-box">
        <h3 style="margin-top: 0; color: #22c55e;">💳 Payment Received</h3>
        <p><strong>Booking Reference:</strong> {bookingReference}</p>
        <p><strong>Amount:</strong> ${amount}</p>
      </div>
      <p>Your payment has been received and your booking is now confirmed! 🎉</p>
      <center><a href="https://ziggysitters.com/bookings" class="button">View Booking Details</a></center>
      <p>Best regards,<br><strong>The ZiggySitters Team</strong></p>
    </div>
    <div class="footer"><p><strong>ZiggySitters</strong> - Your trusted pet care platform</p></div>
  </div>
</body>
</html>'
WHERE template_key = 'payment_confirmation';

-- Payout Success
UPDATE email_templates
SET html_content = '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.7; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; border-radius: 30px; margin: 25px 0; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
    .footer { text-align: center; padding: 30px; background: #f9f9f9; color: #666; font-size: 13px; }
    .success-box { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; border-radius: 8px; margin: 25px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>💰 Payout Processed!</h1></div>
    <div class="content">
      <p>Hi there! 👋</p>
      <div class="success-box">
        <h3 style="margin-top: 0; color: #22c55e;">✅ Payment Sent</h3>
        <p><strong>Amount:</strong> ${amount}</p>
        <p><strong>Booking Reference:</strong> {bookingReference}</p>
      </div>
      <p>Your payout has been successfully processed to your Stripe account! 🎉</p>
      <center><a href="https://ziggysitters.com/payouts" class="button">View Payout Details</a></center>
      <p>Best regards,<br><strong>The ZiggySitters Team</strong></p>
    </div>
    <div class="footer"><p><strong>ZiggySitters</strong> - Your trusted pet care platform</p></div>
  </div>
</body>
</html>'
WHERE template_key = 'payout_success';

-- Penalty Notification
UPDATE email_templates
SET html_content = '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.7; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; border-radius: 30px; margin: 25px 0; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
    .footer { text-align: center; padding: 30px; background: #f9f9f9; color: #666; font-size: 13px; }
    .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>⚠️ Penalty Notification</h1></div>
    <div class="content">
      <p>Hi there,</p>
      <div class="warning-box">
        <h3 style="margin-top: 0; color: #f59e0b;">Penalty Applied</h3>
        <p><strong>Amount:</strong> ${penaltyAmount}</p>
        <p><strong>Reason:</strong> {reason}</p>
      </div>
      <p>A penalty has been applied to your booking. Please review the details and contact us if you have any questions.</p>
      <center><a href="https://ziggysitters.com/contact" class="button">Contact Support</a></center>
      <p>Best regards,<br><strong>The ZiggySitters Team</strong></p>
    </div>
    <div class="footer"><p><strong>ZiggySitters</strong> - Your trusted pet care platform</p></div>
  </div>
</body>
</html>'
WHERE template_key = 'penalty_notification';

-- Stripe Reonboarding
UPDATE email_templates
SET html_content = '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.7; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; border-radius: 30px; margin: 25px 0; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
    .footer { text-align: center; padding: 30px; background: #f9f9f9; color: #666; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>⚙️ Action Required</h1><p>Update Your Stripe Account</p></div>
    <div class="content">
      <p>Hi {firstName}! 👋</p>
      <p>Your Stripe account requires additional information or updates to continue receiving payouts.</p>
      <center><a href="https://ziggysitters.com/profile" class="button">Update Account Now</a></center>
      <p>Best regards,<br><strong>The ZiggySitters Team</strong></p>
    </div>
    <div class="footer"><p><strong>ZiggySitters</strong> - Your trusted pet care platform</p></div>
  </div>
</body>
</html>'
WHERE template_key = 'stripe_reonboarding';

-- Verification Update
UPDATE email_templates
SET html_content = '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.7; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; border-radius: 30px; margin: 25px 0; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
    .footer { text-align: center; padding: 30px; background: #f9f9f9; color: #666; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>✨ Verification Update</h1></div>
    <div class="content">
      <p>Hi there! 👋</p>
      <p>Your sitter profile verification status has been updated to: <strong>{status}</strong></p>
      <center><a href="https://ziggysitters.com/profile" class="button">View Your Profile</a></center>
      <p>Best regards,<br><strong>The ZiggySitters Team</strong></p>
    </div>
    <div class="footer"><p><strong>ZiggySitters</strong> - Your trusted pet care platform</p></div>
  </div>
</body>
</html>'
WHERE template_key = 'verification_update';

-- Welcome Email
UPDATE email_templates
SET html_content = '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.7; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; border-radius: 30px; margin: 25px 0; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
    .footer { text-align: center; padding: 30px; background: #f9f9f9; color: #666; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Welcome to ZiggySitters! 🐾</h1></div>
    <div class="content">
      <p>Hi {firstName}! 👋</p>
      <p>Thanks for signing up! We''re excited to have you join our community of pet lovers.</p>
      <center><a href="https://ziggysitters.com" class="button">Get Started</a></center>
      <p>Best regards,<br><strong>The ZiggySitters Team</strong></p>
    </div>
    <div class="footer"><p><strong>ZiggySitters</strong> - Your trusted pet care platform</p></div>
  </div>
</body>
</html>'
WHERE template_key = 'welcome_email';