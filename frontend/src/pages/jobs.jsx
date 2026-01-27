import { useEffect, useState } from "react";
import API from "../api/axios";
import "../styles/Jobs.css";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [jobsRes, appliedRes] = await Promise.all([
          API.get("/jobs"),
          API.get("/jobs/applied")
        ]);

        // jobs list
        setJobs(jobsRes.data);

        // IMPORTANT: applied job ids must be strings
        setAppliedJobIds(appliedRes.data.map(id => id.toString()));
      } catch (err) {
        console.error(err);
        setError("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleApply = async (jobId) => {
    try {
      await API.post(`/jobs/${jobId}/apply`);

      // add jobId as STRING to state
      setAppliedJobIds(prev => [...prev, jobId.toString()]);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  if (loading) {
    return <p className="status-text">Loading jobs...</p>;
  }

  if (error) {
    return <p className="status-text error">{error}</p>;
  }

  return (
    <div className="jobs-container">
      <h2>Available Jobs</h2>

      {jobs.length === 0 && (
        <p className="status-text">No jobs available.</p>
      )}

      <div className="jobs-grid">
        {jobs.map((job) => {
          const isApplied = appliedJobIds.includes(job._id.toString());

          return (
            <div key={job._id} className="job-card">
              <h3>{job.title}</h3>
              <p className="location">{job.location}</p>
              <p className="desc">{job.description}</p>

              <button
                className="apply-btn"
                disabled={isApplied}
                onClick={() => handleApply(job._id)}
              >
                {isApplied ? "Applied" : "Apply"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
