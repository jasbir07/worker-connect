const WorkerProfile = require("../models/WorkerProfile");
const ClientProfile = require("../models/ClientProfile");
const User = require("../models/User");
const Job = require("../models/Job");

/* ======================
   GET PROFILE
   Auto-creates if doesn't exist
====================== */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("name email role createdAt");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "worker") {
      let profile = await WorkerProfile.findOne({ user: userId }).populate(
        "user",
        "name email"
      );

      if (!profile) {
        // Auto-create worker profile
        profile = await WorkerProfile.create({ user: userId });
        profile = await WorkerProfile.findById(profile._id).populate(
          "user",
          "name email"
        );
      }

      const profileObj = profile.toObject();
      // Remove nested user object, use direct user data
      delete profileObj.user;
      return res.json({
        ...profileObj,
        name: user.name,
        email: user.email,
        memberSince: user.createdAt
      });
    } else if (user.role === "client") {
      let profile = await ClientProfile.findOne({ user: userId }).populate(
        "user",
        "name email"
      );

      if (!profile) {
        // Auto-create client profile
        profile = await ClientProfile.create({ user: userId });
        profile = await ClientProfile.findById(profile._id).populate(
          "user",
          "name email"
        );
      }

      // Calculate total jobs posted
      const totalJobsPosted = await Job.countDocuments({ clientId: userId });

      const profileObj = profile.toObject();
      // Remove nested user object, use direct user data
      delete profileObj.user;
      return res.json({
        ...profileObj,
        name: user.name,
        email: user.email,
        memberSince: user.createdAt,
        totalJobsPosted
      });
    }

    res.status(400).json({ message: "Invalid user role" });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

/* ======================
   UPDATE PROFILE
====================== */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("role");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "worker") {
      const { bio, skills, experience, location } = req.body;

      let profile = await WorkerProfile.findOne({ user: userId });

      if (!profile) {
        profile = await WorkerProfile.create({ user: userId });
      }

      // Update only provided fields
      if (bio !== undefined) profile.bio = bio;
      if (skills !== undefined) profile.skills = Array.isArray(skills) ? skills : [];
      if (experience !== undefined) profile.experience = experience;
      if (location !== undefined) profile.location = location;

      await profile.save();

      const updatedProfile = await WorkerProfile.findById(profile._id);
      const fullUser = await User.findById(userId).select("name email");

      const profileObj = updatedProfile.toObject();
      return res.json({
        ...profileObj,
        name: fullUser.name,
        email: fullUser.email
      });
    } else if (user.role === "client") {
      const { phone, location } = req.body;

      let profile = await ClientProfile.findOne({ user: userId });

      if (!profile) {
        profile = await ClientProfile.create({ user: userId });
      }

      // Update only provided fields
      if (phone !== undefined) profile.phone = phone;
      if (location !== undefined) profile.location = location;

      await profile.save();

      const updatedProfile = await ClientProfile.findById(profile._id);
      const fullUser = await User.findById(userId).select("name email");

      // Calculate total jobs posted
      const totalJobsPosted = await Job.countDocuments({ clientId: userId });

      const profileObj = updatedProfile.toObject();
      return res.json({
        ...profileObj,
        name: fullUser.name,
        email: fullUser.email,
        totalJobsPosted
      });
    }

    res.status(400).json({ message: "Invalid user role" });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

/* ======================
   UPLOAD PROFILE IMAGE
====================== */
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.user._id;
    const user = await User.findById(userId).select("role");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    if (user.role === "worker") {
      let profile = await WorkerProfile.findOne({ user: userId });

      if (!profile) {
        profile = await WorkerProfile.create({ user: userId });
      }

      profile.profileImage = imagePath;
      await profile.save();

      const updatedProfile = await WorkerProfile.findById(profile._id);
      const fullUser = await User.findById(userId).select("name email");

      const profileObj = updatedProfile.toObject();
      return res.json({
        ...profileObj,
        name: fullUser.name,
        email: fullUser.email
      });
    } else if (user.role === "client") {
      let profile = await ClientProfile.findOne({ user: userId });

      if (!profile) {
        profile = await ClientProfile.create({ user: userId });
      }

      profile.profileImage = imagePath;
      await profile.save();

      const updatedProfile = await ClientProfile.findById(profile._id);
      const fullUser = await User.findById(userId).select("name email");

      const totalJobsPosted = await Job.countDocuments({ clientId: userId });

      const profileObj = updatedProfile.toObject();
      return res.json({
        ...profileObj,
        name: fullUser.name,
        email: fullUser.email,
        totalJobsPosted
      });
    }

    res.status(400).json({ message: "Invalid user role" });
  } catch (error) {
    console.error("Upload profile image error:", error);
    res.status(500).json({ message: "Error uploading image" });
  }
};
