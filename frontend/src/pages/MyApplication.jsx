import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../styles/Jobs.css";

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/jobs/my-applications")
      .then((res) => setApplications(res.data))
      .finally(() => setLoading(false));
  }, []);

  const openChat = async (jobId) => {
    try {
      const res = await API.get(`/chat/room/${jobId}`);
      navigate(`/chat/${res.data._id}`);
    } catch (error) {
      alert("Chat not available");
    }
  };

  if (loading) {
    return <p className="status-text">Loading applications...</p>;
  }

  return (
    <div className="jobs-container">
      <h2>My Applications</h2>

      {applications.length === 0 && <p>No applications yet.</p>}

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

            {/* CHAT UNLOCK ONLY IF ACCEPTED */}
            {app.status === "accepted" && (
              <button
                className="apply-btn"
                onClick={() => openChat(app.jobId._id)}
              >
                Open Chat
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
