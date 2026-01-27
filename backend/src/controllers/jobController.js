const Job = require("../models/Job");
const Application = require("../models/Application");
const Notification = require("../models/Notification");

/* ======================
   CLIENT: CREATE JOB
====================== */
exports.createJob = async (req, res) => {
  try {
    const job = await Job.create({
      clientId: req.user.id,
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
    const jobs = await Job.find({ status: "open" });
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
    console.log("APPLY JOB HIT");
    console.log("jobId:", req.params.jobId);
    console.log("workerId:", req.user.id);

    const existing = await Application.findOne({
      jobId: req.params.jobId,
      workerId: req.user.id
    });

    console.log("existing application:", existing);

    if (existing) {
      return res.status(400).json({ message: "Already applied" });
    }

    const application = await Application.create({
      jobId: req.params.jobId,
      workerId: req.user.id,
      status: "applied"
    });

    console.log("application created:", application);

    res.status(201).json(application);
  } catch (error) {
    console.error("❌ APPLY JOB ERROR:", error);
    res.status(500).json({ message: "Error applying for job" });
  }
};


/* ======================
   CLIENT: MY JOBS
====================== */
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ clientId: req.user.id });
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
      workerId: req.user.id
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
    const applications = await Application.find({
      jobId: req.params.jobId
    }).populate("workerId");

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching applicants" });
  }
};

/* ======================
   CLIENT: ACCEPT / REJECT
====================== */
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const application = await Application.findByIdAndUpdate(
      req.params.applicationId,
      { status },
      { new: true }
    );

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
      workerId: req.user.id
    }).select("jobId");

    const jobIds = applications.map(app =>
      app.jobId.toString()
    );

    res.json(jobIds);
  } catch (error) {
    res.status(500).json({ message: "Error fetching applied jobs" });
  }
};
