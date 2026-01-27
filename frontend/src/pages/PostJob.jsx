import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../styles/PostJob.css";

export default function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await API.post("/jobs", form);
      navigate("/dashboard"); // after success
    } catch {
      setError("Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="postjob-container">
      <form className="postjob-card" onSubmit={handleSubmit}>
        <h2>Post a Job</h2>

        {error && <p className="error">{error}</p>}

        <input
          name="title"
          placeholder="Job Title"
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Job Description"
          rows="4"
          onChange={handleChange}
          required
        />

        <input
          name="location"
          placeholder="Location"
          onChange={handleChange}
          required
        />

        <button disabled={loading}>
          {loading ? "Posting..." : "Post Job"}
        </button>
      </form>
    </div>
  );
}
