const express = require("express");
const {
  createJob,
  getAllJobs,
  applyJob
} = require("../controllers/jobController");

const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");

const router = express.Router();

// CLIENT posts job
router.post(
  "/",
  protect,
  authorize("client"),
  createJob
);

// WORKER & CLIENT view jobs
router.get(
  "/",
  protect,
  authorize("worker", "client"),
  getAllJobs
);

// WORKER applies for job
router.post(
  "/:jobId/apply",
  protect,
  authorize("worker"),
  applyJob
);

module.exports = router;
