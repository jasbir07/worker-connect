import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>Worker-Connect</h2>
        <button onClick={() => navigate("/jobs")}>Jobs</button>

        {user?.role === "client" && (
          <button onClick={() => navigate("/post-job")}>
            Post Job
          </button>
        )}

        <button className="logout" onClick={() => { logout(); navigate("/"); }}>
          Logout
        </button>
      </aside>

      <main className="main">
        <h1>Dashboard</h1>
        <div className="card">
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Role:</strong> {user?.role}</p>
          <p>Welcome to Worker-Connect.</p>
        </div>
      </main>
    </div>
  );
}
