const express = require("express");
const cors = require("cors");

const app = express();
const authRoutes = require("./routes/authRoutes");
const { protect } = require("./middlewares/authMiddleware");
// middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
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
