import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import API from "../api/axios";
import "../styles/NotificationBell.css";

function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.frequency.value = 880;
    oscillator.type = "sine";
    gain.gain.setValueAtTime(0.15, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
  } catch (_) {}
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const socketRef = useRef(null);
  const toastTimeoutsRef = useRef({});
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Fetch notifications on mount
  useEffect(() => {
    API.get("/notifications")
      .then((res) => setNotifications(res.data || []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  // Socket: connect and listen for new notifications
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io("http://localhost:5000", {
      auth: { token },
      transports: ["websocket"]
    });
    socketRef.current = socket;

    socket.on("newNotification", (data) => {
      setNotifications((prev) => [data, ...prev]);
      playNotificationSound();
      const id = data._id || `toast-${Date.now()}`;
      setToasts((prev) => [...prev, { id, message: data.message, link: data.link || "" }]);
      const t = setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id));
      }, 5000);
      toastTimeoutsRef.current[id] = t;
    });

    return () => {
      Object.values(toastTimeoutsRef.current).forEach(clearTimeout);
      toastTimeoutsRef.current = {};
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const markAsRead = (id) => {
    API.put(`/notifications/${id}/read`)
      .then((res) => {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
      })
      .catch(() => {});
  };

  const markAllAsRead = () => {
    API.put("/notifications/read-all")
      .then(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      })
      .catch(() => {});
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) markAsRead(notification._id);
    setDropdownOpen(false);
    if (notification.link) navigate(notification.link);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  const dismissToast = useCallback((id) => {
    if (toastTimeoutsRef.current[id]) {
      clearTimeout(toastTimeoutsRef.current[id]);
      delete toastTimeoutsRef.current[id];
    }
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const handleToastClick = useCallback(
    (toast) => {
      dismissToast(toast.id);
      if (toast.link) navigate(toast.link);
    },
    [navigate, dismissToast]
  );

  return (
    <div className="notification-bell-wrapper">
      {/* Toast container: fixed, top-right */}
      <div className="notification-toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <button
            type="button"
            key={toast.id}
            className="notification-toast"
            onClick={() => handleToastClick(toast)}
          >
            <span className="notification-toast-message">{toast.message}</span>
            <button
              type="button"
              className="notification-toast-dismiss"
              onClick={(e) => {
                e.stopPropagation();
                dismissToast(toast.id);
              }}
              aria-label="Dismiss"
            >
              ×
            </button>
          </button>
        ))}
      </div>
      <button
        type="button"
        className="notification-bell-trigger"
        onClick={() => setDropdownOpen((o) => !o)}
        aria-label="Notifications"
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
        )}
      </button>

      {dropdownOpen && (
        <>
          <div
            className="notification-backdrop"
            onClick={() => setDropdownOpen(false)}
            aria-hidden="true"
          />
          <div className="notification-dropdown">
            <div className="notification-dropdown-header">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="mark-all-read"
                  onClick={markAllAsRead}
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="notification-list">
              {loading ? (
                <div className="notification-loading">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="notification-empty">No notifications yet.</div>
              ) : (
                notifications.map((n) => (
                  <button
                    type="button"
                    key={n._id}
                    className={`notification-item ${n.isRead ? "" : "unread"}`}
                    onClick={() => handleNotificationClick(n)}
                  >
                    <p className="notification-message">{n.message}</p>
                    <span className="notification-time">{formatDate(n.createdAt)}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
