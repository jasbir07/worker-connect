import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import "../styles/Jobs.css";

export default function JobApplicants() {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    API.get(`/jobs/${jobId}/applications`).then((res) =>
      setApplications(res.data)
    );
  }, [jobId]);

  const updateStatus = async (applicationId, status) => {
    await API.patch(`/jobs/applications/${applicationId}`, { status });

    // Update UI immediately
    setApplications((prev) =>
      prev.map((app) =>
        app._id === applicationId ? { ...app, status } : app
      )
    );
  };

  return (
    <div className="jobs-container">
      <h2>Applicants</h2>

      {applications.length === 0 && <p>No applicants yet.</p>}

      <div className="jobs-grid">
        {applications.map((app) => (
          <div key={app._id} className="job-card">
            <h3>{app.workerId.name}</h3>
            <p>{app.workerId.email}</p>

            <p>
              Status: <strong>{app.status}</strong>
            </p>

            {/* SHOW BUTTONS ONLY IF STATUS IS "applied" */}
            {app.status === "applied" && (
              <div>
                <button
                  className="apply-btn"
                  onClick={() => updateStatus(app._id, "accepted")}
                >
                  Accept
                </button>

                <button
                  className="apply-btn"
                  style={{ background: "#dc2626", marginLeft: "10px" }}
                  onClick={() => updateStatus(app._id, "rejected")}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
