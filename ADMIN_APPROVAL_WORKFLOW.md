# FitZone User Approval Workflow

## Admin Dashboard - Quick Reference

### What the Admin Sees
In the **"Pending Member / Trainer Requests"** section, the admin can view all new registration requests:

```
├─ Name: John Doe
├─ Role: member (or trainer)
├─ Email: john@example.com
├─ Phone: +91-XXXXXXXXXX
├─ Interest: Gym Membership
├─ Message: [User's message]
├─ Submitted: [Date & Time]
└─ Actions: [Approve] [Reject]
```

---

## Step-by-Step Approval Process

### 1. View Pending Requests
- Log in as **Admin**
- Go to **Admin Dashboard**
- Scroll to **"Pending Member / Trainer Requests"** section
- See all new signup requests with status

### 2. Decide to Approve or Reject

#### **Option A: Approve with Generated Password**
- Click **Approve** button (without entering a password)
- System generates a random secure password
- Welcome email sent automatically with this password
- Message shows: "Request approved and user created successfully. Generated password: [PASSWORD]"

#### **Option B: Approve with Custom Password**
- Enter a custom password in the password field (min. 6 characters)
- Click **Approve** button
- Welcome email sent with your custom password
- User must use this password to log in

#### **Option C: Reject Request**
- Click **Reject** button
- Request is marked as rejected
- No email is sent to the user
- User does not get access

---

## What Happens After Approval

### 1. User Account Created
- Email: From the registration form
- Name: First name + Last name
- Role: member or trainer (as requested)
- Password: Either auto-generated or custom
- Status: Verified and ready to login

### 2. Welcome Email Sent (Automatic)
The user receives an email with:
- ✅ Subject: "Welcome to FitZone - Your Account Details"
- ✅ Congratulation message about joining
- ✅ Their role (member or trainer)
- ✅ Email address
- ✅ Login password
- ✅ Instructions to change password after first login

### 3. User Can Login
- User visits website
- Goes to Login page
- Enters: Email + Password from the welcome email
- Successfully logs into their dashboard

---

## Admin Actions Summary

| Action | Outcome | Email Sent? | User Access? |
|--------|---------|-------------|--------------|
| **Approve** (auto-password) | User created with random password | ✅ Yes | ✅ Immediate |
| **Approve** (custom password) | User created with your password | ✅ Yes | ✅ Immediate |
| **Reject** | Request marked as rejected | ❌ No | ❌ No |

---

## Email Template Sent to User

### Example Welcome Email:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Welcome to FitZone!

Dear John Doe,

You have joined FitZone membership successfully as a member.

Your account has been created with the following details:

📧 Email: john@example.com
👤 Role: member
🔐 Password: a1B2c3D4e5F6g7H8

Please log in to your dashboard using your email and 
the password above.

You can change your password after logging in for the first time.

Best regards,
FitZone Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## User Registration Flow (Overview)

```
1. Member/Trainer fills contact form
   ↓
2. Selects "Member" or "Trainer" role
   ↓
3. Submits form
   ↓
4. Request appears in Admin Dashboard (Pending section)
   ↓
5. Admin reviews request details
   ↓
6. Admin clicks "Approve" (with or without custom password)
   ↓
7. ✅ User account created
   ↓
8. 📧 Welcome email sent automatically
   ↓
9. User receives email with login credentials
   ↓
10. User logs in with email + password
    ↓
11. User accesses their dashboard
    (Member Dashboard or Trainer Dashboard)
```

---

## Troubleshooting

### Email not received by user?
- Check user's spam/promotions folder
- Verify email address is correct
- Check server logs for email errors

### User can't login?
- Verify they're using the exact password from email
- Check if user is marked as "Verified" in database
- Ensure role is set correctly (member/trainer)

### Want to change someone's password?
- Currently, only use the admin password setting during approval
- To reset password later, additional password reset functionality can be added

---

## Notes for Admin

⚠️ **Important Points:**

1. **Auto-generated passwords** are secure and random
2. **Custom passwords** should be at least 6 characters
3. **Rejected requests** can be manually re-submitted by users
4. **Email configuration** is required (see EMAIL_SETUP_GUIDE.md)
5. **Security**: Users should change password on first login
6. **Roles**:
   - **Member**: Access to gym facilities and classes
   - **Trainer**: Can create/manage classes and train members
   - **Admin**: Full system management (you)

---

## Quick Links

- 📧 Email Setup Guide: See `EMAIL_SETUP_GUIDE.md`
- 🔧 Backend Code: `backend/server.js` (line ~520)
- 📱 Admin Dashboard: `frontend/src/components/dashboard/AdminDashboard.jsx`
- 🌐 Frontend Contact Form: `frontend/src/components/ContactForm.jsx`
