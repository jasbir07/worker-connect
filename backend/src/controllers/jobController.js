const Job = require("../models/Job");
const Application = require("../models/Application");

exports.createJob = async (req, res) => {
  try {
    const job = await Job.create({
      clientId: req.user.id,
      title: req.body.title,
      description: req.body.description,
      location: req.body.location
    });
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: "Error creating job" });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: "open" });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching jobs" });
  }
};

exports.applyJob = async (req, res) => {
  try {
    const application = await Application.create({
      jobId: req.params.jobId,
      workerId: req.user.id
    });
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: "Error applying for job" });
  }
};
