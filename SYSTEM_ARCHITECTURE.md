# 📊 System Architecture & Data Flow

## Overall System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER SUBMITS FORM                         │
│                      (Contact Form with Role)                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    HTTP POST /contact
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API (Node.js)                       │
│  • Validate form data                                            │
│  • Create PendingRequest in MongoDB                              │
│  • Store with status: "pending"                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MONGODB DATABASE                              │
│                 PendingRequest Collection:                       │
│  {                                                               │
│    _id: ObjectId,                                                │
│    firstName: "John",                                            │
│    lastName: "Doe",                                              │
│    email: "john@example.com",                                    │
│    requestedRole: "member",                                      │
│    status: "pending",                                            │
│    submittedAt: DateTime                                         │
│  }                                                               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD (React)                       │
│  GET /admin/pending-requests                                    │
│  • Fetches all pending requests                                 │
│  • Shows: Name, Email, Role, Message                            │
│  • Displays: [Approve] [Reject] buttons                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
              ADMIN CLICKS "APPROVE"
                           │
                ┌──────────┴──────────┐
                │                     │
        Enters Password         Leaves Empty
        (Option B)               (Option A)
                │                     │
                └──────────┬──────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│            POST /admin/approve-request/:id                       │
│                  Backend Processing:                             │
│  1. Find PendingRequest                                          │
│  2. Validate                                                     │
│  3. Hash password (bcrypt)                                       │
│  4. Create User account                                          │
│  5. Update PendingRequest.status = "approved"                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
    MongoDB            Nodemailer         Browser
    Saves User      Composing Email      Show Success
    Account          (HTML Template)      Message
        │                  │                  │
        │                  ▼                  │
        │         ┌────────────────┐         │
        │         │  Gmail SMTP    │         │
        │         │  Server        │         │
        │         │  (nodemailer)  │         │
        │         └────────┬───────┘         │
        │                  │                  │
        │                  ▼                  │
        │         📧 SEND EMAIL TO:
        │         john@example.com
        │                  │
        └──────────────────┼──────────────────┘
                           │
                    ⏱️ 5-30 seconds
                           │
                           ▼
                    📧 USER'S INBOX
                    "Welcome to FitZone"
                    Contains: Email & Password
                           │
                           ▼
                    USER LOGS IN
                    Email + Password
                           │
                           ▼
                    ✅ DASHBOARD ACCESS
                    Member or Trainer Dashboard
```

---

## Database Schema Relationships

```
┌──────────────────────┐
│   PendingRequest     │
├──────────────────────┤
│ _id (PK)             │
│ firstName            │
│ lastName             │
│ email                │
│ phone                │
│ interest             │
│ message              │
│ requestedRole        │ ────────────────┐
│ status: "pending"    │                 │
│ submittedAt          │         After Approval
│                      │                 │
│ status: "approved"   │────┐             │
└──────────────────────┘    │             │
                            │             │
                            ▼             ▼
                    ┌──────────────────┐
                    │      User        │
                    ├──────────────────┤
                    │ _id (PK)         │
                    │ displayName      │
                    │ email (UNIQUE)   │
                    │ password         │ (hashed)
                    │ role             │ (member/trainer/admin)
                    │ isVerified: true │
                    │ createdAt        │
                    │ googleId         │ (optional)
                    │ picture          │ (optional)
                    └──────────────────┘
```

---

## Email Generation Workflow

```
                        ADMIN APPROVES
                              │
                    ┌─────────┴─────────┐
                    │                   │
          Password  │         No        │
          Provided? │       Password    │
                    │                   │
                 YES│                   │NO
                    │                   │
                    ▼                   ▼
         ┌─────────────────┐  ┌──────────────────────┐
         │ Validate:       │  │ Generate Secure:     │
         │ • Min 6 chars   │  │ • 10 random chars    │
         │ • Is string     │  │ + "A1!"              │
         │ • Not empty     │  │ = 13+ char password  │
         └────────┬────────┘  └──────────┬───────────┘
                  │                      │
                  └──────────┬───────────┘
                             │
                             ▼
                      ┌─────────────┐
                      │  Hash with  │
                      │   bcrypt    │
                      │  (10 rounds)│
                      └────────┬────┘
                               │
                               ▼
                      ┌─────────────────┐
                      │ Create User:    │
                      │ • displayName   │
                      │ • email         │
                      │ • password(H)   │
                      │ • role          │
                      │ • isVerified:T  │
                      └────────┬────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
         MONGODB              EMAIL TEMPLATE
         Save User            Composer
                                    │
                        ┌───────────▼───────────┐
                        │                       │
                   HTML Template            Variables
                        │                       │
                    ┌───┴──────────────────────┴────┐
                    │                                │
                    ▼                                ▼
                  └─ firstName: "John"
                  └─ lastName: "Doe"
                  └─ requestedRole: "member"
                  └─ email: "john@example.com"
                  └─ password: "a1B2c3D4e5F6..."
                               │
                               ▼
                      ┌──────────────────┐
                      │  Compiled Email  │
                      │  (HTML + Data)   │
                      └────────┬─────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Nodemailer Config  │
                    │   • From (Email)     │
                    │   • To (Recipient)   │
                    │   • Subject          │
                    │   • HTML Body        │
                    └────────┬─────────────┘
                             │
                             ▼
                    ┌──────────────────────┐
                    │   Gmail SMTP Server  │
                    │   (via nodemailer)   │
                    └────────┬─────────────┘
                             │
                             ▼
                    📧 EMAIL DELIVERED
```

---

## API Request/Response Cycles

### 1. Submit Contact Form (Public)

```
REQUEST:
┌───────────────────────────────────────────┐
│ POST /contact                             │
│ Content-Type: application/json            │
│                                           │
│ {                                         │
│   "firstName": "John",                    │
│   "lastName": "Doe",                      │
│   "email": "john@example.com",            │
│   "phone": "+91-9876543210",              │
│   "interest": "membership",               │
│   "message": "I want to join as member",  │
│   "requestedRole": "member"  ⭐ NEW     │
│ }                                         │
└───────────────────────────────────────────┘
            │
            ▼ (Backend Processing)
    • Validate all fields
    • Check email format
    • If requestedRole provided:
      └─ Create PendingRequest
    • Else:
      └─ Create Contact

RESPONSE: 200 OK
┌───────────────────────────────────────────┐
│ {                                         │
│   "success": true,                        │
│   "message": "Your request has been      │
│              submitted. Admin will       │
│              review it soon.",           │
│   "requestId": "507f1f77bcf86cd799439011"│
│ }                                         │
└───────────────────────────────────────────┘
```

### 2. Get Pending Requests (Admin Only)

```
REQUEST:
┌─────────────────────────────────────┐
│ GET /admin/pending-requests         │
│ Headers: {                          │
│   Cookie: session=...               │
│ }                                   │
│ Auth: Admin role required           │
└─────────────────────────────────────┘
            │
            ▼ (Backend Processing)
    • Check req.user exists
    • Check req.user.role === 'admin'
    • Query: PendingRequest.find({
        status: 'pending'
      })
    • Sort by submittedAt (newest first)

RESPONSE: 200 OK
┌──────────────────────────────────────────┐
│ {                                        │
│   "success": true,                       │
│   "pendingRequests": [                   │
│     {                                    │
│       "_id": "507f1f77bcf86cd7994390...",│
│       "firstName": "John",               │
│       "lastName": "Doe",                 │
│       "email": "john@example.com",       │
│       "phone": "+91-9876543210",         │
│       "interest": "membership",          │
│       "message": "I want to join...",    │
│       "requestedRole": "member",         │
│       "submittedAt": "2024-01-15...",    │
│       "status": "pending"                │
│     },                                   │
│     ... more requests ...                │
│   ]                                      │
│ }                                        │
└──────────────────────────────────────────┘
```

### 3. Approve Request (Admin Only)

```
REQUEST:
┌────────────────────────────────────┐
│ POST /admin/approve-request/507f...│
│ Content-Type: application/json     │
│ Headers: { Cookie: session=... }   │
│                                    │
│ OPTION A (Auto-generate):          │
│ { "password": "" }                 │
│                                    │
│ OPTION B (Custom):                 │
│ { "password": "MyPassword123" }    │
└────────────────────────────────────┘
            │
            ▼ (Backend Processing)
    • Check admin role
    • Find PendingRequest by ID
    • If password empty:
      └─ Generate: random + "A1!"
    • Hash password with bcrypt
    • Create User document
    • Update PendingRequest.status
    • Compose email with template
    • Send via nodemailer
    • Log: "Welcome email sent to..."

RESPONSE: 200 OK
┌──────────────────────────────────────────┐
│ {                                        │
│   "success": true,                       │
│   "message": "User created successfully",│
│   "user": {                              │
│     "_id": "507f1f77bcf...",             │
│     "displayName": "John Doe",           │
│     "email": "john@example.com",         │
│     "role": "member",                    │
│     "isVerified": true,                  │
│     "createdAt": "2024-01-15..."         │
│   },                                     │
│   "generatedPassword": "a1B2c3D4e5F6..." │
│ }                                        │
└──────────────────────────────────────────┘

📧 EMAIL SENT AUTOMATICALLY
```

### 4. Reject Request (Admin Only)

```
REQUEST:
┌────────────────────────────────────┐
│ POST /admin/reject-request/507f... │
│ Headers: { Cookie: session=... }   │
└────────────────────────────────────┘
            │
            ▼ (Backend Processing)
    • Check admin role
    • Find PendingRequest
    • Update status = "rejected"
    • Save to database

RESPONSE: 200 OK
┌────────────────────────────────────┐
│ {                                  │
│   "success": true,                 │
│   "message": "Request rejected"    │
│ }                                  │
└────────────────────────────────────┘

❌ NO USER CREATED
❌ NO EMAIL SENT
```

---

## Component Relationships

```
Frontend (React)
├── App.js
│   ├── ContactForm.jsx ⭐ MODIFIED
│   │   └─ Added: requestedRole field
│   │   └─ Two new radio buttons (Member/Trainer)
│   │   └─ Sends to: POST /contact
│   │
│   └── Dashboard Routes
│       └── AdminDashboard.jsx (Already Complete!)
│           ├─ GET /admin/pending-requests
│           ├─ POST /admin/approve-request/:id
│           └─ POST /admin/reject-request/:id
│
Backend (Node.js/Express)
├── server.js ⭐ MODIFIED
│   ├─ Added: import nodemailer
│   ├─ Added: emailTransporter setup
│   ├─ Added: Email sending logic
│   │
│   ├─ Routes (Existing):
│   │   ├─ POST /contact (updated to support roles)
│   │   ├─ GET /admin/pending-requests
│   │   ├─ POST /admin/approve-request/:id (ENHANCED)
│   │   └─ POST /admin/reject-request/:id
│   │
│   └─ Models:
│       ├─ PendingRequest Schema
│       ├─ User Schema
│       └─ ... others unchanged
│
Database (MongoDB)
├── Collections
│   ├─ PendingRequest ⭐ NEW USAGE
│   ├─ User ⭐ Modified by approval flow
│   └─ ... others unchanged
│
External Services
└─ Gmail SMTP (via Nodemailer)
   └─ Sends welcome emails
```

---

## Security Architecture

```
User Input
    │
    ▼
┌──────────────────────┐
│ Frontend Validation  │ ← Client-side checks
│ • Email format       │
│ • Required fields    │
│ • Min password len   │
└────────┬─────────────┘
         │
    HTTP Request
         │
         ▼
┌──────────────────────┐
│ Backend Validation   │ ← Server-side checks
│ • Email regex        │
│ • Field presence     │
│ • Role enum check    │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Authentication       │ ← Only admin can approve
│ Check: req.user      │
│ Check: role='admin'  │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Password Processing  │ ← Never store plaintext
│ • Generate random    │
│ • Hash with bcrypt   │
│ • Store only hash    │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Environment Secrets  │ ← Secure config
│ • EMAIL_USER (.env)  │
│ • EMAIL_PASS (.env)  │
│ • Never in code      │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Email Transmission   │ ← Over secure SMTP
│ • Use Gmail SMTP     │
│ • TLS/SSL encrypted  │
│ • App Password auth  │
└──────────────────────┘
```

---

## Status Transition Diagram

```
PENDING REQUEST
      │
      ├─────────────┬─────────────┐
      │             │             │
   ADMIN            │             │
  APPROVES       (nothing)     ADMIN
      │             │          REJECTS
      │             │             │
      ▼             │             ▼
   APPROVED         │          REJECTED
      │             │             │
   ✅ ACTIVE        │          ❌ INACTIVE
   • User created   │          • No user created
   • Email sent     │          • No email sent
   • Can login      │          • Must submit again
      │             │             │
      └─────────────┴─────────────┘
                    │
              (Final Status)
```

---

## Data Flow Timeline

```
T=0s      Form submitted by user
          │
          └─→ PendingRequest created (status: pending)

T=0-1s    Admin sees request in dashboard
          │
          └─→ Refreshes every 5 seconds

T=X       Admin clicks "Approve"
          │
          ├─→ User account created (T+0.5s)
          │
          ├─→ Password hashed (T+0.7s)
          │
          ├─→ Email composed (T+0.8s)
          │
          └─→ Nodemailer sends email (T+1s)

T=X+1s   Email in Gmail queue
          │
          └─→ Processing...

T=X+5-30s Email delivered to user inbox
          │
          └─→ Notification appears

T=X+30s   User receives email
          │
          ├─→ Opens email
          │
          ├─→ Reads password
          │
          └─→ Goes to login page

T=X+2min  User logs in
          │
          ├─→ Authentication successful
          │
          └─→ Dashboard loads

T=X+3min  User fully set up
          │
          └─→ Can use all features
```

---

This is the complete system architecture for your FitZone email system!
