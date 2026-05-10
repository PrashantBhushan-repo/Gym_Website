import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function testEmail() {
  try {
    console.log('Testing email configuration...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set (length: ' + process.env.EMAIL_PASS.length + ')' : 'Not set');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: 'FitZone Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Test Successful!</h2>
          <p>This is a test email to verify that the email configuration is working.</p>
          <p>If you received this email, the email functionality is working correctly.</p>
          <p>Best regards,<br>FitZone Team</p>
        </div>
      `
    };

    const result = await emailTransporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Response:', result.response);
  } catch (error) {
    console.error('❌ Email test failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Command:', error.command);

    if (error.code === 'EAUTH') {
      console.log('\n🔧 Possible solutions:');
      console.log('1. Check if EMAIL_USER and EMAIL_PASS are correct in .env');
      console.log('2. Make sure you are using an App Password (not regular password)');
      console.log('3. Enable 2-Factor Authentication on your Gmail account');
      console.log('4. Generate an App Password from Google Account settings');
    }
  }
}

testEmail();