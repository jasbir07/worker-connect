import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../styles/Jobs.css";

export default function JobApplicants() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = async () => {
    try {
      const [applicationsRes, jobsRes] = await Promise.all([
        API.get(`/jobs/${jobId}/applications`),
        API.get("/jobs/my-jobs")
      ]);

      setApplications(applicationsRes.data);
      const currentJob = jobsRes.data.find((j) => j._id === jobId);
      setJob(currentJob);
    } catch (err) {
      setError("Failed to load applicants");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWorker = async (workerId) => {
    if (
      !window.confirm(
        "Are you sure you want to select this worker? This will start the job."
      )
    ) {
      return;
    }

    try {
      await API.put(`/jobs/${jobId}/select-worker`, { workerId });
      loadData(); // Reload so status becomes "In Progress" and Open Chat appears
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to select worker. Make sure the job is open and the worker has applied."
      );
    }
  };

  const handleReject = async (applicationId) => {
    try {
      await API.patch(`/jobs/applications/${applicationId}`, {
        status: "Rejected"
      });
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status: "Rejected" } : app
        )
      );
    } catch (err) {
      alert("Failed to reject applicant");
    }
  };

  const handleCompleteApplication = async (applicationId) => {
    try {
      await API.put(`/jobs/applications/${applicationId}/complete`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark as completed");
    }
  };

  const openChat = async (chatIdFromApp) => {
    try {
      if (chatIdFromApp) {
        navigate(`/chat/${chatIdFromApp}`);
        return;
      }
      const res = await API.get(`/chat/room/${jobId}`);
      navigate(`/chat/${res.data._id}`);
    } catch (error) {
      alert("Chat not available yet");
    }
  };

  if (loading) {
    return <p className="status-text">Loading applicants...</p>;
  }

  return (
    <div className="jobs-container">
      <div className="jobs-header">
        <div>
          <h2 className="jobs-title">Job Applicants</h2>
          {job && (
            <p className="jobs-subtitle">
              {job.title} - Status: <strong>{job.status}</strong>
            </p>
          )}
        </div>
        <button
          className="apply-btn"
          onClick={() => navigate("/my-jobs")}
          style={{ background: "#6b7280" }}
        >
          Back to My Jobs
        </button>
      </div>

      {error && <p className="status-text error">{error}</p>}

      {/* Only show select worker option if job is open */}
      {job && job.status !== "open" && (
        <div className="status-text" style={{ color: "#f59e0b" }}>
          This job is {job.status}. Worker selection is only available for open jobs.
        </div>
      )}

      {applications.length === 0 && !error && (
        <p className="status-text">No applicants yet.</p>
      )}

      <div className="jobs-grid">
        {applications.map((app) => (
          <div key={app._id} className="job-card">
            <div className="job-header">
              <div>
                <h3>{app.workerId.name}</h3>
                <p>{app.workerId.email}</p>
              </div>
              {app.workerRating && app.workerRating.averageRating > 0 && (
                <div className="worker-rating-badge">
                  <span className="rating-stars">
                    ⭐ {app.workerRating.averageRating.toFixed(1)}
                  </span>
                  <span className="rating-count">
                    ({app.workerRating.totalRatings} review
                    {app.workerRating.totalRatings !== 1 ? "s" : ""})
                  </span>
                </div>
              )}
            </div>

            <p>
              Status: <strong>{app.status}</strong>
            </p>

            {/* Pending: Accept (Select Worker) + Reject */}
            {app.status === "Pending" && job && job.status === "open" && (
              <div className="job-actions">
                <button
                  className="apply-btn"
                  style={{ background: "#10b981" }}
                  onClick={() => handleSelectWorker(app.workerId._id)}
                >
                  Accept
                </button>
                <button
                  className="apply-btn"
                  style={{ background: "#dc2626", marginLeft: "10px" }}
                  onClick={() => handleReject(app._id)}
                >
                  Reject
                </button>
              </div>
            )}

            {/* In Progress: Open Chat + Mark as Completed (client only) */}
            {app.status === "In Progress" && job && job.status === "in-progress" && (
              <div className="job-actions">
                <button
                  className="apply-btn"
                  onClick={() => openChat(app.chatId)}
                >
                  Open Chat
                </button>
                <button
                  className="apply-btn"
                  style={{ background: "#10b981", marginLeft: "10px" }}
                  onClick={() => handleCompleteApplication(app._id)}
                >
                  Mark as Completed
                </button>
              </div>
            )}

            {/* Completed: show badge only */}
            {app.status === "Completed" && (
              <span className="job-status-badge status-completed">
                Completed
              </span>
            )}

            {/* Rejected */}
            {app.status === "Rejected" && (
              <p className="status-text" style={{ color: "#dc2626" }}>
                Rejected
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
