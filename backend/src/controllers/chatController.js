const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");

exports.createOrGetChatRoom = async (req, res) => {
  const { jobId, otherUserId } = req.body;

  let room = await ChatRoom.findOne({ jobId });

  if (!room) {
    room = await ChatRoom.create({
      jobId,
      participants: [req.user.id, otherUserId]
    });
  }

  res.json(room);
};

exports.getMessages = async (req, res) => {
  const messages = await Message.find({
    chatRoomId: req.params.roomId
  }).sort({ createdAt: 1 });

  res.json(messages);
};
