import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import passport from "passport";
import session from "express-session";
import MongoStore from "connect-mongo";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.set('trust proxy', 1);
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
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
    mongoUrl: process.env.MONGO_URI || "mongodb://localhost:27017/gym_website",
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
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/gym_website";

mongoose.connect(mongoURI, {
  dbName: 'gym_website'
})
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

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
  googleId: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  picture: { type: String },
  role: { type: String, enum: ['member', 'trainer', 'admin'], default: 'member' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

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
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ googleId: profile.id });

    if (user) {
      return done(null, user);
    }

    // Create new user
    user = new User({
      googleId: profile.id,
      displayName: profile.displayName,
      email: profile.emails[0].value,
      picture: profile.photos[0].value
    });

    await user.save();
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

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

// Authentication Routes
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

// API Routes
app.get("/api/home", (req, res) => {
  res.json({ message: "Welcome to Home Page" });
});

app.get("/api/about", (req, res) => {
  res.json({ message: "About Us Page" });
});

app.get("/api/contact", (req, res) => {
  res.json({ message: "Contact Us Page" });
});

app.get("/api/services", (req, res) => {
  res.json({ message: "Our Services" });
});

// GET route to retrieve all contact submissions (for admin)
app.get("/api/contacts", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ submittedAt: -1 });
    res.json({ success: true, contacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST route for contact form submission
app.post("/api/contact", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, interest, message } = req.body;

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

    // Create new contact submission
    const submission = new Contact({
      firstName,
      lastName,
      email,
      phone: phone || "",
      interest: interest || "",
      message
    });

    // Save to database
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

// ========== DASHBOARD API ROUTES ==========

// MEMBER DASHBOARD
// Get member dashboard data
app.get("/api/dashboard/member", async (req, res) => {
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
app.get("/api/dashboard/trainer", async (req, res) => {
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
app.get("/api/dashboard/admin", async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized - admin access required" });
    }

    const totalMembers = await User.countDocuments({ role: 'member' });
    const totalTrainers = await User.countDocuments({ role: 'trainer' });
    const activeMemberships = await Membership.countDocuments({ isActive: true });
    const totalClasses = await Class.countDocuments();
    const recentSignups = await User.find({ role: 'member' }).sort({ createdAt: -1 }).limit(10);
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