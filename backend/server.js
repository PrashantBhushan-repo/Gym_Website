import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import passport from "passport";
import session from "express-session";
import MongoStore from "connect-mongo";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import dns from "node:dns";
import crypto from "node:crypto";
import Razorpay from "razorpay";
import nodemailer from "nodemailer";
import shopRoutes from "./routes/shopRoutes.js";

// Load environment variables
dotenv.config();

if (process.env.DNS_SERVERS) {
  dns.setServers(process.env.DNS_SERVERS.split(",").map(server => server.trim()).filter(Boolean));
}

const app = express();
const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/gym_website";

// Middleware
app.set('trust proxy', 1);
app.use(cors({
  origin: process.env.FRONTEND_URL || ["http://localhost:3000", "https://your-vercel-app.vercel.app"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: mongoURI,
    dbName: 'gym_website'
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax'
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());
app.use('/shop', shopRoutes);

// MongoDB connection
mongoose.connect(mongoURI, {
  dbName: 'gym_website'
})
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => {
    console.log("MongoDB connection error:", err.message);
    console.log("Continuing without database connection for development...");
  });

// Email transporter setup
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Initialize Razorpay only if credentials are provided
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// Utility: Calculate distance between two points using Haversine formula (returns distance in km)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

// Contact Schema
const contactSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: "" },
  interest: { type: String, default: "" },
  message: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model("Contact", contactSchema);

// User Schema
const userSchema = new mongoose.Schema({
  googleId: { type: String, required: false, sparse: true },
  displayName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  picture: { type: String },
  password: { type: String, required: false }, // For password-based login
  role: { type: String, enum: ['member', 'trainer', 'admin'], default: 'member' },
  isVerified: { type: Boolean, default: false }, // For existing users
  createdAt: { type: Date, default: Date.now }
});

// Pending Request Schema (for new user requests via contact form)
const pendingRequestSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: "" },
  interest: { type: String, default: "" },
  message: { type: String, required: true },
  requestedRole: { type: String, enum: ['member', 'trainer'], required: true },
  membershipPlan: { type: String, enum: ['Basic', 'Premium', 'Elite'], default: null },
  paymentId: { type: String, default: '' },
  orderId: { type: String, default: '' },
  generatedPassword: { type: String, default: '' },
  requestCode: { type: String, default: '' },
  membershipAmount: { type: Number, default: 0 },
  isMembershipRequest: { type: Boolean, default: false },
  preferredGymCenter: { type: mongoose.Schema.Types.ObjectId, ref: 'GymCenter' }, // NEW: Selected gym center
  userLocationAddress: { type: String }, // NEW: User's location address
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
});

const User = mongoose.model("User", userSchema);
const PendingRequest = mongoose.model("PendingRequest", pendingRequestSchema);

// Membership Schema
const membershipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planName: { type: String, enum: ['Basic', 'Premium', 'Elite'], default: 'Basic' },
  startDate: { type: Date, default: Date.now },
  renewalDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Membership = mongoose.model("Membership", membershipSchema);

// Membership Request Schema
const membershipRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  planName: { type: String, enum: ['Basic', 'Premium', 'Elite'], required: true },
  amount: { type: Number, required: true },
  phone: { type: String, default: '' },
  message: { type: String, default: '' },
  paymentId: { type: String, required: true },
  orderId: { type: String, required: true },
  signature: { type: String, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  submittedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const MembershipRequest = mongoose.model("MembershipRequest", membershipRequestSchema);

// Classes Schema
const classSchema = new mongoose.Schema({
  trainerID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  className: { type: String, required: true },
  description: { type: String },
  schedule: { type: String, required: true }, // e.g., "Mon, Wed, Fri - 6:00 PM"
  capacity: { type: Number, default: 20 },
  enrolledMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

const Class = mongoose.model("Class", classSchema);

// Workouts Schema
const workoutSchema = new mongoose.Schema({
  trainerID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workoutName: { type: String, required: true },
  exercises: [
    {
      name: String,
      sets: Number,
      reps: Number,
      weight: String
    }
  ],
  duration: { type: Number }, // in minutes
  assignedDate: { type: Date, default: Date.now }
});

const Workout = mongoose.model("Workout", workoutSchema);

// Client Progress Schema
const progressSchema = new mongoose.Schema({
  clientID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trainerID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  weight: Number,
  bodyFat: Number,
  muscleGain: Number,
  strength: String, // e.g., "Bench Press: 185 lbs"
  notes: String,
  recordedDate: { type: Date, default: Date.now }
});

const Progress = mongoose.model("Progress", progressSchema);

// Payment Schema
const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['credit_card', 'debit_card', 'paypal', 'razorpay'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  invoiceId: String,
  paymentDate: { type: Date, default: Date.now }
});

const Payment = mongoose.model("Payment", paymentSchema);

// Collaborated Gym Center Schema
const gymCenterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  latitude: { type: Number, required: true }, // For distance calculation
  longitude: { type: Number, required: true }, // For distance calculation
  phone: { type: String, required: true },
  email: { type: String, required: true },
  contactPerson: { type: String, required: true },
  collaborationTerms: { type: String, required: true }, // Terms and conditions
  facilityDescription: { type: String }, // Brief description of facilities
  isActive: { type: Boolean, default: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const GymCenter = mongoose.model("GymCenter", gymCenterSchema);

// Passport Google Strategy
// Passport Google Strategy (only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || `http://localhost:${port}/auth/google/callback`
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists by Google ID
      let user = await User.findOne({ googleId: profile.id });
      if (user) {
        return done(null, user);
      }

      // If the same email exists already, attach googleId to that account
      const email = profile.emails?.[0]?.value;
      if (email) {
        user = await User.findOne({ email: email.toLowerCase().trim() });
      }

      let role = 'member';
      const adminEmails = ['prashant.bhushan.tech@gmail.com', 'prashant189041830@gmail.com'];
      if (email && adminEmails.includes(email)) {
        role = 'admin';
      }

      if (user) {
        user.googleId = profile.id;
        user.displayName = profile.displayName || user.displayName;
        user.picture = profile.photos?.[0]?.value || user.picture;
        user.role = user.role || role;
        user.isVerified = true;
        await user.save();
        return done(null, user);
      }

      // Create new user when no matching email or googleId exists
      user = new User({
        googleId: profile.id,
        displayName: profile.displayName,
        email: email,
        picture: profile.photos?.[0]?.value,
        role: role,
        isVerified: true
      });

      await user.save();
      return done(null, user);
    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }));
}

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Authentication Routes (Google OAuth only if credentials provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  app.get("/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get("/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?auth=failed`,
      failureMessage: true
    }),
    (req, res) => {
      // Successful authentication, redirect to frontend dashboard
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      res.redirect(`${frontendUrl}/dashboard?auth=success`);
    }
  );
}

app.get("/auth/user", (req, res) => {
  if (req.user) {
    res.json({
      user: {
        id: req.user._id,
        displayName: req.user.displayName,
        email: req.user.email,
        picture: req.user.picture,
        role: req.user.role
      }
    });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

app.post("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Session destroy failed" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });
});

// Password-based login for existing users
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email, isVerified: true });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Log in user
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: "Login failed" });
      }
      res.json({
        user: {
          id: user._id,
          displayName: user.displayName,
          email: user.email,
          picture: user.picture,
          role: user.role
        }
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin verification for specific emails
app.post("/auth/admin-verify", async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminEmails = ['prashant.bhushan.tech@gmail.com', 'prashant189041830@gmail.com'];

    if (!adminEmails.includes(email) || password !== '130036') {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        displayName: email.split('@')[0],
        email: email,
        role: 'admin',
        isVerified: true
      });
      await user.save();
    }

    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: "Admin verification failed" });
      }
      res.json({
        user: {
          id: user._id,
          displayName: user.displayName,
          email: user.email,
          role: user.role
        }
      });
    });
  } catch (error) {
    console.error("Admin verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API Routes
app.get("/home", (req, res) => {
  res.json({ message: "Welcome to Home Page" });
});

app.get("/about", (req, res) => {
  res.json({ message: "About Us Page" });
});

app.get("/contact", (req, res) => {
  res.json({ message: "Contact Us Page" });
});

app.get("/services", (req, res) => {
  res.json({ message: "Our Services" });
});

// GET route to retrieve all contact submissions (for admin)
app.get("/contacts", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ submittedAt: -1 });
    res.json({ success: true, contacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST route for contact form submission (now handles role requests and gym location)
app.post("/contact", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, interest, message, requestedRole, preferredGymCenter, userLocationAddress } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // If membership payment details are included, create a membership pending request
    const membershipPlan = req.body.membershipPlan;
    const paymentId = req.body.paymentId;
    const orderId = req.body.orderId;
    const generatedPassword = req.body.generatedPassword;
    const requestCode = req.body.requestCode;
    const membershipAmount = req.body.membershipAmount;

    if (membershipPlan || paymentId || generatedPassword || requestCode) {
      if (!membershipPlan || !paymentId || !generatedPassword || !requestCode) {
        return res.status(400).json({
          success: false,
          message: "Please provide all membership payment details: plan, payment ID, order ID, generated password, and request code."
        });
      }

      const pendingRequest = new PendingRequest({
        firstName,
        lastName,
        email,
        phone: phone || "",
        interest: membershipPlan,
        message,
        requestedRole: 'member',
        membershipPlan,
        paymentId,
        orderId,
        generatedPassword,
        requestCode,
        membershipAmount: membershipAmount || 0,
        isMembershipRequest: true,
        preferredGymCenter: preferredGymCenter || null,
        userLocationAddress: userLocationAddress || ""
      });

      await pendingRequest.save();

      return res.json({
        success: true,
        message: "Your membership payment request has been submitted. Admin will review it soon.",
        requestId: pendingRequest._id
      });
    }

    // If role is requested, create pending request instead of contact
    if (requestedRole && ['member', 'trainer'].includes(requestedRole)) {
      const pendingRequest = new PendingRequest({
        firstName,
        lastName,
        email,
        phone: phone || "",
        interest: interest || "",
        message,
        requestedRole,
        preferredGymCenter: preferredGymCenter || null,
        userLocationAddress: userLocationAddress || ""
      });

      await pendingRequest.save();

      return res.json({
        success: true,
        message: "Your request has been submitted. Admin will review it soon.",
        requestId: pendingRequest._id
      });
    }

    // Regular contact submission
    const submission = new Contact({
      firstName,
      lastName,
      email,
      phone: phone || "",
      interest: interest || "",
      message
    });

    await submission.save();

    console.log("New contact submission saved:", submission);

    res.json({
      success: true,
      message: "Thank you for your message! We'll get back to you soon.",
      submissionId: submission._id
    });

  } catch (error) {
    console.error("Error processing contact form:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Razorpay order creation
app.post("/razorpay/order", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { planName } = req.body;
    const planPrices = {
      Basic: 2900,
      Premium: 5900,
      Elite: 9900
    };

    if (!planName || !planPrices[planName]) {
      return res.status(400).json({ success: false, message: "Invalid membership plan" });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, message: "Razorpay keys are not configured" });
    }

    if (!razorpay) {
      return res.status(500).json({ success: false, message: "Razorpay is not initialized" });
    }

    const amount = planPrices[planName] * 100;
    const receipt = `rcpt_${Date.now()}_${Math.random().toString(36).slice(-6)}`;
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt,
      payment_capture: 1
    });

    res.json({ success: true, order, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    const message = error?.error?.description || error?.message || "Failed to create payment order";
    res.status(500).json({ success: false, message });
  }
});

// Save membership request after successful payment
app.post("/membership/request", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { planName, amount, phone, message, paymentId, orderId, signature } = req.body;
    const planPrices = {
      Basic: 2900,
      Premium: 5900,
      Elite: 9900
    };

    if (!planName || !planPrices[planName]) {
      return res.status(400).json({ success: false, message: "Invalid membership plan" });
    }

    if (typeof amount !== 'number' || amount !== planPrices[planName]) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    if (!paymentId || !orderId || !signature) {
      return res.status(400).json({ success: false, message: "Missing payment details" });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    const request = new MembershipRequest({
      userId: req.user._id,
      email: req.user.email,
      planName,
      amount,
      phone: phone || "",
      message: message || "",
      paymentId,
      orderId,
      signature,
      paymentStatus: 'paid',
      status: 'pending'
    });

    await request.save();
    res.json({ success: true, message: "Membership request submitted successfully" });
  } catch (error) {
    console.error("Error saving membership request:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get membership requests for admin review
app.get("/admin/membership-requests", async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized - admin access required" });
    }

    const requests = await MembershipRequest.find().populate('userId', 'displayName email').sort({ submittedAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    console.error("Error fetching membership requests:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Approve membership request and activate membership
app.post("/admin/membership-requests/:requestId/approve", async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized - admin access required" });
    }

    const { requestId } = req.params;
    let { password } = req.body;

    const request = await MembershipRequest.findById(requestId);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ success: false, message: "Request not found or already processed" });
    }

    const user = await User.findById(request.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Associated user not found" });
    }

    let generatedPassword = null;
    if (!user.password || typeof user.password !== 'string' || user.password.length === 0) {
      generatedPassword = Math.random().toString(36).slice(-10) + 'A1!';
      password = generatedPassword;
      user.password = await bcrypt.hash(password, 10);
    }

    user.isVerified = true;
    await user.save();

    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + 1);

    const membership = new Membership({
      userId: user._id,
      planName: request.planName,
      renewalDate,
      isActive: true,
      price: request.amount
    });

    await membership.save();

    const payment = new Payment({
      userId: user._id,
      amount: request.amount,
      method: 'razorpay',
      status: 'completed',
      invoiceId: request.paymentId
    });

    await payment.save();

    request.status = 'approved';
    request.approvedAt = new Date();
    request.approvedBy = req.user._id;
    await request.save();

    try {
      console.log(`Attempting to send membership approval email to: ${request.email}`);
      const passwordLine = generatedPassword
        ? `<li><strong>Password:</strong> ${generatedPassword}</li>`
        : '';

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: request.email,
        subject: 'Your FitZone membership is approved',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">FitZone Membership Approved</h2>
            <p>Dear ${user.displayName},</p>
            <p>Your membership request for the <strong>${request.planName}</strong> plan has been approved.</p>
            <p>Payment details:</p>
            <ul>
              <li><strong>Amount:</strong> ₹${request.amount}</li>
              <li><strong>Payment ID:</strong> ${request.paymentId}</li>
              <li><strong>Order ID:</strong> ${request.orderId}</li>
            </ul>
            ${passwordLine}
            <p>Please log in to your dashboard with your email and password.</p>
            <p>Best regards,<br>FitZone Team</p>
          </div>
        `
      };

      const emailResult = await emailTransporter.sendMail(mailOptions);
      console.log(`✅ Membership approval email sent successfully to ${request.email}`);
      console.log('Message ID:', emailResult.messageId);
    } catch (emailError) {
      console.error('❌ Error sending membership approval email:', emailError);
      console.error('Email details:', {
        from: process.env.EMAIL_USER,
        to: request.email,
        subject: 'Your FitZone membership is approved'
      });
    }

    res.json({ success: true, message: 'Membership approved successfully', generatedPassword });
  } catch (error) {
    console.error('Error approving membership request:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Reject membership request
app.post("/admin/membership-requests/:requestId/reject", async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized - admin access required" });
    }

    const { requestId } = req.params;
    const request = await MembershipRequest.findById(requestId);

    if (!request || request.status !== 'pending') {
      return res.status(404).json({ success: false, message: "Request not found or already processed" });
    }

    request.status = 'rejected';
    await request.save();

    res.json({ success: true, message: 'Membership request rejected' });
  } catch (error) {
    console.error('Error rejecting membership request:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Test email endpoint (for debugging)
// ========== ADMIN MANAGEMENT ROUTES ==========

// Get pending requests
app.get("/admin/pending-requests", async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized - admin access required" });
    }

    const pendingRequests = await PendingRequest.find({ status: 'pending' }).sort({ submittedAt: -1 });
    res.json({ success: true, pendingRequests });
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Approve pending request and create user
app.post("/admin/approve-request/:requestId", async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized - admin access required" });
    }

    const { requestId } = req.params;
    let { password } = req.body;

    const request = await PendingRequest.findById(requestId);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ success: false, message: "Request not found or already processed" });
    }

    // Check if user already exists
    let user = await User.findOne({ email: request.email });
    let generatedPassword = null;
    let passwordToUse = password;

    if (request.isMembershipRequest) {
      // For membership payments, use the generated password from the request unless admin overrides it
      if (!passwordToUse || typeof passwordToUse !== 'string' || passwordToUse.length < 6) {
        passwordToUse = request.generatedPassword || Math.random().toString(36).slice(-10) + 'A1!';
      }

      if (!user) {
        const hashedPassword = await bcrypt.hash(passwordToUse, 10);
        user = new User({
          displayName: `${request.firstName} ${request.lastName}`,
          email: request.email,
          password: hashedPassword,
          role: 'member',
          isVerified: true
        });
        await user.save();
      } else {
        user.isVerified = true;
        if (!user.password) {
          user.password = await bcrypt.hash(passwordToUse, 10);
        }
        await user.save();
      }

      // Create membership record
      const renewalDate = new Date();
      renewalDate.setMonth(renewalDate.getMonth() + 1);

      const membership = new Membership({
        userId: user._id,
        planName: request.membershipPlan || 'Basic',
        renewalDate,
        isActive: true,
        price: request.membershipAmount || 0
      });

      await membership.save();

      // Create payment record for admin tracking
      const payment = new Payment({
        userId: user._id,
        amount: request.membershipAmount || 0,
        method: 'razorpay',
        status: 'completed',
        invoiceId: request.paymentId
      });

      await payment.save();

      request.status = 'approved';
      request.approvedAt = new Date();
      request.approvedBy = req.user._id;
      await request.save();

      generatedPassword = passwordToUse;
    } else {
      // Standard member/trainer request approval
      if (user) {
        return res.status(400).json({ success: false, message: "User with this email already exists" });
      }

      if (!passwordToUse || typeof passwordToUse !== 'string' || passwordToUse.length < 6) {
        generatedPassword = Math.random().toString(36).slice(-10) + 'A1!';
        passwordToUse = generatedPassword;
      }

      const hashedPassword = await bcrypt.hash(passwordToUse, 10);

      user = new User({
        displayName: `${request.firstName} ${request.lastName}`,
        email: request.email,
        password: hashedPassword,
        role: request.requestedRole,
        isVerified: true
      });

      await user.save();

      request.status = 'approved';
      request.approvedAt = new Date();
      request.approvedBy = req.user._id;
      await request.save();
    }

    // Send welcome email with password
    try {
      console.log(`Attempting to send welcome email to: ${request.email}`);
      const roleMessage = request.isMembershipRequest ? 'member' : (request.requestedRole === 'trainer' ? 'trainer' : 'member');
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: request.email,
        subject: 'Welcome to FitZone - Your Account Details',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to FitZone!</h2>
            <p>Dear ${request.firstName} ${request.lastName},</p>
            <p>You have joined FitZone membership successfully as a <strong>${roleMessage}</strong>.</p>
            <p>Your account has been created with the following details:</p>
            <ul>
              <li><strong>Email:</strong> ${request.email}</li>
              <li><strong>Role:</strong> ${roleMessage}</li>
              <li><strong>Password:</strong> ${passwordToUse}</li>
            </ul>
            ${request.isMembershipRequest ? `<p><strong>Membership Plan:</strong> ${request.membershipPlan}</p>
              <p><strong>Payment ID:</strong> ${request.paymentId}</p>
              <p><strong>Order ID:</strong> ${request.orderId}</p>
              <p><strong>Request Code:</strong> ${request.requestCode}</p>` : ''}
            <p>Please log in to your dashboard using your email and the password above.</p>
            <p>You can change your password after logging in for the first time.</p>
            <p>Best regards,<br>FitZone Team</p>
          </div>
        `
      };

      const emailResult = await emailTransporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent successfully to ${request.email}`);
      console.log('Message ID:', emailResult.messageId);
    } catch (emailError) {
      console.error('❌ Error sending welcome email:', emailError);
      console.error('Email details:', {
        from: process.env.EMAIL_USER,
        to: request.email,
        subject: 'Welcome to FitZone - Your Account Details'
      });
      // Don't fail the request if email fails, but log it
    }

    res.json({ success: true, message: "User created successfully", user, generatedPassword });
  } catch (error) {
    console.error("Error approving request:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Reject pending request
app.post("/admin/reject-request/:requestId", async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized - admin access required" });
    }

    const { requestId } = req.params;
    const request = await PendingRequest.findById(requestId);

    if (!request || request.status !== 'pending') {
      return res.status(404).json({ success: false, message: "Request not found or already processed" });
    }

    request.status = 'rejected';
    await request.save();

    res.json({ success: true, message: "Request rejected" });
  } catch (error) {
    console.error("Error rejecting request:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Add user manually (admin only)
app.post("/admin/add-user", async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized - admin access required" });
    }

    const displayName = req.body.displayName?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const role = req.body.role;

    console.log('admin add-user request', { displayName, email, role });

    if (!displayName || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (!['member', 'trainer', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

// Check if user already exists using normalized email
    const existingUser = await User.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });
    if (existingUser) {
      console.log('duplicate email detected', email, existingUser._id.toString(), existingUser.email);
      return res.status(400).json({ success: false, message: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      displayName: displayName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role,
      isVerified: true
    });

    try {
      await newUser.save();
    } catch (saveError) {
      console.error("Error saving new user:", saveError);
      console.error("saveError.keyValue:", saveError.keyValue);
      if (saveError.code === 11000) {
        return res.status(400).json({ success: false, message: "User with this email already exists" });
      }
      return res.status(500).json({ success: false, message: "Unable to add user" });
    }

    res.json({ success: true, message: "User added successfully", user: newUser });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Add class (admin only)
app.post("/admin/add-class", async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized - admin access required" });
    }

    const { name, description, time, capacity } = req.body;

    if (!name || !time) {
      return res.status(400).json({ success: false, message: "Class name and time are required" });
    }

    const newClass = new Class({
      className: name,
      description: description || '',
      schedule: time,
      capacity: capacity || 20
    });

    await newClass.save();

    res.json({ success: true, message: "Class created successfully", class: newClass });
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Delete user (admin only)
app.delete("/admin/delete-user/:userId", async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized - admin access required" });
    }

    const { userId } = req.params;

    // Prevent deleting admin users
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (userToDelete.role === 'admin') {
      return res.status(403).json({ success: false, message: "Cannot delete admin users" });
    }

    await User.findByIdAndDelete(userId);

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get all users (admin only)
app.get("/admin/users", async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized - admin access required" });
    }

    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ========== GYM CENTER MANAGEMENT ROUTES (ADMIN) ==========

// Add new collaborated gym center (admin only)
app.post("/admin/gym-centers", async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized - admin access required" });
    }

    let { name, address, city, state, postalCode, latitude, longitude, phone, email, contactPerson, collaborationTerms, facilityDescription } = req.body;

    latitude = parseFloat(latitude);
    longitude = parseFloat(longitude);

    // Validation
    if (!name || !address || !city || !state || !postalCode || latitude === undefined || longitude === undefined || isNaN(latitude) || isNaN(longitude) || !phone || !email || !contactPerson || !collaborationTerms) {
      return res.status(400).json({ 
        success: false, 
        message: "All required fields must be provided and coordinates must be valid numbers (name, address, city, state, postalCode, latitude, longitude, phone, email, contactPerson, collaborationTerms)" 
      });
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid latitude or longitude coordinates" 
      });
    }

    // Create new gym center
    const newGymCenter = new GymCenter({
      name,
      address,
      city,
      state,
      postalCode,
      latitude,
      longitude,
      phone,
      email,
      contactPerson,
      collaborationTerms,
      facilityDescription: facilityDescription || '',
      isActive: true,
      addedBy: req.user._id
    });

    await newGymCenter.save();

    res.json({ 
      success: true, 
      message: "Gym center added successfully", 
      gymCenter: newGymCenter 
    });
  } catch (error) {
    console.error("Error adding gym center:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get all collaborated gym centers (public endpoint - for dropdown in contact form)
app.get("/gym-centers", async (req, res) => {
  try {
    const gymCenters = await GymCenter.find({ isActive: true }).select('-collaborationTerms');
    res.json({ 
      success: true, 
      gymCenters 
    });
  } catch (error) {
    console.error("Error fetching gym centers:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Find nearby gym centers based on user location (public endpoint)
// Uses Haversine formula to calculate distance between two coordinates
app.post("/gym-centers/nearby", async (req, res) => {
  try {
    const { latitude, longitude, radiusKm = 15 } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: "User latitude and longitude are required" 
      });
    }

    // Validate coordinates
    if (typeof latitude !== 'number' || typeof longitude !== 'number' || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid latitude or longitude coordinates" 
      });
    }

    const gymCenters = await GymCenter.find({ isActive: true });

    // Calculate distance for each gym center using Haversine formula
    const nearbyGyms = gymCenters
      .map(gym => {
        const distance = calculateDistance(latitude, longitude, gym.latitude, gym.longitude);
        return {
          ...gym.toObject(),
          distance: Math.round(distance * 10) / 10 // Round to 1 decimal place
        };
      })
      .filter(gym => gym.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    res.json({ 
      success: true, 
      nearbyGyms,
      userLocation: { latitude, longitude },
      radiusKm 
    });
  } catch (error) {
    console.error("Error finding nearby gyms:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get all gym centers (admin only - includes all details)
app.get("/admin/gym-centers", async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized - admin access required" });
    }

    const gymCenters = await GymCenter.find().populate('addedBy', 'displayName email').sort({ createdAt: -1 });
    res.json({ 
      success: true, 
      gymCenters 
    });
  } catch (error) {
    console.error("Error fetching gym centers:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Update gym center (admin only)
app.put("/admin/gym-centers/:gymCenterId", async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized - admin access required" });
    }

    const { gymCenterId } = req.params;
    const updateData = req.body;

    // Prevent updating addedBy field
    delete updateData.addedBy;
    delete updateData.createdAt;

    // Update timestamp
    updateData.updatedAt = new Date();

    const updatedGymCenter = await GymCenter.findByIdAndUpdate(
      gymCenterId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedGymCenter) {
      return res.status(404).json({ success: false, message: "Gym center not found" });
    }

    res.json({ 
      success: true, 
      message: "Gym center updated successfully", 
      gymCenter: updatedGymCenter 
    });
  } catch (error) {
    console.error("Error updating gym center:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Delete gym center (admin only - soft delete by setting isActive to false)
app.delete("/admin/gym-centers/:gymCenterId", async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized - admin access required" });
    }

    const { gymCenterId } = req.params;

    const updatedGymCenter = await GymCenter.findByIdAndUpdate(
      gymCenterId,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedGymCenter) {
      return res.status(404).json({ success: false, message: "Gym center not found" });
    }

    res.json({ 
      success: true, 
      message: "Gym center deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting gym center:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ========== END ADMIN MANAGEMENT ROUTES ==========

// MEMBER DASHBOARD
// Get member dashboard data
app.get("/dashboard/member", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const membership = await Membership.findOne({ userId: req.user._id });
    const workouts = await Workout.find({ clientID: req.user._id }).sort({ assignedDate: -1 }).limit(5);
    const progress = await Progress.find({ clientID: req.user._id }).sort({ recordedDate: -1 }).limit(10);
    const enrolledClasses = await Class.find({ enrolledMembers: req.user._id });
    const payments = await Payment.find({ userId: req.user._id }).sort({ paymentDate: -1 }).limit(5);

    res.json({
      success: true,
      data: {
        membership,
        workouts,
        progress,
        enrolledClasses,
        payments,
        user: {
          displayName: req.user.displayName,
          email: req.user.email,
          picture: req.user.picture
        }
      }
    });
  } catch (error) {
    console.error("Error fetching member dashboard:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// TRAINER DASHBOARD
// Get trainer dashboard data
app.get("/dashboard/trainer", async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'trainer') {
      return res.status(403).json({ message: "Unauthorized - trainer access required" });
    }

    const assignedClasses = await Class.find({ trainerID: req.user._id }).populate('enrolledMembers', 'displayName email');
    const assignedWorkouts = await Workout.find({ trainerID: req.user._id }).populate('clientID', 'displayName email');
    const clients = await Workout.distinct('clientID', { trainerID: req.user._id });
    const clientProgress = await Progress.find({ trainerID: req.user._id }).sort({ recordedDate: -1 }).limit(20);

    res.json({
      success: true,
      data: {
        assignedClasses,
        assignedWorkouts,
        totalClients: clients.length,
        clientProgress,
        trainer: {
          displayName: req.user.displayName,
          email: req.user.email,
          picture: req.user.picture
        }
      }
    });
  } catch (error) {
    console.error("Error fetching trainer dashboard:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ADMIN DASHBOARD
// Get admin dashboard data
app.get("/dashboard/admin", async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized - admin access required" });
    }

    const totalMembers = await User.countDocuments({ role: 'member' });
    const totalTrainers = await User.countDocuments({ role: 'trainer' });
    const activeMemberships = await Membership.countDocuments({ isActive: true });
    const totalClasses = await Class.countDocuments();
    const pendingRequests = await PendingRequest.countDocuments({ status: 'pending' });
    const recentSignups = await User.find({ role: { $in: ['member', 'trainer'] } }).sort({ createdAt: -1 }).limit(10);
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const recentContacts = await Contact.find().sort({ submittedAt: -1 }).limit(10);
    const membershipStats = await Membership.aggregate([
      { $group: { _id: '$planName', count: { $sum: 1 } } }
    ]);
    const pendingMembershipRequests = await MembershipRequest.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      data: {
        totalMembers,
        totalTrainers,
        activeMemberships,
        totalClasses,
        pendingRequests,
        pendingMembershipRequests,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        recentSignups,
        recentContacts,
        membershipStats,
        admin: {
          displayName: req.user.displayName,
          email: req.user.email
        }
      }
    });
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ========== END DASHBOARD ROUTES ==========

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
