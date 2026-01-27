import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../styles/Jobs.css";

export default function JobApplicants() {
  const { jobId } = useParams();
  const navigate = useNavigate();
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

  const openChat = async () => {
    try {
      const res = await API.get(`/chat/room/${jobId}`);
      navigate(`/chat/${res.data._id}`);
    } catch (error) {
      alert("Chat not available yet");
    }
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

            {/* ACCEPT / REJECT — only when applied */}
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

            {/* CHAT — only when accepted */}
            {app.status === "accepted" && (
              <button
                className="apply-btn"
                onClick={openChat}
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
