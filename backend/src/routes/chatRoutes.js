const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  getOrCreateChatRoom,
  getChatMessages
} = require("../controllers/chatController");

const router = express.Router();

router.get("/room/:jobId", protect, getOrCreateChatRoom);
router.get("/messages/:roomId", protect, getChatMessages);

module.exports = router;
