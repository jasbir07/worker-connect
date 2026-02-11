import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../styles/Register.css";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "worker"
  });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", form);
      navigate("/login"); // 👈 AFTER REGISTER → LOGIN
    } catch {
      setError("Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h2 className="auth-title">Create an account</h2>
        <p className="auth-subtitle">
          Join Worker-Connect as a worker or client to get started.
        </p>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <div className="auth-field">
          <label htmlFor="name" className="auth-label">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Jane Doe"
            onChange={handleChange}
            required
            className={error ? "auth-input auth-input-error" : "auth-input"}
          />
        </div>

        <div className="auth-field">
          <label htmlFor="email" className="auth-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            onChange={handleChange}
            required
            className={error ? "auth-input auth-input-error" : "auth-input"}
          />
        </div>

        <div className="auth-field">
          <label htmlFor="password" className="auth-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Create a password"
            onChange={handleChange}
            required
            className={error ? "auth-input auth-input-error" : "auth-input"}
          />
          <p className="auth-helper-text">
            Use at least 8 characters with a mix of letters and numbers.
          </p>
        </div>

        <div className="auth-field">
          <label htmlFor="role" className="auth-label">
            I am a
          </label>
          <select
            id="role"
            name="role"
            onChange={handleChange}
            value={form.role}
            className="auth-input"
          >
            <option value="worker">Worker</option>
            <option value="client">Client</option>
          </select>
        </div>

        <button type="submit" className="auth-button">
          Create account
        </button>

        <p className="auth-link-text">
          Already have an account?{" "}
          <button
            type="button"
            className="auth-link-button"
            onClick={() => navigate("/login")}
          >
            Log in
          </button>
        </p>
      </form>
    </div>
  );
}
