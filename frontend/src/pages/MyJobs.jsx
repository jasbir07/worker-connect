import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import RatingModal from "../components/RatingModal";
import "../styles/Jobs.css";

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState({ isOpen: false, job: null });
  const [ratedJobs, setRatedJobs] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const res = await API.get("/jobs/my-jobs");
      setJobs(res.data);

      // Check which jobs are already rated
      const ratedSet = new Set();
      await Promise.all(
        res.data
          .filter((job) => job.status === "completed" && job.selectedWorker)
          .map(async (job) => {
            try {
              const checkRes = await API.get(`/reviews/job/${job._id}/check`);
              if (checkRes.data.rated) {
                ratedSet.add(job._id);
              }
            } catch (err) {
              // Ignore errors
            }
          })
      );
      setRatedJobs(ratedSet);
    } catch (err) {
      setError("Failed to load your jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRatingModal = (job) => {
    setRatingModal({ isOpen: true, job });
  };

  const handleCloseRatingModal = () => {
    setRatingModal({ isOpen: false, job: null });
  };

  const handleSubmitRating = async ({ rating, comment }) => {
    try {
      const { job } = ratingModal;
      const workerId = job.selectedWorker?._id ?? job.selectedWorker;
      const jobId = job._id;
      if (!workerId || !jobId) {
        alert("Missing job or worker information");
        return;
      }
      await API.post("/reviews", {
        workerId: String(workerId),
        jobId: String(jobId),
        rating: Number(rating),
        comment: comment || ""
      });

      // Mark job as rated
      setRatedJobs((prev) => new Set([...prev, job._id]));
      handleCloseRatingModal();
      loadJobs();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.response?.status === 404 ? "Endpoint not found. Is the backend running?" : "Failed to submit rating");
      alert(message);
      throw err;
    }
  };

  const handleCompleteJob = async (jobId) => {
    try {
      await API.put(`/jobs/${jobId}/complete`);
      loadJobs(); // Reload jobs
    } catch (err) {
      alert("Failed to complete job");
    }
  };

  const handleCancelJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to cancel this job?")) {
      return;
    }
    try {
      await API.put(`/jobs/${jobId}/cancel`);
      loadJobs(); // Reload jobs
    } catch (err) {
      alert("Failed to cancel job");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: { text: "Open", className: "status-open" },
      "in-progress": { text: "In Progress", className: "status-in-progress" },
      completed: { text: "Completed", className: "status-completed" },
      cancelled: { text: "Cancelled", className: "status-cancelled" }
    };
    return badges[status] || { text: status, className: "" };
  };

  if (loading) {
    return <p className="status-text">Loading your jobs...</p>;
  }

  return (
    <div className="jobs-container">
      <h2>My Posted Jobs</h2>

      {error && <p className="status-text error">{error}</p>}

      {jobs.length === 0 && !error && <p>No jobs posted yet.</p>}

      <div className="jobs-grid">
        {jobs.map((job) => {
          const statusBadge = getStatusBadge(job.status);
          return (
            <div key={job._id} className="job-card">
              <div className="job-header">
                <div>
                  <h3>{job.title}</h3>
                  <p className="location">{job.location}</p>
                </div>
                <span className={`job-status-badge ${statusBadge.className}`}>
                  {statusBadge.text}
                </span>
              </div>

              <p className="desc">{job.description}</p>

              {job.selectedWorker && (
                <div className="job-worker-info">
                  <p>
                    <strong>Selected Worker:</strong> {job.selectedWorker.name}
                  </p>
                </div>
              )}

              <div className="job-actions">
                {/* OPEN: Show applicants button */}
                {job.status === "open" && (
                  <button
                    className="apply-btn"
                    onClick={() => navigate(`/job/${job._id}/applications`)}
                  >
                    View Applicants
                  </button>
                )}

                {/* IN-PROGRESS: Show complete button */}
                {job.status === "in-progress" && (
                  <>
                    <button
                      className="apply-btn"
                      style={{ background: "#10b981" }}
                      onClick={() => handleCompleteJob(job._id)}
                    >
                      Mark as Completed
                    </button>
                    <button
                      className="apply-btn"
                      style={{ background: "#dc2626", marginLeft: "10px" }}
                      onClick={() => handleCancelJob(job._id)}
                    >
                      Cancel Job
                    </button>
                  </>
                )}

                {/* COMPLETED: Show rate worker button or rated badge */}
                {job.status === "completed" && job.selectedWorker && (
                  <>
                    {ratedJobs.has(job._id) ? (
                      <span className="job-status-badge status-completed">
                        Rated ⭐
                      </span>
                    ) : (
                      <button
                        className="apply-btn"
                        style={{ background: "#f59e0b" }}
                        onClick={() => handleOpenRatingModal(job)}
                      >
                        ⭐ Rate Worker
                      </button>
                    )}
                  </>
                )}

                {/* CANCELLED: No actions */}
                {job.status === "cancelled" && (
                  <p className="status-text" style={{ color: "#6b7280" }}>
                    This job has been cancelled
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={ratingModal.isOpen}
        onClose={handleCloseRatingModal}
        onSubmit={handleSubmitRating}
        workerName={
          ratingModal.job?.selectedWorker?.name ||
          ratingModal.job?.selectedWorker ||
          "Worker"
        }
      />
    </div>
  );
}
