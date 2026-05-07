require('dotenv').config();
const { sendMail, getWelcomeTemplate } = require('./helpers/email_helper');

async function runTest() {
  const targetEmail = process.env.SMTP_USER || 'devlume2@gmail.com';
  console.log(`🚀 Starting Email SMTP Connection Test...`);
  console.log(`📧 Target Email: ${targetEmail}`);
  console.log(`📡 SMTP Server: ${process.env.SMTP_HOST || 'smtp.gmail.com'}:${process.env.SMTP_PORT || '587'}`);
  console.log(`👤 SMTP User: ${process.env.SMTP_USER}`);
  
  if (!process.env.SMTP_PASS || process.env.SMTP_PASS.includes('your_gmail')) {
    console.error('❌ Error: SMTP_PASS is not configured correctly in .env. Please fill in your 16-character App Password first!');
    process.exit(1);
  }

  const html = getWelcomeTemplate('Test Owner Name');

  const result = await sendMail({
    to: targetEmail,
    subject: '🧪 FieldCrest Email SMTP Connection Test',
    html
  });

  if (result.success) {
    console.log('\n======================================================');
    console.log('✅ SUCCESS! Your SMTP connection is configured perfectly.');
    console.log(`💬 Result: Email dispatched successfully.`);
    console.log('📬 Please check your Gmail Inbox or Spam folder right now!');
    console.log('======================================================\n');
  } else {
    console.log('\n======================================================');
    console.log('❌ FAILED! SMTP connection failed.');
    console.log(`💬 Error Details: ${result.error}`);
    console.log('======================================================\n');
  }
}

runTest();
