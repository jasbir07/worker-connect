import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const res = await API.get("/dashboard/stats");
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
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
          {stats?.role === "worker" && stats.averageRating > 0 && (
            <div className="dashboard-rating-display">
              <span className="dashboard-rating-stars">
                ⭐ {stats.averageRating.toFixed(1)}
              </span>
              <span className="dashboard-rating-count">
                ({stats.totalRatings} review
                {stats.totalRatings !== 1 ? "s" : ""})
              </span>
            </div>
          )}
          <span className="dashboard-role-pill">
            {user.role === "worker" ? "Worker" : "Client"}
          </span>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      {loading ? (
        <p className="status-text">Loading dashboard stats...</p>
      ) : (
        <div className="dashboard-summary-grid">
          {stats?.role === "worker" && (
            <>
              <div className="dashboard-summary-card">
                <p className="summary-label">Applications sent</p>
                <p className="summary-value">{stats.applicationsCount || 0}</p>
                <p className="summary-helper">
                  Track how many jobs you&apos;ve applied for.
                </p>
              </div>

              <div className="dashboard-summary-card">
                <p className="summary-label">Jobs accepted</p>
                <p className="summary-value">{stats.acceptedJobs || 0}</p>
                <p className="summary-helper">
                  Accepted opportunities across your applications.
                </p>
              </div>

              <div className="dashboard-summary-card">
                <p className="summary-label">Completed jobs</p>
                <p className="summary-value">{stats.completedJobs || 0}</p>
                <p className="summary-helper">
                  Successfully completed job assignments.
                </p>
              </div>
            </>
          )}

          {stats?.role === "client" && (
            <>
              <div className="dashboard-summary-card">
                <p className="summary-label">Jobs posted</p>
                <p className="summary-value">{stats.jobsPosted || 0}</p>
                <p className="summary-helper">
                  Number of roles you&apos;ve published.
                </p>
              </div>

              <div className="dashboard-summary-card">
                <p className="summary-label">Open positions</p>
                <p className="summary-value">{stats.openPositions || 0}</p>
                <p className="summary-helper">
                  Active jobs currently visible to workers.
                </p>
              </div>

              <div className="dashboard-summary-card">
                <p className="summary-label">Hires made</p>
                <p className="summary-value">{stats.hiresMade || 0}</p>
                <p className="summary-helper">
                  Accepted workers across all your jobs.
                </p>
              </div>

              <div className="dashboard-summary-card">
                <p className="summary-label">Completed jobs</p>
                <p className="summary-value">{stats.completedJobs || 0}</p>
                <p className="summary-helper">
                  Successfully completed job assignments.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* PRIMARY ACTION CARD - Dynamic based on stats */}
      {!loading && stats && (
        <>
          {/* WORKER CTA LOGIC */}
          {stats.role === "worker" && (
            <>
              {/* Priority 1: Active worker with accepted jobs */}
              {stats.acceptedJobs > 0 ? (
                <div className="dashboard-primary-card">
                  <div className="dashboard-primary-text">
                    <h3>Continue Your Work</h3>
                    <p>
                      You have {stats.acceptedJobs} active job{stats.acceptedJobs !== 1 ? "s" : ""}. 
                      View your applications and manage your work.
                    </p>
                  </div>
                  <button
                    className="dashboard-primary-button"
                    onClick={() => navigate("/my-applications")}
                  >
                    Continue Your Work
                  </button>
                </div>
              ) : (
                <>
                  {/* Priority 2: First-time user: No applications yet */}
                  {stats.applicationsCount === 0 ? (
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
                        Browse Jobs
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Priority 3: Has completed jobs but no active ones */}
                      {stats.completedJobs > 0 ? (
                        <div className="dashboard-primary-card">
                          <div className="dashboard-primary-text">
                            <h3>View Completed Jobs</h3>
                            <p>
                              You&apos;ve successfully completed {stats.completedJobs} job{stats.completedJobs !== 1 ? "s" : ""}. 
                              Review your work history and achievements.
                            </p>
                          </div>
                          <button
                            className="dashboard-primary-button"
                            onClick={() => navigate("/my-applications")}
                          >
                            View Completed Jobs
                          </button>
                        </div>
                      ) : (
                        /* Priority 4: Has applications but no accepted/completed jobs */
                        <div className="dashboard-primary-card">
                          <div className="dashboard-primary-text">
                            <h3>Keep Applying</h3>
                            <p>
                              You&apos;ve applied to {stats.applicationsCount} job{stats.applicationsCount !== 1 ? "s" : ""}. 
                              Keep browsing and applying to find your next opportunity.
                            </p>
                          </div>
                          <button
                            className="dashboard-primary-button"
                            onClick={() => navigate("/jobs")}
                          >
                            Browse More Jobs
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}

          {/* CLIENT CTA LOGIC */}
          {stats.role === "client" && (
            <>
              {/* Priority 1: Active client with open positions */}
              {stats.openPositions > 0 ? (
                <div className="dashboard-primary-card">
                  <div className="dashboard-primary-text">
                    <h3>Manage Open Jobs</h3>
                    <p>
                      You have {stats.openPositions} open position{stats.openPositions !== 1 ? "s" : ""} 
                      {" "}receiving applications. Review applicants and manage your jobs.
                    </p>
                  </div>
                  <button
                    className="dashboard-primary-button"
                    onClick={() => navigate("/my-jobs")}
                  >
                    Manage Open Jobs
                  </button>
                </div>
              ) : (
                <>
                  {/* Priority 2: First-time client: No jobs posted yet */}
                  {stats.jobsPosted === 0 ? (
                    <div className="dashboard-primary-card">
                      <div className="dashboard-primary-text">
                        <h3>Post Your First Job</h3>
                        <p>
                          Get started by posting your first job and connecting with skilled workers.
                        </p>
                      </div>
                      <button
                        className="dashboard-primary-button"
                        onClick={() => navigate("/post-job")}
                      >
                        Post Your First Job
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Priority 3: Has hired workers but no open positions */}
                      {stats.hiresMade > 0 ? (
                        <div className="dashboard-primary-card">
                          <div className="dashboard-primary-text">
                            <h3>View Hired Workers</h3>
                            <p>
                              You&apos;ve successfully hired {stats.hiresMade} worker{stats.hiresMade !== 1 ? "s" : ""}. 
                              Manage your active jobs and completed projects.
                            </p>
                          </div>
                          <button
                            className="dashboard-primary-button"
                            onClick={() => navigate("/my-jobs")}
                          >
                            View Hired Workers
                          </button>
                        </div>
                      ) : (
                        /* Priority 4: Has jobs but no open positions or hires */
                        <div className="dashboard-primary-card">
                          <div className="dashboard-primary-text">
                            <h3>Post a New Job</h3>
                            <p>
                              All your jobs are currently filled or completed. Post a new job to find more workers.
                            </p>
                          </div>
                          <button
                            className="dashboard-primary-button"
                            onClick={() => navigate("/post-job")}
                          >
                            Post a New Job
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}

          {/* SECONDARY LAYOUT: simple overview + helper copy */}
          <div className="dashboard-secondary-grid">
            <div className="dashboard-secondary-card">
              <h3>At a glance</h3>
              {stats.role === "worker" ? (
                <ul>
                  <li>
                    <span className="dot" /> You&apos;ve applied to{" "}
                    <strong>{stats.applicationsCount || 0}</strong> job
                    {stats.applicationsCount !== 1 ? "s" : ""}.
                  </li>
                  <li>
                    <span className="dot" />{" "}
                    <strong>{stats.acceptedJobs || 0}</strong> active job
                    {stats.acceptedJobs !== 1 ? "s" : ""} in progress.
                  </li>
                  <li>
                    <span className="dot" />{" "}
                    <strong>{stats.completedJobs || 0}</strong> completed job
                    {stats.completedJobs !== 1 ? "s" : ""} in your history.
                  </li>
                </ul>
              ) : (
                <ul>
                  <li>
                    <span className="dot" /> You&apos;ve posted{" "}
                    <strong>{stats.jobsPosted || 0}</strong> job
                    {stats.jobsPosted !== 1 ? "s" : ""}.
                  </li>
                  <li>
                    <span className="dot" />{" "}
                    <strong>{stats.openPositions || 0}</strong> open position
                    {stats.openPositions !== 1 ? "s" : ""} receiving applications.
                  </li>
                  <li>
                    <span className="dot" />{" "}
                    <strong>{stats.completedJobs || 0}</strong> completed job
                    {stats.completedJobs !== 1 ? "s" : ""} so far.
                  </li>
                </ul>
              )}
            </div>

            <div className="dashboard-secondary-card tips">
              <h3>Tips</h3>
              {stats.role === "worker" ? (
                <p>
                  Keep your profile up to date and apply to roles that closely match your
                  skills and location to increase your chances of being selected.
                </p>
              ) : (
                <p>
                  Write clear job descriptions and respond quickly to applications to find
                  the right worker faster and keep your hiring pipeline moving.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
