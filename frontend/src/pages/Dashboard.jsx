import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [workerRating, setWorkerRating] = useState(null);

  useEffect(() => {
    if (user?.role === "worker") {
      loadWorkerRating();
    }
  }, [user]);

  const loadWorkerRating = async () => {
    try {
      const res = await API.get("/profile");
      if (res.data.averageRating > 0) {
        setWorkerRating({
          averageRating: res.data.averageRating,
          totalRatings: res.data.totalRatings
        });
      }
    } catch (err) {
      // Ignore errors
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Welcome, {user.name}</h2>
          <p className="dashboard-subtitle">
            Overview of your Worker-Connect activity.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user.role === "worker" && workerRating && (
            <div className="dashboard-rating-display">
              <span className="dashboard-rating-stars">
                ⭐ {workerRating.averageRating.toFixed(1)}
              </span>
              <span className="dashboard-rating-count">
                ({workerRating.totalRatings} review
                {workerRating.totalRatings !== 1 ? "s" : ""})
              </span>
            </div>
          )}
          <span className="dashboard-role-pill">
            {user.role === "worker" ? "Worker" : "Client"}
          </span>
        </div>
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
