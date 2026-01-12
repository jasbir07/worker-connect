import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      login(res.data);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <h1>Worker-Connect</h1>
        <p>
          Connecting skilled workers with trusted clients.
          <br />
          Hire faster. Work smarter.
        </p>
      </div>

      <div className="login-right">
        <form className="login-card" onSubmit={handleSubmit}>
          <h2>Login to your account</h2>

          {error && <p className="error-text">{error}</p>}

          <label>Email</label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            onChange={handleChange}
            required
          />

          <button type="submit">Login</button>

          <p className="footer-text">
            Don’t have an account? <span>Register</span>
          </p>
        </form>
      </div>
    </div>
  );
}
