import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import API from "../api/axios";
import "../styles/Jobs.css";
const myUserId = JSON.parse(atob(localStorage.getItem("token").split(".")[1])).id;

export default function Chat() {
  const { roomId } = useParams();
  const socketRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // 1️⃣ Load chat history
    API.get(`/chat/messages/${roomId}`).then((res) => {
      setMessages(res.data);
    });

    // 2️⃣ Create socket
    socketRef.current = io("http://localhost:5000", {
      auth: {
        token: localStorage.getItem("token")
      },
      transports: ["websocket"]
    });

    // 3️⃣ Join room
    socketRef.current.emit("joinChatRoom", roomId);

    // 4️⃣ Listen for messages
    socketRef.current.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId]);

  const sendMessage = () => {
    if (!message.trim()) return;

    socketRef.current.emit("sendMessage", {
      roomId,
      text: message
    });

    setMessage("");
  };

  return (
    <div className="jobs-container">
      <h2>Chat</h2>

      <div
        style={{
          minHeight: "300px",
          border: "1px solid #e5e7eb",
          padding: "10px",
          overflowY: "auto"
        }}
      >
        {messages.map((m, i) => (
  <p key={i}>
    <strong>
      {m.senderName || m.senderId?.name} ({m.senderRole || m.senderId?.role})
    </strong>
    : {m.text}
  </p>
))}

      </div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type message..."
        style={{ width: "80%", padding: "8px" }}
      />
      <button className="apply-btn" onClick={sendMessage}>
        Send
      </button>
    </div>
  );
}