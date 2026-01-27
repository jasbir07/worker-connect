import { useEffect, useState } from "react";
import API from "../api/axios";
import "../styles/Jobs.css";

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/jobs/my-applications")
      .then((res) => setApplications(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="status-text">Loading applications...</p>;
  }

  return (
    <div className="jobs-container">
      <h2>My Applications</h2>

      {applications.length === 0 && (
        <p>No applications yet.</p>
      )}

      <div className="jobs-grid">
        {applications.map((app) => (
          <div key={app._id} className="job-card">
            <h3>{app.jobId.title}</h3>
            <p className="location">{app.jobId.location}</p>
            <p className="desc">{app.jobId.description}</p>

            <p>
              Status:{" "}
              <strong
                style={{
                  color:
                    app.status === "accepted"
                      ? "green"
                      : app.status === "rejected"
                      ? "red"
                      : "#2563eb"
                }}
              >
                {app.status}
              </strong>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
