const Application = require("../models/Application");
const Job = require("../models/Job");
const WorkerProfile = require("../models/WorkerProfile");

/* ======================
   GET DASHBOARD STATS
   Role-based statistics
====================== */
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    if (req.user.role === "worker") {
      // Applications Sent
      const applicationsCount = await Application.countDocuments({
        workerId: userId
      });

      // Jobs Accepted (in-progress + completed)
      const acceptedJobs = await Job.countDocuments({
        selectedWorker: userId,
        status: { $in: ["in-progress", "completed"] }
      });

      // Completed Jobs
      const completedJobs = await Job.countDocuments({
        selectedWorker: userId,
        status: "completed"
      });

      // Get worker rating from profile
      const profile = await WorkerProfile.findOne({ user: userId });
      const averageRating = profile?.averageRating || 0;
      const totalRatings = profile?.totalRatings || 0;

      return res.json({
        role: "worker",
        applicationsCount,
        acceptedJobs,
        completedJobs,
        averageRating,
        totalRatings
      });
    }

    if (req.user.role === "admin") {
      return res.json({
        role: "admin",
        message: "Use the Admin panel for platform analytics."
      });
    }

    if (req.user.role === "client") {
      // Jobs Posted
      const jobsPosted = await Job.countDocuments({
        clientId: userId
      });

      // Open Positions
      const openPositions = await Job.countDocuments({
        clientId: userId,
        status: "open"
      });

      // Hires Made (jobs with selectedWorker assigned)
      const hiresMade = await Job.countDocuments({
        clientId: userId,
        selectedWorker: { $exists: true, $ne: null }
      });

      // Completed Jobs
      const completedJobs = await Job.countDocuments({
        clientId: userId,
        status: "completed"
      });

      return res.json({
        role: "client",
        jobsPosted,
        openPositions,
        hiresMade,
        completedJobs
      });
    }

    return res.status(400).json({ message: "Invalid user role" });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
};
