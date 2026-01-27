import { useEffect, useState } from "react";
import API from "../api/axios";
import "../styles/Jobs.css";

export default function MyApplications() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    API.get("/jobs/my-applications").then((res) =>
      setApplications(res.data)
    );
  }, []);

  return (
    <div className="jobs-container">
      <h2>My Applications</h2>

      {applications.length === 0 && <p>No applications yet.</p>}

      <div className="jobs-grid">
        {applications.map((app) => (
          <div key={app._id} className="job-card">
            <h3>{app.jobId.title}</h3>
            <p>{app.jobId.location}</p>
            <p className="desc">{app.jobId.description}</p>
            <strong>Status: {app.status || "Pending"}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
