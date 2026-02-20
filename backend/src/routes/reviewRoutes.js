const express = require("express");
const {
  createReview,
  getWorkerReviews,
  checkJobRated
} = require("../controllers/reviewController");
const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");

const router = express.Router();

// Health check: GET /api/reviews/health (no auth) - confirms router is mounted
router.get("/health", (req, res) => res.json({ ok: true, message: "Reviews API" }));

// Client creates review after job completion (POST /api/reviews)
router.post("/", protect, authorize("client"), createReview);

// Get all reviews for a worker (optional - for future use)
router.get("/worker/:workerId", protect, getWorkerReviews);

// Check if a job has been rated
router.get("/job/:jobId/check", protect, checkJobRated);

module.exports = router;
