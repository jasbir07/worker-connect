const ChatRoom = require("../models/ChatRoom");
const Application = require("../models/Application");
const Job = require("../models/Job");
const Message = require("../models/Message");

exports.getOrCreateChatRoom = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const application = await Application.findOne({
      jobId,
      status: "accepted"
    });

    if (!application) {
      return res.status(403).json({
        message: "Chat not allowed before acceptance"
      });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (
      application.workerId.toString() !== userId &&
      job.clientId.toString() !== userId
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    let room = await ChatRoom.findOne({
      jobId,
      workerId: application.workerId
    });

    if (!room) {
      room = await ChatRoom.create({
        jobId,
        workerId: application.workerId,
        clientId: job.clientId
      });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "Chat room error" });
  }
};

/* 🔥 ADD THIS EXPORT */
exports.getChatMessages = async (req, res) => {
  try {
const messages = await Message.find({
  chatRoomId: req.params.roomId
})
  .populate("senderId", "name role")
  .sort({ createdAt: 1 });


    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages" });
  }
};
