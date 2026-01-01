const express = require("express");
const { addReview } = require("../controllers/reviewController");
const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");

const router = express.Router();

// Client adds review after job completion
router.post("/:jobId", protect, addReview);
module.exports = router;
