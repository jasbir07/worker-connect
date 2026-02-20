const ChatRoom = require("../models/ChatRoom");
const Application = require("../models/Application");
const Job = require("../models/Job");
const Message = require("../models/Message");

exports.getOrCreateChatRoom = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id.toString();

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const application = await Application.findOne({
      jobId,
      $or: [
        { status: "In Progress" },
        { status: "Completed" },
        { status: "accepted" }
      ]
    }).populate("chatId");

    if (!application) {
      return res.status(403).json({
        message: "Chat not allowed before applicant is accepted"
      });
    }

    if (
      application.workerId.toString() !== userId &&
      job.clientId.toString() !== userId
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    let room = application.chatId
      ? await ChatRoom.findById(application.chatId)
      : await ChatRoom.findOne({
          jobId,
          workerId: application.workerId
        });

    if (!room) {
      room = await ChatRoom.create({
        jobId,
        workerId: application.workerId,
        clientId: job.clientId
      });
      application.chatId = room._id;
      await application.save();
    }

    const isCompleted = application.status === "Completed" || job.status === "completed";
    res.json({ ...room.toObject(), isCompleted });
  } catch (error) {
    res.status(500).json({ message: "Chat room error" });
  }
};

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

/* Get room info (including isCompleted for read-only chat) */
exports.getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const job = await Job.findById(room.jobId);
    const application = await Application.findOne({
      jobId: room.jobId,
      workerId: room.workerId
    });

    const isCompleted =
      job?.status === "completed" || application?.status === "Completed";

    res.json({ _id: room._id, isCompleted });
  } catch (error) {
    res.status(500).json({ message: "Error fetching room" });
  }
};
