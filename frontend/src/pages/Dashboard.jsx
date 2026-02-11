import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Welcome, {user.name}</h2>
          <p className="dashboard-subtitle">
            Overview of your Worker-Connect activity.
          </p>
        </div>

        <span className="dashboard-role-pill">
          {user.role === "worker" ? "Worker" : "Client"}
        </span>
      </div>

      {/* SUMMARY CARDS */}
      <div className="dashboard-summary-grid">
        {user.role === "worker" && (
          <>
            <div className="dashboard-summary-card">
              <p className="summary-label">Applications sent</p>
              <p className="summary-value">—</p>
              <p className="summary-helper">
                Track how many jobs you&apos;ve applied for.
              </p>
            </div>

            <div className="dashboard-summary-card">
              <p className="summary-label">Jobs accepted</p>
              <p className="summary-value">—</p>
              <p className="summary-helper">
                Accepted opportunities across your applications.
              </p>
            </div>

            <div className="dashboard-summary-card">
              <p className="summary-label">Earnings</p>
              <p className="summary-value">—</p>
              <p className="summary-helper">
                Coming soon: see your total earnings at a glance.
              </p>
            </div>
          </>
        )}

        {user.role === "client" && (
          <>
            <div className="dashboard-summary-card">
              <p className="summary-label">Jobs posted</p>
              <p className="summary-value">—</p>
              <p className="summary-helper">
                Number of roles you&apos;ve published.
              </p>
            </div>

            <div className="dashboard-summary-card">
              <p className="summary-label">Open positions</p>
              <p className="summary-value">—</p>
              <p className="summary-helper">
                Active jobs currently visible to workers.
              </p>
            </div>

            <div className="dashboard-summary-card">
              <p className="summary-label">Hires made</p>
              <p className="summary-value">—</p>
              <p className="summary-helper">
                Accepted workers across all your jobs.
              </p>
            </div>
          </>
        )}
      </div>

      {/* PRIMARY ACTION CARD */}
      {user.role === "worker" && (
        <div className="dashboard-primary-card">
          <div className="dashboard-primary-text">
            <h3>Find your next job</h3>
            <p>
              Browse available jobs that match your skills and apply in a few
              clicks.
            </p>
          </div>
          <button
            className="dashboard-primary-button"
            onClick={() => navigate("/jobs")}
          >
            Browse jobs
          </button>
        </div>
      )}

      {user.role === "client" && (
        <div className="dashboard-primary-card">
          <div className="dashboard-primary-text">
            <h3>Post a new job</h3>
            <p>
              Create a new job and start receiving applications from workers.
            </p>
          </div>
          <button
            className="dashboard-primary-button"
            onClick={() => navigate("/post-job")}
          >
            Post a job
          </button>
        </div>
      )}
    </div>
  );
}
