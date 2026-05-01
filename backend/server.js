import express from "express";
import cors from "cors";

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for demo (replace with database in production)
let contactSubmissions = [];

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

// POST route for contact form submission
app.post("/api/contact", (req, res) => {
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

    // Store submission (in production, save to database)
    const submission = {
      id: Date.now(),
      firstName,
      lastName,
      email,
      phone: phone || "",
      interest: interest || "",
      message,
      submittedAt: new Date().toISOString()
    };

    contactSubmissions.push(submission);

    console.log("New contact submission:", submission);

    res.json({
      success: true,
      message: "Thank you for your message! We'll get back to you soon.",
      submissionId: submission.id
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
  console.log(`Backend server running on http://localhost:${port}`);
});