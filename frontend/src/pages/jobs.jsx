import { useEffect, useState } from "react";
import API from "../api/axios";
import "../styles/Jobs.css";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

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

  const uniqueLocations = Array.from(
    new Set(jobs.map((job) => job.location).filter(Boolean))
  );

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      searchTerm.trim().length === 0 ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || job.status === statusFilter;

    const matchesLocation =
      locationFilter === "all" || job.location === locationFilter;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  if (loading) {
    return <p className="status-text">Loading jobs...</p>;
  }

  if (error) {
    return <p className="status-text error">{error}</p>;
  }

  return (
    <div className="jobs-container">
      <div className="jobs-header">
        <div>
          <h2 className="jobs-title">Available jobs</h2>
          <p className="jobs-subtitle">
            Browse open roles and apply to opportunities that match your skills.
          </p>
        </div>
      </div>

      <div className="jobs-filters">
        <div className="jobs-filters-row">
          <div className="jobs-filter-group">
            <label htmlFor="search" className="jobs-filter-label">
              Search
            </label>
            <input
              id="search"
              type="text"
              className="jobs-filter-input"
              placeholder="Search by title, description, or location"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="jobs-filter-group">
            <label htmlFor="status" className="jobs-filter-label">
              Status
            </label>
            <select
              id="status"
              className="jobs-filter-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="jobs-filter-group">
            <label htmlFor="location" className="jobs-filter-label">
              Location
            </label>
            <select
              id="location"
              className="jobs-filter-input"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="all">All</option>
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredJobs.length === 0 && (
        <p className="status-text">
          No jobs found. Try adjusting your filters or search terms.
        </p>
      )}

      <div className="jobs-grid">
        {filteredJobs.map((job) => {
          const isApplied = appliedJobIds.includes(job._id.toString());

          return (
            <div key={job._id} className="job-card">
              <div className="job-header">
                <div>
                  <h3 className="job-title">{job.title}</h3>
                  <p className="job-location">{job.location}</p>
                </div>
                <span
                  className={`job-status-badge status-${job.status || "open"}`}
                >
                  {job.status === "in-progress"
                    ? "In Progress"
                    : job.status === "completed"
                    ? "Completed"
                    : job.status === "cancelled"
                    ? "Cancelled"
                    : "Open"}
                </span>
              </div>

              <p className="job-budget">
                <span>Budget:</span> <span className="job-budget-value">—</span>
              </p>

              <p className="job-description">{job.description}</p>

              <div className="job-footer">
                <button
                  className="apply-btn"
                  disabled={isApplied || job.status !== "open"}
                  onClick={() => handleApply(job._id)}
                >
                  {isApplied
                    ? "Applied"
                    : job.status === "in-progress" || job.status === "completed" || job.status === "cancelled"
                    ? "Not Available"
                    : "Apply"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
