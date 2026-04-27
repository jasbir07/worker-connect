const express = require("express");
const cors = require("cors");
const path = require("path");
const { webhookHandler } = require("./routes/paymentRoutes");

const app = express();
const authRoutes = require("./routes/authRoutes");
const { protect } = require("./middlewares/authMiddleware");
const workerRoutes = require("./routes/workerRoutes");
const jobRoutes = require("./routes/jobRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const chatRoutes = require("./routes/chatRoutes");
const profileRoutes = require("./routes/profileRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// Webhook must receive raw body for signature verification
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    req.rawBody = req.body;
    try {
      req.body = JSON.parse(req.body.toString("utf8"));
    } catch (e) {
      return res.status(400).send("Invalid JSON");
    }
    next();
  },
  webhookHandler
);

// middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/worker", workerRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);

// test route
app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user
  });
});
app.get("/", (req, res) => {
  res.send("Worker-Connect Backend Running");
});

module.exports = app;
