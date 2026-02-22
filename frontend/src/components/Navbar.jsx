import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import "../styles/Navbar.css";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isActive = useCallback(
    (paths) => paths.includes(location.pathname),
    [location.pathname]
  );

  if (!user) return null;

  const isWorker = user.role === "worker";
  const isClient = user.role === "client";

  const initials =
    user?.name && user.name.trim().length > 0
      ? user.name.trim()[0].toUpperCase()
      : "?";

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <nav className="wc-navbar">
      <div className="wc-navbar-inner">
        {/* LEFT: Logo */}
        <div className="wc-navbar-left">
          <button
            type="button"
            className="wc-logo"
            onClick={() => navigate("/dashboard")}
          >
            <span className="wc-logo-mark">WC</span>
            <span className="wc-logo-text">WorkerConnect</span>
          </button>
        </div>

        {/* CENTER: Role-based navigation */}
        <div className="wc-navbar-center">
          <button
            type="button"
            className={`wc-nav-link ${
              isActive(["/dashboard"]) ? "active" : ""
            }`}
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>

          {isWorker && (
            <>
              <button
                type="button"
                className={`wc-nav-link ${
                  isActive(["/jobs"]) ? "active" : ""
                }`}
                onClick={() => navigate("/jobs")}
              >
                Browse Jobs
              </button>
              <button
                type="button"
                className={`wc-nav-link ${
                  isActive(["/my-applications"]) ? "active" : ""
                }`}
                onClick={() => navigate("/my-applications")}
              >
                My Applications
              </button>
            </>
          )}

          {isClient && (
            <>
              <button
                type="button"
                className={`wc-nav-link ${
                  isActive(["/post-job"]) ? "active" : ""
                }`}
                onClick={() => navigate("/post-job")}
              >
                Post Job
              </button>
              <button
                type="button"
                className={`wc-nav-link ${
                  isActive(["/my-jobs"]) ? "active" : ""
                }`}
                onClick={() => navigate("/my-jobs")}
              >
                My Jobs
              </button>
            </>
          )}
        </div>

        {/* RIGHT: Notifications + Profile */}
        <div className="wc-navbar-right">
          <NotificationBell />

          <div className="wc-profile" ref={profileRef}>
            <button
              type="button"
              className="wc-profile-trigger"
              onClick={() => setProfileOpen((open) => !open)}
            >
              <span className="wc-avatar">{initials}</span>
              <div className="wc-profile-text">
                <span className="wc-profile-name">{user.name}</span>
                <span className="wc-profile-role">
                  {isWorker ? "Worker" : "Client"}
                </span>
              </div>
              <span
                className={`wc-profile-caret ${profileOpen ? "open" : ""}`}
              />
            </button>

            {profileOpen && (
              <div className="wc-profile-dropdown">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/profile");
                  }}
                >
                  Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/profile");
                  }}
                >
                  Settings
                </button>
                <button type="button" className="logout" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
