const Review = require("../models/Review");
const Job = require("../models/Job");
const WorkerProfile = require("../models/WorkerProfile");

/* ======================
   CLIENT: CREATE REVIEW
   Only client can rate workers
   Only after job completion
====================== */
exports.createReview = async (req, res) => {
  try {
    // Step 1: Role Check
    if (req.user.role !== "client") {
      return res.status(403).json({ message: "Only clients can rate workers" });
    }

    // Step 2: Validate Input
    const { workerId, jobId, rating, comment } = req.body;

    if (!workerId || !jobId || !rating) {
      return res.status(400).json({
        message: "workerId, jobId, and rating are required"
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5"
      });
    }

    // Step 3: Find Job
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check job status
    if (job.status !== "completed") {
      return res.status(400).json({
        message: "Can only rate workers after job completion"
      });
    }

    // Check client owns the job
    if (job.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check worker is the selected worker
    if (!job.selectedWorker) {
      return res.status(400).json({
        message: "Job has no selected worker"
      });
    }

    if (job.selectedWorker.toString() !== workerId.toString()) {
      return res.status(400).json({
        message: "Worker ID does not match selected worker"
      });
    }

    // Step 4: Prevent Duplicate Rating
    const existing = await Review.findOne({ job: jobId });
    if (existing) {
      return res.status(400).json({ message: "Already rated this job" });
    }

    // Step 5: Create Review
    const review = await Review.create({
      user: workerId, // worker being rated
      client: req.user._id,
      job: jobId,
      rating,
      comment: comment || ""
    });

    // Step 6: Update Worker Average Rating
    let profile = await WorkerProfile.findOne({ user: workerId });

    if (!profile) {
      // Auto-create profile if doesn't exist
      profile = await WorkerProfile.create({ user: workerId });
    }

    // Calculate new average rating
    const newTotalRatings = profile.totalRatings + 1;
    const newAverageRating =
      (profile.averageRating * profile.totalRatings + rating) / newTotalRatings;

    profile.averageRating = Math.round(newAverageRating * 10) / 10; // Round to 1 decimal
    profile.totalRatings = newTotalRatings;
    await profile.save();

    // Populate review for response
    const populatedReview = await Review.findById(review._id)
      .populate("user", "name")
      .populate("client", "name")
      .populate("job", "title");

    res.status(201).json({
      review: populatedReview,
      message: "Review submitted successfully"
    });
  } catch (error) {
    console.error("Create review error:", error);
    if (error.code === 11000) {
      // Duplicate key error (unique constraint on job)
      return res.status(400).json({ message: "Already rated this job" });
    }
    res.status(500).json({ message: "Error creating review" });
  }
};

/* ======================
   GET REVIEWS BY WORKER
   Optional: Get all reviews for a worker
====================== */
exports.getWorkerReviews = async (req, res) => {
  try {
    const { workerId } = req.params;

    const reviews = await Review.find({ user: workerId })
      .populate("client", "name")
      .populate("job", "title")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Get worker reviews error:", error);
    res.status(500).json({ message: "Error fetching reviews" });
  }
};

/* ======================
   CHECK IF JOB IS RATED
   Helper endpoint to check if client already rated a job
====================== */
exports.checkJobRated = async (req, res) => {
  try {
    const { jobId } = req.params;

    const review = await Review.findOne({ job: jobId });
    res.json({ rated: !!review, review: review || null });
  } catch (error) {
    console.error("Check job rated error:", error);
    res.status(500).json({ message: "Error checking review" });
  }
};
