import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <nav className="navbar">
      <h2 className="logo" onClick={() => navigate("/dashboard")}>
        Worker-Connect
      </h2>

      <div className="nav-right">
        {/* WORKER NAV */}
        {user.role === "worker" && (
  <>
    <button onClick={() => navigate("/jobs")}>Jobs</button>
    <button onClick={() => navigate("/my-applications")}>
      My Applications
    </button>
  </>
)}


        {/* CLIENT NAV */}
        {user.role === "client" && (
  <>
    <button onClick={() => navigate("/post-job")}>Post Job</button>
    <button onClick={() => navigate("/my-jobs")}>My Jobs</button>
  </>
)}


        <button
          className="logout-btn"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
