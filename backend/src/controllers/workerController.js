const WorkerProfile = require("../models/WorkerProfile");

exports.createProfile = async (req, res) => {
  try {
    const profile = await WorkerProfile.create({
      userId: req.user.id,
      skills: req.body.skills,
      experience: req.body.experience,
      location: req.body.location
    });

    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ message: "Error creating profile" });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const profile = await WorkerProfile.findOne({ userId: req.user.id });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};
