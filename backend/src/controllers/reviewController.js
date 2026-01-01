const Review = require("../models/Review");
const Job = require("../models/Job");
const WorkerProfile = require("../models/WorkerProfile");

exports.addReview = async (req, res) => {
  try {
    console.log("REQ.USER:", req.user);

    const { rating, comment } = req.body;
    const jobId = req.params.jobId;

    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required" });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.status !== "completed") {
      return res.status(400).json({ message: "Job not completed yet" });
    }

    if (!job.workerId) {
      return res.status(400).json({ message: "Job not assigned to any worker" });
    }

    const alreadyReviewed = await Review.findOne({
      jobId,
      clientId: req.user._id
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: "Review already submitted" });
    }

    const review = await Review.create({
      jobId,
      workerId: job.workerId,
      clientId: req.user._id,
      rating,
      comment
    });

    res.status(201).json(review);
  } catch (error) {
    console.error("ADD REVIEW ERROR:", error);
    res.status(500).json({ message: "Error adding review" });
  }
};
