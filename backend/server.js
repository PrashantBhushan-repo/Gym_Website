import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import passport from "passport";
import session from "express-session";
import MongoStore from "connect-mongo";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcrypt";
import dns from "node:dns";

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

// MongoDB connection
mongoose.connect(mongoURI, {
  dbName: 'gym_website'
})
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => {
    console.log("MongoDB connection error:", err.message);
    console.log("Continuing without database connection for development...");
  });

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
  googleId: { type: String, required: false, unique: true, sparse: true },
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
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
});

const User = mongoose.model("User", userSchema);
const PendingRequest = mongoose.model("PendingRequest", pendingRequestSchema);

// Membership Schema
const membershipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planName: { type: String, enum: ['Basic', 'Premium', 'VIP'], default: 'Basic' },
  startDate: { type: Date, default: Date.now },
  renewalDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Membership = mongoose.model("Membership", membershipSchema);

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
  method: { type: String, enum: ['credit_card', 'debit_card', 'paypal'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  invoiceId: String,
  paymentDate: { type: Date, default: Date.now }
});

const Payment = mongoose.model("Payment", paymentSchema);

// Passport Google Strategy
// Passport Google Strategy (only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/callback`
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        return done(null, user);
      }

      // Determine role based on email
      let role = 'member';
      const adminEmails = ['prashant.bhushan.tech@gmail.com', 'prashant189041830@gmail.com'];
      if (adminEmails.includes(profile.emails[0].value)) {
        role = 'admin';
      }

      // Create new user
      user = new User({
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value,
        picture: profile.photos[0].value,
        role: role,
        isVerified: true
      });

      await user.save();
      return done(null, user);
    } catch (error) {
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
    passport.authenticate("google", { failureRedirect: "/login", failureMessage: true }),
    (req, res) => {
      // Successful authentication, redirect to frontend home
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      res.redirect(`${frontendUrl}/?auth=success`);
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

// POST route for contact form submission (now handles role requests)
app.post("/contact", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, interest, message, requestedRole } = req.body;

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

    // If role is requested, create pending request instead of contact
    if (requestedRole && ['member', 'trainer'].includes(requestedRole)) {
      const pendingRequest = new PendingRequest({
        firstName,
        lastName,
        email,
        phone: phone || "",
        interest: interest || "",
        message,
        requestedRole
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
    const { password } = req.body;

    const request = await PendingRequest.findById(requestId);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ success: false, message: "Request not found or already processed" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: request.email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      displayName: `${request.firstName} ${request.lastName}`,
      email: request.email,
      password: hashedPassword,
      role: request.requestedRole,
      isVerified: true
    });

    await newUser.save();

    // Update request status
    request.status = 'approved';
    await request.save();

    res.json({ success: true, message: "User created successfully", user: newUser });
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
      displayName,
      email,
      password: hashedPassword,
      role,
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

    res.json({
      success: true,
      data: {
        totalMembers,
        totalTrainers,
        activeMemberships,
        totalClasses,
        pendingRequests,
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
