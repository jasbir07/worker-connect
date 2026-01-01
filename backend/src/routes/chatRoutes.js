const express = require("express");
const {
  createOrGetChatRoom,
  getMessages
} = require("../controllers/chatController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/room", protect, createOrGetChatRoom);
router.get("/messages/:roomId", protect, getMessages);

module.exports = router;
