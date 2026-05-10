# Email Setup Guide for FitZone

## Overview
Your website now sends welcome emails to new members and trainers when the admin approves their requests. The welcome email includes their login credentials and role information.

## What Happens

### User Registration Flow
1. **Member/Trainer submits form** - User fills out the contact form and selects either "Member" or "Trainer" role
2. **Admin reviews request** - The admin sees the pending request in their dashboard
3. **Admin approves & creates user** - Admin can:
   - Set a custom password, OR
   - Let the system auto-generate a secure password
4. **Email is sent** - A welcome email is automatically sent to the new user with:
   - Confirmation of their role (Member or Trainer)
   - Their email address
   - Their temporary password
   - Instructions to log in

### Email Content Example
```
Subject: Welcome to FitZone - Your Account Details

Dear [First Name] [Last Name],

You have joined FitZone membership successfully as a trainer.

Your account has been created with the following details:
- Email: [user-email@example.com]
- Role: trainer
- Password: [Generated Password]

Please log in to your dashboard using your email and the password above.
You can change your password after logging in for the first time.

Best regards,
FitZone Team
```

## Setup Requirements

### 1. Gmail Configuration (Recommended)
The system uses Gmail's SMTP server to send emails. You need to set up "App Passwords":

#### Steps:
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification (if not already enabled)
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select "Mail" and "Windows Computer" (or your device)
5. Generate an app password (16 characters)
6. Copy this password

### 2. Update Environment Variables

Edit your `.env` file in the backend folder:

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here
```

**Example:**
```
EMAIL_USER=prashant.bhushan.tech@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

⚠️ **Important:** 
- Do NOT use your regular Gmail password
- Use the 16-character App Password generated above
- Keep this information secure

### 3. Verify Configuration

Test that emails are being sent:
1. Go to Admin Dashboard
2. Find a pending member/trainer request
3. Click "Approve"
4. Check the applicant's email inbox for the welcome email

## How to Customize Email Template

To modify the welcome email content, edit the `handleApproveRequest` function in `server.js` around line 530:

```javascript
const mailOptions = {
  from: process.env.EMAIL_USER,
  to: request.email,
  subject: 'Welcome to FitZone - Your Account Details', // Change subject here
  html: `
    <!-- Customize HTML content here -->
  `
};
```

## Troubleshooting

### Email Not Sending?

1. **Check EMAIL_USER and EMAIL_PASS in .env**
   - Make sure they're set correctly
   - Don't use your regular Gmail password

2. **Check Gmail App Password**
   - Is 2-Step Verification enabled?
   - Did you generate an "App Password"?

3. **Check Server Logs**
   - Look for error messages in terminal
   - Console will show: "Welcome email sent to [email]"

4. **Verify User Email**
   - Make sure the user provided a valid email address
   - Check spam/promotions folder

### Common Errors

**"Invalid login" error:**
- Use App Password, not regular Gmail password

**"Less secure apps" error:**
- You're using 2-factor authentication, use App Password instead

**Email goes to spam:**
- Check spam/promotions folder
- Gmail may flag automated emails initially

## Alternative Email Services

To use a different email service instead of Gmail:

1. **Microsoft Outlook:**
```javascript
const emailTransporter = nodemailer.createTransport({
  service: 'outlook',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

2. **Custom SMTP Server:**
```javascript
const emailTransporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## Code Location

The email sending functionality is implemented in:
- **File:** `backend/server.js`
- **Function:** `handleApproveRequest` (around line 520-560)
- **Triggers:** When admin approves a pending member/trainer request

## Security Best Practices

✅ **DO:**
- Use App Password for Gmail, not your main password
- Keep `.env` file in `.gitignore`
- Use environment variables for sensitive data
- Test with non-critical email first

❌ **DON'T:**
- Commit `.env` to version control
- Share your email credentials
- Use your main Gmail password
- Hard-code credentials in code

## Future Enhancements

You can extend this functionality to:
- Send password reset emails
- Send order confirmation emails
- Send notifications about class schedules
- Send bulk announcements to members
- Add email templates with better styling
