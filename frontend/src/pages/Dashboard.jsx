import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <h2>Welcome, {user.name}</h2>
      <p className="role">
        Role: <strong>{user.role}</strong>
      </p>

      {/* WORKER DASHBOARD */}
      {user.role === "worker" && (
        <div className="dashboard-card">
          <h3>Find Work</h3>
          <p>Browse available jobs and apply.</p>
          <button onClick={() => navigate("/jobs")}>
            Browse Jobs
          </button>
        </div>
      )}

      {/* CLIENT DASHBOARD */}
      {user.role === "client" && (
        <div className="dashboard-card">
          <h3>Hire Workers</h3>
          <p>Post a job and manage applicants.</p>
          <button onClick={() => navigate("/post-job")}>
            Post a Job
          </button>
        </div>
      )}
    </div>
  );
}
