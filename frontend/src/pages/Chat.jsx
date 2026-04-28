import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import API from "../api/axios";
import "../styles/Jobs.css";

// Safely parse user id from JWT token
const token = localStorage.getItem("token");
const myUserId = token ? JSON.parse(atob(token.split(".")[1])).id : null;

export default function Chat() {
  const { roomId } = useParams();
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Load chat history
    API.get(`/chat/messages/${roomId}`)
      .then((res) => setMessages(res.data))
      .catch(() => setMessages([]));

    // Load room info
    API.get(`/chat/rooms/${roomId}`)
      .then((res) => setIsCompleted(res.data.isCompleted === true))
      .catch(() => {});

    // 🔥 FIXED SOCKET (no localhost)
    socketRef.current = io("/", {
      auth: {
        token: localStorage.getItem("token")
      },
      transports: ["websocket"],
      withCredentials: true
    });

    // Debug logs
    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current.id);
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("Socket error:", err.message);
    });

    // Join room
    socketRef.current.emit("joinChatRoom", roomId);

    // Listen messages
    socketRef.current.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim() || isCompleted) return;

    socketRef.current?.emit("sendMessage", {
      roomId,
      text: message
    });

    setMessage("");
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getSenderId = (m) =>
    (m.senderId && (m.senderId._id || m.senderId)) || null;

  return (
    <div className="jobs-container">
      <div className="chat-card">
        <div className="chat-header">
          <div>
            <h2 className="chat-title">Chat</h2>
            <p className="chat-subtitle">
              Coordinate details and next steps with the other side.
            </p>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((m) => {
            const senderId = getSenderId(m);
            const isMine =
              myUserId && senderId && senderId.toString() === myUserId;

            return (
              <div
                key={m._id || `${senderId}-${m.createdAt}-${m.text}`}
                className={`chat-message-row ${
                  isMine ? "chat-message-row-me" : "chat-message-row-them"
                }`}
              >
                <div
                  className={`chat-message-bubble ${
                    isMine
                      ? "chat-message-bubble-me"
                      : "chat-message-bubble-them"
                  }`}
                >
                  <div className="chat-message-meta">
                    <span className="chat-message-sender">
                      {isMine ? "You" : m.senderName || m.senderId?.name}
                    </span>
                    <span className="chat-message-role">
                      {m.senderRole || m.senderId?.role}
                    </span>
                  </div>
                  <div className="chat-message-text">{m.text}</div>
                  <div className="chat-message-time">
                    {formatTime(m.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {isCompleted ? (
          <p className="status-text" style={{ padding: "12px", color: "#6b7280" }}>
            This chat is read-only (job completed).
          </p>
        ) : (
          <div className="chat-input-row">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="chat-input"
            />
            <button className="chat-send-btn" onClick={sendMessage}>
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
