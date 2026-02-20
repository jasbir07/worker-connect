const express = require("express");
const {
  createJob,
  getAllJobs,
  applyJob,
  getMyJobs,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  getAppliedJobIds,
  selectWorker,
  completeJob,
  completeApplication,
  cancelJob
} = require("../controllers/jobController");

const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");

const router = express.Router();

/* ===== STATIC ROUTES FIRST ===== */

// Client
router.post("/", protect, authorize("client"), createJob);
router.get("/", protect, authorize("worker", "client"), getAllJobs);
router.get("/my-jobs", protect, authorize("client"), getMyJobs);

// Worker
router.get("/my-applications", protect, authorize("worker"), getMyApplications);
router.get("/applied", protect, authorize("worker"), getAppliedJobIds);

/* ===== DYNAMIC ROUTES LAST ===== */

// Apply
router.post("/:jobId/apply", protect, authorize("worker"), applyJob);

// Client job applications
router.get("/:jobId/applications", protect, authorize("client"), getJobApplications);

// Reject application
router.patch(
  "/applications/:applicationId",
  protect,
  authorize("client"),
  updateApplicationStatus
);

// Complete application (booking) - client only
router.put(
  "/applications/:applicationId/complete",
  protect,
  authorize("client"),
  completeApplication
);

// Job Lifecycle Management
router.put("/:id/select-worker", protect, authorize("client"), selectWorker);
router.put("/:id/complete", protect, authorize("client"), completeJob);
router.put("/:id/cancel", protect, authorize("client"), cancelJob);

module.exports = router;
