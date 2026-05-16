const nodemailer = require('nodemailer');

// Create reusable transporter object using the default SMTP transport
const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.log('⚠️ SMTP Credentials (SMTP_USER/SMTP_PASS) are not configured. Emails will be logged to console in developer fallback mode.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: { user, pass }
  });
};

/**
 * Send a beautiful premium HTML email
 */
const sendMail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  const fromEmail = process.env.SMTP_USER || 'no-reply@fieldcrest.com';

  if (!transporter) {
    console.log(`\n======================================================\n📧 [EMAIL FALLBACK MOCK SEND]\nTo: ${to}\nSubject: ${subject}\nHTML Preview:\n${html}\n======================================================\n`);
    return { success: true, mock: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"FieldCrest Support" <${fromEmail}>`,
      to,
      subject,
      html
    });
    console.log(`📧 Email successfully sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('⚠️ Error sending email via SMTP:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Welcome & Setup Incomplete Email Template
 */
const getWelcomeTemplate = (ownerName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to FieldCrest</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F4F6F9; margin: 0; padding: 0; color: #333333; }
        .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.06); border: 1px solid #E5E7EB; }
        .header { background: linear-gradient(135deg, #1B4F72, #2471A3); padding: 40px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px; }
        .header p { color: #D5F5E3; margin: 10px 0 0 0; font-size: 14px; }
        .content { padding: 40px 30px; line-height: 1.6; }
        .content p { margin: 0 0 20px 0; font-size: 15px; color: #4A5568; }
        .content strong { color: #1B4F72; }
        .badge-box { background-color: #FEF9E7; border-left: 4px solid #F39C12; padding: 18px; border-radius: 8px; margin: 24px 0; }
        .badge-box h4 { margin: 0 0 8px 0; color: #7E5109; font-size: 15px; font-weight: 700; }
        .badge-box p { margin: 0; font-size: 13.5px; color: #7E5109; }
        .cta-btn { display: inline-block; background: linear-gradient(135deg, #F39C12, #E67E22); color: #ffffff !important; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: bold; font-size: 14px; margin-top: 10px; box-shadow: 0 4px 12px rgba(243,156,18,0.25); text-align: center; }
        .footer { background-color: #F8FAFC; padding: 25px; text-align: center; font-size: 12px; color: #94A3B8; border-top: 1px solid #E2E8F0; }
        .footer p { margin: 0; }
        .footer a { color: #1B4F72; text-decoration: none; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>FieldCrest</h1>
          <p>Own The Turf. Lead The Game.</p>
        </div>
        <div class="content">
          <p>Dear <strong>${ownerName}</strong>,</p>
          <p>Welcome to <strong>FieldCrest</strong>! We are absolutely thrilled to have you join our partner family as a premium turf owner.</p>
          <p>Your owner account has been created successfully, and you have taken the first step toward boosting your turf's bookings and organizing local games effortlessly.</p>
          
          <div class="badge-box">
            <h4>⚡ Just One More Step!</h4>
            <p>To finalize your turf listing, make it visible to players, and begin accepting online payments instantly, please complete your brief KYC verification and choose a premium subscription plan inside your app dashboard.</p>
          </div>

          <p style="text-align: center;">
            <a href="#" class="cta-btn">Complete Turf Registration</a>
          </p>

          <p style="margin-top: 30px;">If you have any questions or need setup assistance, please do not hesitate to contact our dedicated developer support team at <a href="mailto:devlume2@gmail.com" style="color:#1B4F72;">devlume2@gmail.com</a>.</p>
          <p>Warm regards,<br><strong>The FieldCrest Partner Team</strong></p>
        </div>
        <div class="footer">
          <p>© 2026 FieldCrest Technologies Pvt Ltd. All rights reserved.</p>
          <p style="margin-top: 6px;">Need Help? Contact us at <a href="tel:+918097624151">+91 8097624151</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Turf Registration Complete / Active Email Template
 */
const getTurfRegisteredTemplate = (ownerName, turfName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Turf is Live on FieldCrest!</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F4F6F9; margin: 0; padding: 0; color: #333333; }
        .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.06); border: 1px solid #E5E7EB; }
        .header { background: linear-gradient(135deg, #1B4F72, #2ECC71); padding: 40px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px; }
        .header p { color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9; }
        .content { padding: 40px 30px; line-height: 1.6; }
        .content p { margin: 0 0 20px 0; font-size: 15px; color: #4A5568; }
        .content strong { color: #1B4F72; }
        .badge-box { background-color: #E8F8F5; border-left: 4px solid #2ECC71; padding: 18px; border-radius: 8px; margin: 24px 0; }
        .badge-box h4 { margin: 0 0 8px 0; color: #117864; font-size: 15px; font-weight: 700; }
        .badge-box p { margin: 0; font-size: 13.5px; color: #117864; }
        .cta-btn { display: inline-block; background: linear-gradient(135deg, #2ECC71, #27AE60); color: #ffffff !important; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: bold; font-size: 14px; margin-top: 10px; box-shadow: 0 4px 12px rgba(46,204,113,0.25); text-align: center; }
        .footer { background-color: #F8FAFC; padding: 25px; text-align: center; font-size: 12px; color: #94A3B8; border-top: 1px solid #E2E8F0; }
        .footer p { margin: 0; }
        .footer a { color: #1B4F72; text-decoration: none; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>FieldCrest</h1>
          <p>Your Turf is Live & Active!</p>
        </div>
        <div class="content">
          <p>Dear <strong>${ownerName}</strong>,</p>
          <p>We are absolutely thrilled to inform you that your turf, <strong>${turfName}</strong>, is now fully registered, verified, and **LIVE** on FieldCrest!</p>
          
          <div class="badge-box">
            <h4>🎉 Congratulations!</h4>
            <p>Players and game organizers in your city can now discover, view available slots, and instantly book matches at your turf via the customer-facing FieldCrest app.</p>
          </div>

          <p>You can manage bookings, configure daily slots, track your dynamic earnings, and request payouts seamlessly at any time from your partner dashboard.</p>

          <p style="text-align: center;">
            <a href="#" class="cta-btn">Go to Owner Dashboard</a>
          </p>

          <p style="margin-top: 30px;">Thank you for partnering with FieldCrest! Let's elevate the game together.</p>
          <p>Warm regards,<br><strong>The FieldCrest Team</strong></p>
        </div>
        <div class="footer">
          <p>© 2026 FieldCrest Technologies Pvt Ltd. All rights reserved.</p>
          <p style="margin-top: 6px;">Need Help? Contact us at <a href="tel:+918097624151">+91 8097624151</a> or <a href="mailto:devlume2@gmail.com">devlume2@gmail.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Customer Welcome Email Template
 */
const getCustomerWelcomeTemplate = (customerName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to FieldCrest</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F4F6F9; margin: 0; padding: 0; color: #333333; }
        .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.06); border: 1px solid #E5E7EB; }
        .header { background: linear-gradient(135deg, #00C853, #009624); padding: 40px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px; }
        .header p { color: #E8F5E9; margin: 10px 0 0 0; font-size: 14px; }
        .content { padding: 40px 30px; line-height: 1.6; }
        .content p { margin: 0 0 20px 0; font-size: 15px; color: #4A5568; }
        .content strong { color: #00C853; }
        .badge-box { background-color: #E8F5E9; border-left: 4px solid #00C853; padding: 18px; border-radius: 8px; margin: 24px 0; }
        .badge-box h4 { margin: 0 0 8px 0; color: #1B5E20; font-size: 15px; font-weight: 700; }
        .badge-box p { margin: 0; font-size: 13.5px; color: #1B5E20; }
        .cta-btn { display: inline-block; background: linear-gradient(135deg, #00C853, #00E676); color: #ffffff !important; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: bold; font-size: 14px; margin-top: 10px; box-shadow: 0 4px 12px rgba(0,200,83,0.25); text-align: center; }
        .footer { background-color: #F8FAFC; padding: 25px; text-align: center; font-size: 12px; color: #94A3B8; border-top: 1px solid #E2E8F0; }
        .footer p { margin: 0; }
        .footer a { color: #00C853; text-decoration: none; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>FieldCrest</h1>
          <p>Book. Play. Own the Game.</p>
        </div>
        <div class="content">
          <p>Hi <strong>${customerName}</strong>,</p>
          <p>Welcome to <strong>FieldCrest</strong>! 🎉 We're thrilled to have you join our community of players and sports enthusiasts.</p>
          <p>Your account has been successfully created. You're now ready to discover the best turfs in your city, book slots in seconds, and organize games with your friends effortlessly.</p>
          
          <div class="badge-box">
            <h4>🏅 Ready to Play?</h4>
            <p>From Cricket to Football, find your perfect pitch and book it instantly. No more phone calls, no more waiting.</p>
          </div>
          
          <p style="text-align: center;">
            <a href="#" class="cta-btn">Start Exploring Turfs</a>
          </p>
          
          <p style="margin-top: 30px;">If you have any questions or need help with your first booking, feel free to reply to this email or reach out to our support team.</p>
          <p>See you on the field!<br><strong>Team FieldCrest</strong></p>
        </div>
        <div class="footer">
          <p>© 2026 FieldCrest Technologies Pvt Ltd. All rights reserved.</p>
          <p style="margin-top: 6px;">Need Help? Contact us at <a href="mailto:devlume2@gmail.com">devlume2@gmail.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  sendMail,
  getWelcomeTemplate,
  getTurfRegisteredTemplate,
  getCustomerWelcomeTemplate
};
