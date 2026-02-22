const Job = require("../models/Job");
const Application = require("../models/Application");
const ChatRoom = require("../models/ChatRoom");
const User = require("../models/User");
const { createAndEmitNotification } = require("./notificationController");

/* ======================
   CLIENT: CREATE JOB
====================== */
exports.createJob = async (req, res) => {
  try {
    const job = await Job.create({
      clientId: req.user._id,
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      status: "open"
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: "Error creating job" });
  }
};

/* ======================
   WORKER: VIEW JOBS
====================== */
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: "open" })
      .populate("clientId", "name")
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching jobs" });
  }
};

/* ======================
   WORKER: APPLY JOB
====================== */
exports.applyJob = async (req, res) => {
  try {
    const existing = await Application.findOne({
      jobId: req.params.jobId,
      workerId: req.user._id
    });

    if (existing) {
      return res.status(400).json({ message: "Already applied" });
    }

    const application = await Application.create({
      jobId: req.params.jobId,
      workerId: req.user._id,
      status: "Pending"
    });

    const job = await Job.findById(req.params.jobId).populate("clientId", "name");
    if (job) {
      const worker = await User.findById(req.user._id).select("name");
      await createAndEmitNotification(req, {
        userId: job.clientId._id,
        type: "application",
        message: `${worker?.name || "A worker"} applied to your job "${job.title}".`,
        link: `/job/${job._id}/applications`
      });
    }

    res.status(201).json(application);
  } catch (error) {
    console.error("Apply job error:", error);
    res.status(500).json({ message: "Error applying for job" });
  }
};


/* ======================
   CLIENT: MY JOBS
====================== */
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ clientId: req.user._id })
      .populate("selectedWorker", "name email")
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching my jobs" });
  }
};

/* ======================
   WORKER: MY APPLICATIONS
====================== */
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      workerId: req.user._id
    }).populate("jobId");

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching applications" });
  }
};

/* ======================
   CLIENT: JOB APPLICANTS
====================== */
exports.getJobApplications = async (req, res) => {
  try {
    const WorkerProfile = require("../models/WorkerProfile");
    
    const applications = await Application.find({
      jobId: req.params.jobId
    }).populate("workerId");

    // Fetch worker profiles for ratings
    const applicationsWithRatings = await Promise.all(
      applications.map(async (app) => {
        const profile = await WorkerProfile.findOne({
          user: app.workerId._id
        }).select("averageRating totalRatings");
        
        return {
          ...app.toObject(),
          workerRating: profile
            ? {
                averageRating: profile.averageRating,
                totalRatings: profile.totalRatings
              }
            : null
        };
      })
    );

    res.json(applicationsWithRatings);
  } catch (error) {
    console.error("Get job applications error:", error);
    res.status(500).json({ message: "Error fetching applicants" });
  }
};

/* ======================
   CLIENT: REJECT APPLICATION
====================== */
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const application = await Application.findById(applicationId).populate(
      "jobId"
    );
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    if (application.jobId.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (application.status !== "Pending") {
      return res.status(400).json({
        message: "Can only reject Pending applications"
      });
    }

    const allowed = ["Rejected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    application.status = status;
    await application.save();

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
};

/* ======================
   WORKER: APPLIED JOB IDS
====================== */
exports.getAppliedJobIds = async (req, res) => {
  try {
    const applications = await Application.find({
      workerId: req.user._id
    }).select("jobId");

    const jobIds = applications.map(app =>
      app.jobId.toString()
    );

    res.json(jobIds);
  } catch (error) {
    res.status(500).json({ message: "Error fetching applied jobs" });
  }
};

/* ======================
   CLIENT: SELECT WORKER
   Only if job is open and worker has applied
====================== */
exports.selectWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const { workerId } = req.body;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Verify client owns the job
    if (job.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Verify job is open
    if (job.status !== "open") {
      return res.status(400).json({ 
        message: "Can only select worker for open jobs" 
      });
    }

    // Verify worker has applied (Pending)
    const application = await Application.findOne({
      jobId: id,
      workerId: workerId,
      status: "Pending"
    });

    if (!application) {
      return res.status(400).json({ 
        message: "Worker has not applied for this job" 
      });
    }

    // Create chat room between client and selected applicant
    const chatRoom = await ChatRoom.create({
      jobId: id,
      workerId: workerId,
      clientId: job.clientId
    });

    // Update application: status In Progress, link chat
    application.status = "In Progress";
    application.chatId = chatRoom._id;
    await application.save();

    // Update job
    job.selectedWorker = workerId;
    job.status = "in-progress";
    await job.save();

    const updatedJob = await Job.findById(id)
      .populate("selectedWorker", "name email");

    await createAndEmitNotification(req, {
      userId: workerId,
      type: "selected",
      message: `You were selected for the job "${job.title}".`,
      link: `/my-applications`
    });

    res.json({
      job: updatedJob,
      chatRoom: { _id: chatRoom._id }
    });
  } catch (error) {
    console.error("Select worker error:", error);
    res.status(500).json({ message: "Error selecting worker" });
  }
};

/* ======================
   CLIENT: COMPLETE JOB
   Only if status is in-progress
====================== */
exports.completeJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Verify client owns the job
    if (job.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Verify job is in-progress
    if (job.status !== "in-progress") {
      return res.status(400).json({ 
        message: "Can only complete jobs that are in-progress" 
      });
    }

    // Update job status
    job.status = "completed";
    await job.save();

    // Update application status to Completed for the selected worker
    await Application.findOneAndUpdate(
      { jobId: id, workerId: job.selectedWorker },
      { status: "Completed" }
    );

    const updatedJob = await Job.findById(id)
      .populate("selectedWorker", "name email");

    if (job.selectedWorker) {
      await createAndEmitNotification(req, {
        userId: job.selectedWorker,
        type: "completed",
        message: `Job "${job.title}" has been marked as completed.`,
        link: `/my-applications`
      });
    }

    res.json(updatedJob);
  } catch (error) {
    console.error("Complete job error:", error);
    res.status(500).json({ message: "Error completing job" });
  }
};

/* ======================
   CLIENT: COMPLETE APPLICATION (booking)
   PUT /api/jobs/applications/:applicationId/complete
====================== */
exports.completeApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId).populate(
      "jobId"
    );
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const job = await Job.findById(application.jobId._id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    if (job.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (application.status !== "In Progress") {
      return res.status(400).json({
        message: "Can only complete applications that are In Progress"
      });
    }

    application.status = "Completed";
    await application.save();

    job.status = "completed";
    await job.save();

    const updatedApplication = await Application.findById(applicationId)
      .populate("workerId", "name email")
      .populate("jobId");
    const updatedJob = await Job.findById(job._id).populate(
      "selectedWorker",
      "name email"
    );

    await createAndEmitNotification(req, {
      userId: application.workerId._id,
      type: "completed",
      message: `Job "${job.title}" has been marked as completed.`,
      link: `/my-applications`
    });

    res.json({ application: updatedApplication, job: updatedJob });
  } catch (error) {
    console.error("Complete application error:", error);
    res.status(500).json({ message: "Error completing application" });
  }
};

/* ======================
   CLIENT: CANCEL JOB
   Only if not completed
====================== */
exports.cancelJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Verify client owns the job
    if (job.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Verify job is not completed
    if (job.status === "completed") {
      return res.status(400).json({ 
        message: "Cannot cancel completed jobs" 
      });
    }

    // Update job status
    job.status = "cancelled";
    await job.save();

    const updatedJob = await Job.findById(id)
      .populate("selectedWorker", "name email");

    res.json(updatedJob);
  } catch (error) {
    console.error("Cancel job error:", error);
    res.status(500).json({ message: "Error cancelling job" });
  }
};
