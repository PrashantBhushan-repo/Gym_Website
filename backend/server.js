import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});