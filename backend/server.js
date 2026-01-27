const app = require("./src/app");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const http = require("http");
const jwt = require("jsonwebtoken");
const Message = require("./src/models/Message");
const User = require("./src/models/User");

dotenv.config();
connectDB();

const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.set("io", io);

/* ======================
   SOCKET AUTH (JWT)
====================== */
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // { id, role }
    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
});

/* ======================
   SOCKET CONNECTION
====================== */
io.on("connection", (socket) => {
  console.log("User connected:", socket.user.id);

  // ✅ JOIN CHAT ROOM
  socket.on("joinChatRoom", (roomId) => {
    if (!roomId) return;

    socket.join(roomId);
    console.log(`User ${socket.user.id} joined room ${roomId}`);

    // optional confirmation (useful for debugging)
    socket.emit("joinedRoom", roomId);
  });

  // ✅ SEND MESSAGE
  socket.on("sendMessage", async ({ roomId, text }) => {
  try {
    if (!roomId || !text?.trim()) return;

    const sender = await User.findById(socket.user.id).select("name role");

    const message = await Message.create({
      chatRoomId: roomId,
      senderId: socket.user.id,
      text
    });

    io.to(roomId).emit("receiveMessage", {
      _id: message._id,
      chatRoomId: roomId,
      senderId: socket.user.id,
      senderName: sender.name,
      senderRole: sender.role,
      text: message.text,
      createdAt: message.createdAt
    });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
  }
});


  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.user.id);
  });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
