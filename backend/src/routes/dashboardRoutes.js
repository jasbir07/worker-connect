const express = require("express");
const { getDashboardStats } = require("../controllers/dashboardController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Get dashboard statistics (protected)
router.get("/stats", protect, getDashboardStats);

module.exports = router;
