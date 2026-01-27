import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../styles/Jobs.css";

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/jobs/my-jobs").then((res) => setJobs(res.data));
  }, []);

  return (
    <div className="jobs-container">
      <h2>My Posted Jobs</h2>

      {jobs.length === 0 && <p>No jobs posted yet.</p>}

      <div className="jobs-grid">
        {jobs.map((job) => (
          <div key={job._id} className="job-card">
            <h3>{job.title}</h3>
            <p className="location">{job.location}</p>
            <p className="desc">{job.description}</p>

            <button
              className="apply-btn"
              onClick={() => navigate(`/job/${job._id}/applications`)}
            >
              View Applicants
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
