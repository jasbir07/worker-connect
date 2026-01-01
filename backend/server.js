const app = require("./src/app");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const http = require("http");
const jwt = require("jsonwebtoken");
const Message = require("./src/models/Message");

dotenv.config();
connectDB();

const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"]
  }
});

app.set("io", io);

// 🔐 Socket auth
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinChatRoom", (roomId) => {
    socket.join(roomId);
  });

  socket.on("sendMessage", async ({ roomId, text }) => {
    if (!roomId || !text) return;

    const message = await Message.create({
      chatRoomId: roomId,
      senderId: socket.user.id,
      text
    });

    io.to(roomId).emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
