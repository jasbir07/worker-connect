import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/jobs";
import PostJob from "./pages/PostJob";
import MyJobs from "./pages/MyJobs";
import MyApplications from "./pages/MyApplication";
import JobApplicants from "./pages/JobApplicants";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* ROOT */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* AUTH */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* PROTECTED */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <Jobs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/post-job"
            element={
              <ProtectedRoute>
                <PostJob />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-jobs"
            element={
              <ProtectedRoute>
                <MyJobs />
              </ProtectedRoute>
            }
          />
          <Route
  path="/my-applications"
  element={
    <ProtectedRoute>
      <MyApplications />
    </ProtectedRoute>
  }
/>
<Route
  path="/job/:jobId/applications"
  element={
    <ProtectedRoute>
      <JobApplicants />
    </ProtectedRoute>
  }
/>
<Route
  path="/chat/:roomId"
  element={
    <ProtectedRoute>
      <Chat />
    </ProtectedRoute>
  }
/>
<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
